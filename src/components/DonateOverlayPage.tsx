import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { subscribeDonate } from "../services/socket";
import "../styles/donate_overlay.css";

export type OverlayDonationData = {
    donorName: string;
    amount: number | string;
    message?: string | null;
};

export type OverlayPreviewConfig = {
    alert?: {
        position?: string;
        content?: string;
    };
    style?: {
        font?: {
            name_size?: number;
            message_size?: number;
        };
        colors?: {
            text?: string;
            amount?: string;
            message?: string;
            background?: string;
        };
    };
};

type DonateOverlayPageProps = {
    previewMode?: boolean;
    previewVisible?: boolean;
    previewDonation?: OverlayDonationData;
    previewConfig?: OverlayPreviewConfig;
    previewImage?: string;
};

const defaultPreviewDonation: OverlayDonationData = {
    donorName: "Taziu",
    amount: "100.000",
    message: "Hello streamer"
};

const DonateOverlayPage = ({
                               previewMode = false,
                               previewVisible = true,
                               previewDonation = defaultPreviewDonation,
                               previewConfig,
                               previewImage
                           }: DonateOverlayPageProps) => {
    const { streamerId } = useParams<{ streamerId: string }>();

    const [queue, setQueue] = useState<OverlayDonationData[]>([]);
    const [current, setCurrent] = useState<OverlayDonationData | null>(null);
    const [visible, setVisible] = useState(false);

    const hideTimerRef = useRef<number | null>(null);
    const clearTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (previewMode) return;

        console.log("[Overlay] route streamerId =", streamerId);

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
            console.log("[Overlay] Donate received:", data);

            setQueue((prev) => [
                ...prev,
                {
                    donorName: data.donorName || data.name || "Ẩn danh",
                    amount: data.amount || 0,
                    message: data.message || ""
                }
            ]);
        });

        return () => {
            console.log("[Overlay] Unsubscribe donate:", id);
            unsubscribe?.();
        };
    }, [previewMode, streamerId]);

    useEffect(() => {
        if (previewMode) return;
        if (current) return;
        if (queue.length === 0) return;

        const next = queue[0];

        setQueue((prev) => prev.slice(1));
        setCurrent(next);
        setVisible(true);

        if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
        }

        if (clearTimerRef.current) {
            window.clearTimeout(clearTimerRef.current);
        }

        hideTimerRef.current = window.setTimeout(() => {
            setVisible(false);

            clearTimerRef.current = window.setTimeout(() => {
                setCurrent(null);
            }, 500);
        }, 4000);

        return () => {
            if (hideTimerRef.current) {
                window.clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }

            if (clearTimerRef.current) {
                window.clearTimeout(clearTimerRef.current);
                clearTimerRef.current = null;
            }
        };
    }, [previewMode, queue, current]);

    const overlayItem = previewMode ? previewDonation : current;
    const shouldRender = previewMode ? previewVisible : visible;

    const positionClass = useMemo(() => {
        const position = previewConfig?.alert?.position ?? "center";
        return `donate-overlay--${position}`;
    }, [previewConfig?.alert?.position]);

    const contentTemplate =
        previewConfig?.alert?.content ||
        "{name}\nđã donate {amount} đồng cho bạn.\n{message}";

    const overlayBackground = previewConfig?.style?.colors?.background;

    const formatAmount = (amount: number | string) => {
        const numberAmount = Number(amount);

        if (Number.isNaN(numberAmount)) return amount;

        return numberAmount.toLocaleString("vi-VN");
    };

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
                                        color: previewConfig?.style?.colors?.text,
                                        fontSize: previewConfig?.style?.font?.name_size
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
                                    style={{
                                        color: previewConfig?.style?.colors?.amount
                                    }}
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
                                        color: previewConfig?.style?.colors?.message,
                                        fontSize: previewConfig?.style?.font?.message_size
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

    if (!overlayItem || !shouldRender) return null;

    return (
        <div
            className={`donate-overlay ${
                previewMode ? "donate-overlay--preview" : ""
            } ${positionClass}`}
        >
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
                    boxShadow:
                        overlayBackground === "transparent" ? "none" : undefined
                }}
            >
                <div className="overlay-image">
                    <img
                        src={previewImage || "/images/animations/anhdong.gif"}
                        alt="donate"
                    />
                </div>

                <div className="overlay-text">
                    <p className="overlay-template">
                        {renderTemplate(contentTemplate, overlayItem)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DonateOverlayPage;