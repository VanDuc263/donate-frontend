import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getObsSetting } from "../features/streamer/streamerApi";
import FptTtsPlayer, { FptTtsPlayerHandle } from "./profile/FptTtsPlayer";
import {
    defaultObsConfig,
    defaultPreviewDonation,
    getImageUrlByAssetId,
    getSoundUrlFromConfig,
    mergeObsConfig,
    ObsConfig,
    OverlayDonationData,
    OverlayPreviewConfig
} from "./profile/donateObsShared";
import { subscribeDonate } from "../services/socket";
import "../styles/donate_overlay.css";

type DonateOverlayPageProps = {
    previewMode?: boolean;
    previewVisible?: boolean;
    previewDonation?: OverlayDonationData;
    previewConfig?: OverlayPreviewConfig;
    previewImage?: string;
};

type QueueItem = OverlayDonationData & {
    id: number;
};

const DEFAULT_TEMPLATE = "{name}\nđã donate {amount} đồng cho bạn.\n{message}";
const SILENT_AUDIO_DATA_URI =
    "data:audio/mp3;base64,SUQzAwAAAAAAF1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//uQxAADBzQAUUAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const parseAmount = (amount: number | string) => {
    if (typeof amount === "number") {
        return amount;
    }

    const normalized = String(amount).replace(/[^\d]/g, "");
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatAmountForTts = (amount: number) => {
    if (amount >= 1000000) {
        const millions = amount / 1000000;
        return `${millions}`.replace(".", ",") + " triệu";
    }

    if (amount >= 1000) {
        const thousands = amount / 1000;
        return `${thousands}`.replace(".", ",") + " nghìn";
    }

    return `${amount}`;
};

const buildTtsText = (template: string, item: OverlayDonationData) => {
    const spokenAmount = formatAmountForTts(parseAmount(item.amount));
    const spokenMessage = (item.message || "")
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/\s+/g, " ")
        .trim();

    return template
        .replaceAll("{name}", item.donorName)
        .replaceAll("{amount}", spokenAmount)
        .replaceAll("{message}", spokenMessage)
        .replace(/\n+/g, ". ")
        .replace(/\s+/g, " ")
        .trim();
};

