import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket } from "../services/socket";
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

const defaultContentTemplate = "{name}\nđã donate {amount} đồng cho bạn.\n{message}";

const DonateOverlayPage = ({
    previewMode = false,
    previewVisible = true,
    previewDonation = defaultPreviewDonation,
    previewConfig,
    previewImage
}: DonateOverlayPageProps) => {
    const { streamerId } = useParams();

    const [queue, setQueue] = useState<OverlayDonationData[]>([]);
    const [current, setCurrent] = useState<OverlayDonationData | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (previewMode || !streamerId) return;

        const disconnect = connectSocket(Number(streamerId), (data) => {
            setQueue((prev) => [...prev, data]);
        });

        return () => disconnect();
    }, [previewMode, streamerId]);

    useEffect(() => {
        if (previewMode) return;
        if (!current && queue.length > 0) {
            const next = queue[0];
            setQueue((prev) => prev.slice(1));
            setCurrent(next);
            setVisible(true);

            setTimeout(() => {
                setVisible(false);
                setTimeout(() => {
                    setCurrent(null);
                }, 500);
            }, 4000);
        }
    }, [previewMode, queue, current]);

    const overlayItem = previewMode ? previewDonation : current;
    const shouldRender = previewMode ? previewVisible : visible;

    const positionClass = useMemo(() => {
        const position = previewConfig?.alert?.position ?? "center";
        return `donate-overlay--${position}`;
    }, [previewConfig?.alert?.position]);

    const renderTemplate = (template: string, item: OverlayDonationData) => {
        const tokenRegex = /(\{name\}|\{amount\}|\{message\})/g;

        return template.split("\n").map((line, lineIndex) => {
            const parts = line.split(tokenRegex).filter(Boolean);

            return (
                <span key={lineIndex} className="overlay-template-line">
                    {parts.map((part, partIndex) => {
                        if (part === "{name}") {
                            return (
                                <span key={`${lineIndex}-${partIndex}`} style={{ color: previewConfig?.style?.colors?.text }}>
                                    {item.donorName}
                                </span>
                            );
                        }

                        if (part === "{amount}") {
                            return (
                                <span key={`${lineIndex}-${partIndex}`} style={{ color: previewConfig?.style?.colors?.amount }}>
                                    {item.amount}
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

    const contentTemplate = previewConfig?.alert?.content || "{name}\n\u0111\u00e3 donate {amount} \u0111\u1ed3ng cho b\u1ea1n.\n{message}";
    const overlayBackground = previewConfig?.style?.colors?.background;

    if (!overlayItem || !shouldRender) return null;

    return (
        <div className={`donate-overlay ${previewMode ? "donate-overlay--preview" : ""} ${positionClass}`}>
            <div
                className="overlay-content"
                style={{
                    background: overlayBackground && overlayBackground !== "transparent"
                        ? `${overlayBackground}E6`
                        : "transparent",
                    borderColor: overlayBackground === "transparent"
                        ? "rgba(255, 255, 255, 0.08)"
                        : undefined,
                    boxShadow: overlayBackground === "transparent"
                        ? "none"
                        : undefined
                }}
            >
                <div className="overlay-image">
                    <img src={previewImage || "/images/animations/anhdong.gif"} alt="donate" />
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
