import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { convertTextToSpeech } from "../../features/streamer/streamerApi";

type Props = {
    onError?: (message: string) => void;
};

export type FptTtsPlayerHandle = {
    speak: (params: { enabled: boolean; text: string; volume: number }) => Promise<boolean>;
    stop: () => void;
};

type FptTtsResponse = {
    async?: string;
    error?: number;
    message?: string;
    request_id?: string;
};

const POLL_INTERVAL_MS = 1200;
const MAX_POLL_ATTEMPTS = 10;
const AUDIO_READY_TIMEOUT_MS = 4000;
const SILENT_AUDIO_DATA_URI =
    "data:audio/mp3;base64,SUQzAwAAAAAAF1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//uQxAADBzQAUUAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const buildCacheBustedUrl = (url: string) => `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;

const waitUntilAudioReady = (audio: HTMLAudioElement, src: string) =>
    new Promise<void>((resolve, reject) => {
        let settled = false;
        let timeoutId = 0;

        const cleanup = () => {
            window.clearTimeout(timeoutId);
            audio.removeEventListener("canplaythrough", handleReady);
            audio.removeEventListener("loadeddata", handleReady);
            audio.removeEventListener("error", handleError);
        };

        const finish = (callback: () => void) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            callback();
        };

        const handleReady = () => finish(resolve);
        const handleError = () => finish(() => reject(new Error("File audio tu FPT chua san sang.")));

        audio.addEventListener("canplaythrough", handleReady, { once: true });
        audio.addEventListener("loadeddata", handleReady, { once: true });
        audio.addEventListener("error", handleError, { once: true });

        timeoutId = window.setTimeout(() => {
            finish(() => reject(new Error("Cho file audio tu FPT qua lau.")));
        }, AUDIO_READY_TIMEOUT_MS);

        audio.preload = "auto";
        audio.src = src;
        audio.load();
    });

const waitUntilPlaybackEnds = (audio: HTMLAudioElement) =>
    new Promise<void>((resolve, reject) => {
        let settled = false;

        const cleanup = () => {
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("abort", handleAbort);
            audio.removeEventListener("pause", handlePause);
        };

        const finish = (callback: () => void) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            callback();
        };

        const handleEnded = () => finish(resolve);
        const handleError = () => finish(() => reject(new Error("Phat audio FPT that bai.")));
        const handleAbort = () => finish(() => reject(new Error("Audio FPT bi huy.")));
        const handlePause = () => {
            if (audio.ended) {
                finish(resolve);
            }
        };

        audio.addEventListener("ended", handleEnded, { once: true });
        audio.addEventListener("error", handleError, { once: true });
        audio.addEventListener("abort", handleAbort, { once: true });
        audio.addEventListener("pause", handlePause);
    });

const FptTtsPlayer = forwardRef<FptTtsPlayerHandle, Props>(({ onError }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const requestRef = useRef(0);

    const stopCurrentAudio = () => {
        audioRef.current?.pause();
        audioRef.current = null;
    };

    useEffect(() => {
        return () => {
            requestRef.current += 1;
            stopCurrentAudio();
        };
    }, []);

    useImperativeHandle(ref, () => ({
        stop: () => {
            requestRef.current += 1;
            stopCurrentAudio();
        },
        speak: async ({ enabled, text, volume }) => {
            if (!enabled || !text.trim()) {
                return false;
            }

            const requestId = ++requestRef.current;

            try {
                onError?.("");
                stopCurrentAudio();

                const audio = new Audio(SILENT_AUDIO_DATA_URI);
                audio.preload = "auto";
                audio.muted = true;
                audioRef.current = audio;

                try {
                    await audio.play();
                    audio.pause();
                    audio.currentTime = 0;
                } catch {
                    // If priming fails, continue and try normal playback.
                }

                const response = await convertTextToSpeech({ text });
                const data = response.data as FptTtsResponse;

                if (data.error !== 0 || !data.async) {
                    throw new Error(data.message || "Backend chua tra ve file audio tu FPT.");
                }

                let audioReady = false;
                for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
                    if (requestId !== requestRef.current) {
                        return false;
                    }

                    try {
                        if (!audioRef.current) {
                            return false;
                        }

                        await waitUntilAudioReady(audioRef.current, buildCacheBustedUrl(data.async));
                        audioReady = true;
                        break;
                    } catch (probeError) {
                        if (attempt === MAX_POLL_ATTEMPTS - 1) {
                            throw probeError;
                        }
                    }

                    await wait(POLL_INTERVAL_MS);
                }

                if (!audioReady) {
                    throw new Error("File audio tu FPT chua san sang, vui long thu lai.");
                }

                if (requestId !== requestRef.current || !audioRef.current) {
                    return false;
                }

                audioRef.current.muted = false;
                audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
                audioRef.current.currentTime = 0;

                await audioRef.current.play();
                await waitUntilPlaybackEnds(audioRef.current);

                return requestId === requestRef.current;
            } catch (err) {
                console.error("[FPT TTS] error", err);

                if (requestId === requestRef.current) {
                    onError?.(
                        err instanceof Error ? err.message : "Khong the phat giong doc FPT."
                    );
                }

                return false;
            }
        }
    }), [onError]);

    return null;
});

FptTtsPlayer.displayName = "FptTtsPlayer";

export default FptTtsPlayer;