const DonateOverlayPage = ({
    previewMode = false,
    previewVisible = true,
    previewDonation = defaultPreviewDonation,
    previewConfig,
    previewImage
}: DonateOverlayPageProps) => {
    const { streamerId } = useParams<{ streamerId: string }>();

    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [current, setCurrent] = useState<QueueItem | null>(null);
    const [visible, setVisible] = useState(false);
    const [runtimeConfig, setRuntimeConfig] = useState<ObsConfig>(() =>
        previewConfig ? mergeObsConfig(previewConfig as Partial<ObsConfig>) : defaultObsConfig
    );

    const nextIdRef = useRef(1);
    const currentRef = useRef<QueueItem | null>(null);
    const hideTimerRef = useRef<number | null>(null);
    const clearTimerRef = useRef<number | null>(null);
    const fptTtsRef = useRef<FptTtsPlayerHandle | null>(null);
    const soundAudioRef = useRef<HTMLAudioElement | null>(null);

    const clearHideTimers = useCallback(() => {
        if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        if (clearTimerRef.current) {
            window.clearTimeout(clearTimerRef.current);
            clearTimerRef.current = null;
        }
    }, []);

    const resetCurrentAlert = useCallback(() => {
        clearHideTimers();
        fptTtsRef.current?.stop();
        currentRef.current = null;
        setVisible(false);
        setCurrent(null);
    }, [clearHideTimers]);

    const scheduleHideForAlert = useCallback((alertId: number, delayMs: number) => {
        clearHideTimers();

        hideTimerRef.current = window.setTimeout(() => {
            if (currentRef.current?.id !== alertId) {
                return;
            }

            setVisible(false);

            clearTimerRef.current = window.setTimeout(() => {
                if (currentRef.current?.id !== alertId) {
                    return;
                }

                currentRef.current = null;
                setCurrent(null);
            }, 500);
        }, delayMs);
    }, [clearHideTimers]);

    useEffect(() => {
        if (!previewMode) return;

        setRuntimeConfig(mergeObsConfig(previewConfig as Partial<ObsConfig>));
    }, [previewConfig, previewMode]);

    useEffect(() => {
        const audio = new Audio(SILENT_AUDIO_DATA_URI);
        audio.preload = "auto";
        audio.muted = true;
        soundAudioRef.current = audio;

        const primeAudio = async () => {
            try {
                await audio.play();
                audio.pause();
                audio.currentTime = 0;
            } catch {
                // Browser source may still require autoplay permission.
            } finally {
                audio.muted = false;
            }
        };

        void primeAudio();

        return () => {
            audio.pause();
            soundAudioRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (previewMode) return;

        const fetchConfig = async () => {
            try {
                const response = await getObsSetting();
                const data = response.data?.config || {};
                setRuntimeConfig(mergeObsConfig(data));
            } catch (error) {
                console.error("[Overlay] Failed to load OBS settings:", error);
                setRuntimeConfig(defaultObsConfig);
            }
        };

        void fetchConfig();
    }, [previewMode, streamerId]);

    useEffect(() => {
        if (previewMode) return;

        if (!streamerId) {
            console.warn("[Overlay] Missing streamerId in URL");
            return;
        }

        const id = Number(streamerId);

        if (Number.isNaN(id)) {
            console.warn("[Overlay] Invalid streamerId:", streamerId);
            return;
        }

        const unsubscribe = subscribeDonate(id, (data: any) => {
            const amount = data.amount || 0;

            if (parseAmount(amount) < (runtimeConfig.tts.min_amount ?? 0)) {
                return;
            }

            const item: QueueItem = {
                id: nextIdRef.current++,
                donorName: data.donorName || data.name || "Ẩn danh",
                amount,
                message: data.message || ""
            };

            setQueue((prev) => [...prev, item]);
        });

        return () => {
            unsubscribe?.();
        };
    }, [previewMode, streamerId, runtimeConfig.tts.min_amount]);

    const formatAmount = (amount: number | string) => {
        const numberAmount = Number(amount);

        if (Number.isNaN(numberAmount)) return amount;

        return numberAmount.toLocaleString("vi-VN");
    };

    useEffect(() => {
        if (previewMode) return;
        if (current) return;
        if (queue.length === 0) return;

        const next = queue[0];
        const durationMs = Math.max(1, runtimeConfig.alert.duration || 1) * 1000;
        const alertId = next.id;

        setQueue((prev) => prev.slice(1));
        currentRef.current = next;
        setCurrent(next);
        setVisible(true);

        if (runtimeConfig.alert.sound.enabled) {
            const soundUrl = getSoundUrlFromConfig(runtimeConfig);

            if (soundUrl) {
                const audio = soundAudioRef.current ?? new Audio();
                soundAudioRef.current = audio;
                audio.pause();
                audio.src = soundUrl;
                audio.currentTime = 0;
                audio.volume = (runtimeConfig.alert.sound.volume ?? 80) / 100;
                audio.play().catch((error) => {
                    console.error("[Overlay] Failed to play sound:", error);
                });
            }
        }

        if (
            runtimeConfig.tts.enabled &&
            parseAmount(next.amount) >= (runtimeConfig.tts.min_amount ?? 0)
        ) {
            void fptTtsRef.current?.speak({
                enabled: true,
                text: buildTtsText(runtimeConfig.alert.content || DEFAULT_TEMPLATE, next),
                volume: runtimeConfig.tts.volume ?? 80
            }).then((playedToEnd) => {
                if (currentRef.current?.id !== alertId) {
                    return;
                }

                scheduleHideForAlert(alertId, playedToEnd ? 0 : durationMs);
            });
            return;
        }

        scheduleHideForAlert(alertId, durationMs);
    }, [previewMode, queue, runtimeConfig, current, scheduleHideForAlert]);

    useEffect(() => {
        return () => {
            resetCurrentAlert();
        };
    }, [resetCurrentAlert]);

    const overlayItem = previewMode ? previewDonation : current;
    const shouldRender = previewMode ? previewVisible : visible;

    const positionClass = useMemo(() => {
        const position = runtimeConfig.alert.position ?? "center";
        return `donate-overlay--${position}`;
    }, [runtimeConfig.alert.position]);

    const contentTemplate = runtimeConfig.alert.content || DEFAULT_TEMPLATE;
    const overlayBackground = runtimeConfig.style.colors.background;
    const selectedImage = previewImage || getImageUrlByAssetId(runtimeConfig.alert.image.asset_id);

    const renderTemplate = (template: string, item: OverlayDonationData) => {
        const tokenRegex = /(\{name\}|\{amount\}|\{message\})/g;

        return template.split("\n").map((line, lineIndex) => {
            const parts = line.split(tokenRegex).filter(Boolean);

            return (
                <span key={lineIndex} className="overlay-template-line">
                    {parts.map((part, partIndex) => {
                        if (part === "{name}") {
                            return (
                                <span
                                    key={`${lineIndex}-${partIndex}`}
                                    style={{
                                        color: runtimeConfig.style.colors.text,
                                        fontSize: runtimeConfig.style.font.name_size
                                    }}
                                >
                                    {item.donorName}
                                </span>
                            );
                        }

                        if (part === "{amount}") {
                            return (
                                <span
                                    key={`${lineIndex}-${partIndex}`}
                                    style={{ color: runtimeConfig.style.colors.amount }}
                                >
                                    {formatAmount(item.amount)}
                                </span>
                            );
                        }

                        if (part === "{message}") {
                            return (
                                <span
                                    key={`${lineIndex}-${partIndex}`}
                                    style={{
                                        color: runtimeConfig.style.colors.message,
                                        fontSize: runtimeConfig.style.font.message_size
                                    }}
                                >
                                    {item.message || ""}
                                </span>
                            );
                        }

                        return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
                    })}
                </span>
            );
        });
    };

    if (!overlayItem || !shouldRender) {
        return <FptTtsPlayer ref={fptTtsRef} />;
    }

    return (
        <>
            <FptTtsPlayer ref={fptTtsRef} />
            <div className={`donate-overlay ${previewMode ? "donate-overlay--preview" : ""} ${positionClass}`}>
                <div
                    className="overlay-content"
                    style={{
                        background:
                            overlayBackground && overlayBackground !== "transparent"
                                ? `${overlayBackground}E6`
                                : "transparent",
                        borderColor:
                            overlayBackground === "transparent"
                                ? "rgba(255, 255, 255, 0.08)"
                                : undefined,
                        boxShadow: overlayBackground === "transparent" ? "none" : undefined
                    }}
                >
                    {runtimeConfig.alert.image.enabled && (
                        <div className="overlay-image">
                            <img src={selectedImage} alt="donate" />
                        </div>
                    )}

                    <div className="overlay-text">
                        <p className="overlay-template">
                            {renderTemplate(contentTemplate, overlayItem)}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DonateOverlayPage;
export type { OverlayPreviewConfig, OverlayDonationData };
