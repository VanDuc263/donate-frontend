import React, {useEffect, useMemo, useState} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {getObsSetting, updateObsSetting} from "../../features/streamer/streamerApi";

type SectionTab = "content" | "image" | "sound";

const tagList = [
    "dit",
    "dm",
    "du",
    "deo",
    "dech",
    "dcm",
    "lon",
    "buoi",
    "cặc",
    "dai",
    "ia",
    "ut",
    "shit",
    "fuck",
    "dmm",
    "ml",
    "me may",
    "bo may",
    "con cặc",
    "thằng lồn",
];
const defaultConfig = {
    tts: { volume: 80, enabled: true, min_amount: 8000 },
    alert: {
        image: { enabled: true, asset_id: 2 },
        sound: { volume: 80, enabled: true, asset_id: 1 },
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
const soundItems = Array.from({ length: 19 }, (_, index) => `Sound ${index + 1}`);

const DonateObsSettings = () => {
    const streamer = useSelector((state: RootState) => state.auth.streamer);
    const token = streamer?.token || "ta_ziu_cg2jSvnfFVCVFQ";

    const [sectionTab, setSectionTab] = useState<SectionTab>("content");
    const [showRanking, setShowRanking] = useState(true);
    const [enableVoice, setEnableVoice] = useState(true);
    const [muteSpam, setMuteSpam] = useState(true);
    const [muteLinkText, setMuteLinkText] = useState(true);
    const [config, setConfig] = useState(defaultConfig)
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const baseLink = useMemo(
        () => `https://taziu.com/donate-message/${token}`,
        [token]
    );
    const [keywords, setKeywords] = useState<string[]>([]);
    const donateLink = baseLink;
    const onlyDonateLink = `${baseLink}?onlyType=donate`;

    const copyLink = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Clipboard can be blocked by browser permissions.
        }
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
                    ...data.alert
                },
                tts: {
                    ...defaultConfig.tts,
                    ...data.tts
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
        };

        fetchConfig();
    }, [streamer]);
    const handleSave = async () => {
        try {
            setLoading(true);
            setSaved(false);
            await updateObsSetting(config);


            setSaved(true);

            // auto tắt thông báo sau 2s
            setTimeout(() => setSaved(false), 2000);


        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="profile-content">
            <div className="profile-card obs-card">

                {/* HEADER */}
                <div className="obs-header">
                    <div>
                        <h2>Cài Đặt Donate</h2>
                        <p>Cài đặt hiển thị và các tùy chỉnh khác</p>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="obs-section-title">Xem trước hiển thị</div>
                <div className="obs-preview-shell">
                    <div className="obs-preview-stage">
                        <div className="obs-preview-card">
                            <img src="/images/anhdong.gif" alt="preview" />
                            <div>
                                <strong>Taziu</strong>
                                <p>đã donate 100.000 đ đồng cho bạn.</p>
                                <span>Hello streamer</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LINK */}
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

                {/* ACTION */}
                <div className="obs-action-row">
                    <button type="button" className="obs-secondary-btn">Đổi link</button>
                    <button type="button" className="obs-secondary-btn">Donate ảo</button>
                </div>

                {/* TAB */}
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
                        Hình Ảnh
                    </button>

                    <button
                        className={sectionTab === "sound" ? "active" : ""}
                        onClick={() => setSectionTab("sound")}
                    >
                        Âm Thanh
                    </button>
                </div>

                {/* CONTENT TAB */}
                {sectionTab === "content" && (
                    <div className="obs-content-grid">

                        {/* TEMPLATE */}
                        <div className="form-group obs-full">
                            <label>Nội dung hiển thị</label>
                            <input
                                value="{name} đã donate {amount} đồng cho bạn. {message}"
                                readOnly
                            />
                        </div>

                        {/* DURATION */}
                        <div className="form-group">
                            <label>Thời gian hiển thị (giây)</label>
                            <input
                                value={config?.alert?.duration ?? 0}
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

                        {/* FONT SIZE */}
                        <div className="form-group obs-range">
                            <label>Kích cỡ tên người dùng</label>
                            <input
                                type="range"
                                min="12"
                                max="36"
                                value={config?.style?.font?.name_size ?? 18}
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
                                value={config?.style?.font?.message_size ?? 16}
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

                        {/* POSITION */}
                        <div className="form-group">
                            <label>Vị trí xuất hiện</label>
                            <select
                                value={config?.alert?.position ?? "center"}
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

                        {/* COLORS */}
                        <div className="obs-color-row">
                            <div>
                                <span>Màu tên</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: config?.style?.colors?.text }} />
                                    <strong>{config?.style?.colors?.text}</strong>
                                </div>
                            </div>

                            <div>
                                <span>Màu số tiền</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: config?.style?.colors?.amount }} />
                                    <strong>{config?.style?.colors?.amount}</strong>
                                </div>
                            </div>

                            <div>
                                <span>Màu lời nhắn</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: config?.style?.colors?.message }} />
                                    <strong>{config?.style?.colors?.message}</strong>
                                </div>
                            </div>

                            <div>
                                <span>Màu nền</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: config?.style?.colors?.background }} />
                                    <strong>{config?.style?.colors?.background}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* IMAGE TAB */}
                {sectionTab === "image" && (
                    <div className="obs-image-grid">
                        <div className="obs-image-tile upload">
                            <span>Tải lên</span>
                        </div>

                        {Array.from({ length: 14 }).map((_, index) => (
                            <div
                                key={index}
                                className={`obs-image-tile ${index === 4 ? "selected" : ""}`}
                            >
                                <img src="/images/anhdong.gif" alt={`asset-${index}`} />
                            </div>
                        ))}
                    </div>
                )}

                {/* SOUND TAB */}
                {sectionTab === "sound" && (
                    <div className="obs-sound-grid">
                        <div className="obs-image-tile upload">
                            <span>Tải lên</span>
                        </div>

                        {soundItems.map((item, index) => (
                            <div
                                key={item}
                                className={`obs-sound-tile ${index === 2 ? "selected" : ""}`}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}

                {/* LEADERBOARD */}
                <div className="obs-section-title">Cài đặt khác</div>

                <div className="obs-toggle-list">
                    <div className="obs-toggle-row">
                        <span>Hiện bảng xếp hạng</span>
                        <button
                            className={`obs-toggle ${config?.leaderboard?.enabled ? "active" : ""}`}
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
                            value={config?.leaderboard?.min_amount ?? 0}
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
                        <label>Lọc từ khoá</label>
                        <div className="obs-tag-list">
                            {config?.filter?.keywords?.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TTS */}
                <div className="obs-section-title">Cài đặt giọng đọc</div>

                <div className="obs-toggle-list">
                    <div className="obs-toggle-row">
                        <span>Bật giọng đọc</span>
                        <button
                            className={`obs-toggle ${config?.tts?.enabled ? "active" : ""}`}
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
                        <input value={config?.tts?.min_amount ?? 0} readOnly />
                    </div>

                    <div className="form-group obs-range">
                        <label>Âm lượng</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config?.tts?.volume ?? 80}
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
