import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DonateOverlayPage, { OverlayPreviewConfig } from "../DonateOverlayPage";
import FptTtsPlayer, { FptTtsPlayerHandle } from "./FptTtsPlayer";
import { RootState } from "../../app/store";
import { getObsSetting, updateObsSetting } from "../../features/streamer/streamerApi";
import previewGif from "../../assets/images/animations/anhdong.gif";
import altPreviewGif from "../../assets/images/animations/image_01.gif";

declare const require: {
    context: (
        path: string,
        deep?: boolean,
        filter?: RegExp
    ) => {
        keys: () => string[];
        <T>(id: string): T;
    };
};

type SectionTab = "content" | "image" | "sound";

type BuiltInSoundOption = {
    id: number;
    label: string;
    url: string;
};

type ImageOption = {
    id: number;
    url: string;
};

const FIXED_ALERT_CONTENT_TEMPLATE = "{name}\n\u0111\u00e3 donate {amount} \u0111\u1ed3ng cho b\u1ea1n.\n{message}";

type ObsConfig = OverlayPreviewConfig & {
    tts: {
        volume: number;
        enabled: boolean;
        min_amount: number;
    };
    alert: {
        image: {
            enabled: boolean;
            asset_id: number;
        };
        sound: {
            volume: number;
            enabled: boolean;
            asset_id: number;
            custom_name?: string;
            custom_url?: string;
        };
        content: string;
        duration: number;
        position: string;
    };
    style: {
        font: {
            name_size: number;
            message_size: number;
        };
        colors: {
            text: string;
            amount: string;
            message: string;
            background: string;
        };
    };
    filter: {
        link: boolean;
        spam: boolean;
        keywords: string[];
    };
    leaderboard: {
        enabled: boolean;
        min_amount: number;
    };
};

const defaultConfig: ObsConfig = {
    tts: { volume: 80, enabled: true, min_amount: 8000 },
    alert: {
        image: { enabled: true, asset_id: 2 },
        sound: { volume: 80, enabled: true, asset_id: 1, custom_name: "", custom_url: "" },
        content: "{name}\nđã donate {amount} đồng cho bạn.\n{message}",
        duration: 10,
        position: "center"
    },
    style: {
        font: { name_size: 18, message_size: 16 },
        colors: {
            text: "#7dd3fc",
            amount: "#facc15",
            message: "#e5e7eb",
            background: "#020617"
        }
    },
    filter: { link: true, spam: true, keywords: [] },
    leaderboard: { enabled: true, min_amount: 5000 }
};

const soundContext = require.context("../../assets/images/sounds", false, /\.(mp3|wav|ogg|m4a)$/);
const builtInSoundOptions: BuiltInSoundOption[] = soundContext
    .keys()
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((filePath, index) => ({
        id: index + 1,
        label: filePath.replace("./", "").replace(/\.[^.]+$/, ""),
        url: soundContext<string>(filePath)
    }));

const imageOptions: ImageOption[] = [
    { id: 1, url: previewGif },
    { id: 2, url: altPreviewGif }
];

const DonateObsSettings = () => {
    const streamer = useSelector((state: RootState) => state.auth.streamer);
    const token = streamer?.token || "ta_ziu_cg2jSvnfFVCVFQ";

    const [sectionTab, setSectionTab] = useState<SectionTab>("content");
    const [config, setConfig] = useState<ObsConfig>(defaultConfig);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [soundError, setSoundError] = useState("");
    const [previewVisible, setPreviewVisible] = useState(true);
    const [previewReplayKey, setPreviewReplayKey] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const previewTimeoutRef = useRef<number | null>(null);
    const fptTtsRef = useRef<FptTtsPlayerHandle | null>(null);

    const baseLink = useMemo(() => `https://taziu.com/donate-message/${token}`, [token]);
    const donateLink = baseLink;
    const onlyDonateLink = `${baseLink}?onlyType=donate`;

    const previewDonation = {
        donorName: "Taziu",
        amount: "100.000",
        message: "Hello streamer"
    };
    const previewAmountNumber = 100000;
    const customSoundSelected =
        config.alert.sound.asset_id === 0 && Boolean(config.alert.sound.custom_url);
    const selectedImage =
        imageOptions.find((item) => item.id === config.alert.image.asset_id)?.url || imageOptions[0].url;

    useEffect(() => {
        setConfig((prev) => ({
            ...prev,
            alert: {
                ...prev.alert,
                content: normalizeAlertContent(prev.alert.content || FIXED_ALERT_CONTENT_TEMPLATE)
            }
        }));
    }, []);

    const copyLink = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Clipboard can be blocked by browser permissions.
        }
    };

    const formatAmountForTts = (amount: number) => {
        if (amount >= 1000000) {
            const millions = amount / 1000000;
            return `${millions}`.replace(".", ",") + " tri\u1ec7u";
        }

        if (amount >= 1000) {
            const thousands = amount / 1000;
            return `${thousands}`.replace(".", ",") + " ngh\u00ecn";
        }

        return `${amount}`;
    };

    const buildCleanVietnameseTtsText = () => {
        const spokenAmount = formatAmountForTts(previewAmountNumber);
        const spokenMessage = (previewDonation.message || "")
            .replace(/https?:\/\/\S+/gi, "")
            .replace(/\s+/g, " ")
            .trim();
        const template = config.alert.content || FIXED_ALERT_CONTENT_TEMPLATE;

        return template
            .replaceAll("{name}", previewDonation.donorName)
            .replaceAll("{amount}", spokenAmount)
            .replaceAll("{message}", spokenMessage)
            .replace(/\n+/g, ". ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const normalizeAlertContent = (value?: string) => {
        const lines = (value || "")
            .split(/\r?\n/)
            .map((line) => line.trim());

        const normalizedLines = [
            lines[0] || "{name}",
            lines[1] || "\u0111\u00e3 donate {amount} \u0111\u1ed3ng cho b\u1ea1n.",
            lines[2] || "{message}"
        ];

        return normalizedLines.join("\n");
    };

    const formatAmountForSpeech = (amount: number) => {
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

    const buildVietnameseTtsText = () => {
        const spokenAmount = `${formatAmountForSpeech(previewAmountNumber)} đồng`;

        const spokenMessage = (previewDonation.message || "")
            .replace(/https?:\/\/\S+/gi, "")
            .replace(/\s+/g, " ")
            .trim();

        if (spokenMessage) {
            return `${previewDonation.donorName} vá»«a donate ${spokenAmount}. Lá»i nháº¯n: ${spokenMessage}`;
        }

        return `${previewDonation.donorName} vá»«a donate ${spokenAmount}.`;
    };

    useEffect(() => {
        const fetchConfig = async () => {
            const response = await getObsSetting();
            const data = response.data?.config || {};

            setConfig({
                ...defaultConfig,
                ...data,
                alert: {
                    ...defaultConfig.alert,
                    ...data.alert,
                    image: {
                        ...defaultConfig.alert.image,
                        ...data.alert?.image
                    },
                    sound: {
                        ...defaultConfig.alert.sound,
                        ...data.alert?.sound
                    },
                    content: normalizeAlertContent(data.alert?.content || FIXED_ALERT_CONTENT_TEMPLATE)
                },
                tts: {
                    ...defaultConfig.tts,
                    ...data.tts
                },
                style: {
                    ...defaultConfig.style,
                    ...data.style,
                    font: {
                        ...defaultConfig.style.font,
                        ...data.style?.font
                    },
                    colors: {
                        ...defaultConfig.style.colors,
                        ...data.style?.colors
                    }
                },
                filter: {
                    ...defaultConfig.filter,
                    ...data.filter
                },
                leaderboard: {
                    ...defaultConfig.leaderboard,
                    ...data.leaderboard
                }
            });
            setSoundError("");
        };

        fetchConfig();
    }, [streamer]);

    const handleSave = async () => {
        try {
            setLoading(true);
            setSaved(false);
            await updateObsSetting(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const previewSound = (url?: string) => {
        if (!url) {
            setSoundError("Không tìm thấy file âm thanh.");
            return;
        }

        const audio = new Audio(url);
        audio.volume = (config.alert.sound.volume ?? 80) / 100;
        audio.play().catch(() => {
            setSoundError("Trình duyệt đang chặn phát âm thanh tự động.");
        });
    };

    const readFileAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                    return;
                }

                reject(new Error("Invalid file data"));
            };
            reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("audio/")) {
            setSoundError("Chỉ chấp nhận file âm thanh.");
            e.target.value = "";
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setSoundError("File âm thanh phải nhỏ hơn 5MB.");
            e.target.value = "";
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(selectedFile);

            setConfig((prev) => ({
                ...prev,
                alert: {
                    ...prev.alert,
                    sound: {
                        ...prev.alert.sound,
                        asset_id: 0,
                        custom_name: selectedFile.name,
                        custom_url: dataUrl
                    }
                }
            }));
            setSoundError("");
            previewSound(dataUrl);
        } catch (err) {
            console.error(err);
            setSoundError("Không thể đọc file âm thanh.");
        } finally {
            e.target.value = "";
        }
    };

    const selectBuiltInSound = (sound: BuiltInSoundOption) => {
        setConfig((prev) => ({
            ...prev,
            alert: {
                ...prev.alert,
                sound: {
                    ...prev.alert.sound,
                    asset_id: sound.id,
                    custom_name: "",
                    custom_url: ""
                }
            }
        }));
        setSoundError("");
        previewSound(sound.url);
    };

    const selectImage = (imageId: number) => {
        setConfig((prev) => ({
            ...prev,
            alert: {
                ...prev.alert,
                image: {
                    ...prev.alert.image,
                    asset_id: imageId
                }
            }
        }));
    };

    const getSelectedSoundUrl = () => {
        if (customSoundSelected) {
            return config.alert.sound.custom_url;
        }

        return builtInSoundOptions.find((sound) => sound.id === config.alert.sound.asset_id)?.url;
    };

    const triggerFakeDonate = () => {
        if (previewTimeoutRef.current) {
            window.clearTimeout(previewTimeoutRef.current);
        }

        setPreviewVisible(false);

        window.setTimeout(() => {
            setPreviewReplayKey((prev) => prev + 1);
            setPreviewVisible(true);

            if (config.alert.sound.enabled) {
                previewSound(getSelectedSoundUrl());
            }

            if (config.tts.enabled && previewAmountNumber >= (config.tts.min_amount ?? 0)) {
                void fptTtsRef.current?.speak({
                    enabled: true,
                    text: buildCleanVietnameseTtsText(),
                    volume: config.tts.volume ?? 80
                });
            }

            previewTimeoutRef.current = window.setTimeout(() => {
                setPreviewVisible(false);
            }, Math.max(1, config.alert.duration || 1) * 1000);
        }, 20);
    };

    useEffect(() => {
        return () => {
            if (previewTimeoutRef.current) {
                window.clearTimeout(previewTimeoutRef.current);
            }
        };
    }, []);

    const updateColor = (key: keyof ObsConfig["style"]["colors"], value: string) => {
        setConfig((prev) => ({
            ...prev,
            style: {
                ...prev.style,
                colors: {
                    ...prev.style.colors,
                    [key]: value
                }
            }
        }));
    };

    return (
        <div className="profile-content">
            <FptTtsPlayer
                ref={fptTtsRef}
                onError={setSoundError}
            />
            <div className="profile-card obs-card">
                <div className="obs-header">
                    <div>
                        <h2>Cài Đặt Donate</h2>
                        <p>Cài đặt hiển thị và các tùy chỉnh khác</p>
                    </div>
                </div>

                <div className="obs-section-title">Xem trước hiển thị</div>
                <div className="obs-preview-shell">
                    <div className="obs-preview-stage">
                        <DonateOverlayPage
                            key={previewReplayKey}
                            previewMode
                            previewVisible={previewVisible}
                            previewConfig={config}
                            previewImage={selectedImage}
                            previewDonation={previewDonation}
                        />
                    </div>
                </div>

                <div className="obs-copy-grid">
                    <div className="obs-link-row">
                        <label>Link hiển thị (Tất cả)</label>
                        <div className="obs-link-input">
                            <input value={donateLink} readOnly />
                            <button onClick={() => copyLink(donateLink)}>Copy</button>
                        </div>
                    </div>

                    <div className="obs-link-row">
                        <label>Link hiển thị (Chỉ donate)</label>
                        <div className="obs-link-input">
                            <input value={onlyDonateLink} readOnly />
                            <button onClick={() => copyLink(onlyDonateLink)}>Copy</button>
                        </div>
                    </div>
                </div>

                <div className="obs-action-row">
                    <button type="button" className="obs-secondary-btn">Đổi link</button>
                    <button type="button" className="obs-secondary-btn" onClick={triggerFakeDonate}>Donate ảo</button>
                </div>

                <div className="obs-section-title">Cài đặt hiển thị</div>
                <div className="obs-tab-row">
                    <button
                        className={sectionTab === "content" ? "active" : ""}
                        onClick={() => setSectionTab("content")}
                    >
                        Nội dung
                    </button>

                    <button
                        className={sectionTab === "image" ? "active" : ""}
                        onClick={() => setSectionTab("image")}
                    >
                        Hình ảnh
                    </button>

                    <button
                        className={sectionTab === "sound" ? "active" : ""}
                        onClick={() => setSectionTab("sound")}
                    >
                        Âm thanh
                    </button>
                </div>

                {sectionTab === "content" && (
                    <div className="obs-content-grid">
                        <div className="form-group obs-full">
                            <label>Nội dung hiển thị</label>
                            <textarea
                                value={config.alert.content}
                                rows={4}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        alert: {
                                            ...config.alert,
                                            content: normalizeAlertContent(e.target.value)
                                        }
                                    })
                                }
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Thời gian hiển thị (giây)</label>
                            <input
                                value={config.alert.duration ?? 0}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        alert: {
                                            ...config.alert,
                                            duration: Number(e.target.value)
                                        }
                                    })
                                }
                            />
                        </div>

                        <div className="form-group obs-range">
                            <label>Kích cỡ tên người dùng</label>
                            <input
                                type="range"
                                min="12"
                                max="36"
                                value={config.style.font.name_size ?? 18}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        style: {
                                            ...config.style,
                                            font: {
                                                ...config.style.font,
                                                name_size: Number(e.target.value)
                                            }
                                        }
                                    })
                                }
                            />
                        </div>

                        <div className="form-group obs-range">
                            <label>Kích cỡ lời nhắn</label>
                            <input
                                type="range"
                                min="12"
                                max="32"
                                value={config.style.font.message_size ?? 16}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        style: {
                                            ...config.style,
                                            font: {
                                                ...config.style.font,
                                                message_size: Number(e.target.value)
                                            }
                                        }
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Vị trí xuất hiện</label>
                            <select
                                value={config.alert.position ?? "center"}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        alert: {
                                            ...config.alert,
                                            position: e.target.value
                                        }
                                    })
                                }
                            >
                                <option value="top">Trên cùng</option>
                                <option value="center">Giữa khung hình</option>
                                <option value="bottom">Dưới cùng</option>
                            </select>
                        </div>

                        <div className="obs-color-row">
                            <div className="obs-color-control">
                                <span>Màu tên</span>
                                <div className="obs-color-input">
                                    <input
                                        type="color"
                                        value={config.style.colors.text}
                                        onChange={(e) => updateColor("text", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={config.style.colors.text}
                                        onChange={(e) => updateColor("text", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="obs-color-control">
                                <span>Màu số tiền</span>
                                <div className="obs-color-input">
                                    <input
                                        type="color"
                                        value={config.style.colors.amount}
                                        onChange={(e) => updateColor("amount", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={config.style.colors.amount}
                                        onChange={(e) => updateColor("amount", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="obs-color-control">
                                <span>Màu lời nhắn</span>
                                <div className="obs-color-input">
                                    <input
                                        type="color"
                                        value={config.style.colors.message}
                                        onChange={(e) => updateColor("message", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={config.style.colors.message}
                                        onChange={(e) => updateColor("message", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="obs-color-control">
                                <span>Màu nền</span>
                                <div className="obs-color-input">
                                    <input
                                        type="color"
                                        value={config.style.colors.background === "transparent" ? "#020617" : config.style.colors.background}
                                        onChange={(e) => updateColor("background", e.target.value)}
                                        disabled={config.style.colors.background === "transparent"}
                                    />
                                    <input
                                        type="text"
                                        value={config.style.colors.background}
                                        onChange={(e) => updateColor("background", e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={`obs-transparent-btn ${config.style.colors.background === "transparent" ? "active" : ""}`}
                                    onClick={() =>
                                        updateColor(
                                            "background",
                                            config.style.colors.background === "transparent" ? "#020617" : "transparent"
                                        )
                                    }
                                >
                                    Trong suốt
                                </button>
                            </div>
                        </div>

                        <div className="form-group obs-full">
                            <label>Xem trước nội dung</label>
                            <div className="obs-template-help" style={{ whiteSpace: "pre-line" }}>
                                {config.alert.content
                                    .replaceAll("{name}", previewDonation.donorName)
                                    .replaceAll("{amount}", String(previewDonation.amount))
                                    .replaceAll("{message}", previewDonation.message || "")}
                                <small>Dùng được các biến: {"{name}"}, {"{amount}"}, {"{message}"}</small>
                            </div>
                        </div>
                    </div>
                )}

                {sectionTab === "image" && (
                    <div className="obs-image-grid">
                        {imageOptions.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`obs-image-tile ${config.alert.image.asset_id === item.id ? "selected" : ""}`}
                                onClick={() => selectImage(item.id)}
                            >
                                <img src={item.url} alt={`asset-${item.id}`} />
                            </button>
                        ))}
                    </div>
                )}

                {sectionTab === "sound" && (
                    <>
                        <div className="obs-sound-grid">
                            <button
                                type="button"
                                className={`obs-sound-upload ${customSoundSelected ? "selected" : ""}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <strong>{customSoundSelected ? "Đã chọn file riêng" : "Tải lên âm thanh"}</strong>
                                <span>{config.alert.sound.custom_name || "MP3, WAV, OGG, tối đa 5MB"}</span>
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioUpload}
                                hidden
                            />

                            {builtInSoundOptions.map((sound) => (
                                <button
                                    key={sound.id}
                                    type="button"
                                    className={`obs-sound-tile ${config.alert.sound.asset_id === sound.id ? "selected" : ""}`}
                                    onClick={() => selectBuiltInSound(sound)}
                                >
                                    {sound.label}
                                </button>
                            ))}
                        </div>

                        {soundError && (
                            <div className="obs-sound-meta">
                                <p>{soundError}</p>
                            </div>
                        )}
                    </>
                )}

                <div className="obs-section-title">Cài đặt khác</div>

                <div className="obs-toggle-list">
                    <div className="obs-toggle-row">
                        <span>Hiện bảng xếp hạng</span>
                        <button
                            className={`obs-toggle ${config.leaderboard.enabled ? "active" : ""}`}
                            onClick={() =>
                                setConfig({
                                    ...config,
                                    leaderboard: {
                                        ...config.leaderboard,
                                        enabled: !config.leaderboard.enabled
                                    }
                                })
                            }
                        />
                    </div>

                    <div className="form-group obs-inline">
                        <label>Số tiền tối thiểu</label>
                        <input
                            value={config.leaderboard.min_amount ?? 0}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    leaderboard: {
                                        ...config.leaderboard,
                                        min_amount: Number(e.target.value)
                                    }
                                })
                            }
                        />
                    </div>

                    <div className="form-group obs-tags">
                        <label>Lọc từ khóa</label>
                        <div className="obs-tag-list">
                            {config.filter.keywords.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="obs-section-title">Cài đặt giọng đọc</div>

                <div className="obs-toggle-list">
                    <div className="obs-toggle-row">
                        <span>Bật giọng đọc</span>
                        <button
                            className={`obs-toggle ${config.tts.enabled ? "active" : ""}`}
                            onClick={() =>
                                setConfig({
                                    ...config,
                                    tts: {
                                        ...config.tts,
                                        enabled: !config.tts.enabled
                                    }
                                })
                            }
                        />
                    </div>

                    <div className="form-group obs-inline">
                        <label>Số tiền tối thiểu để đọc</label>
                        <input value={config.tts.min_amount ?? 0} readOnly />
                    </div>

                    <div className="form-group obs-range">
                        <label>Âm lượng</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.tts.volume ?? 80}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    tts: {
                                        ...config.tts,
                                        volume: Number(e.target.value)
                                    }
                                })
                            }
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="btn-save obs-submit-btn"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? "Đang lưu..." : saved ? "Đã lưu ✓" : "Cập nhật"}
                </button>
            </div>
        </div>
    );
};

export default DonateObsSettings;
