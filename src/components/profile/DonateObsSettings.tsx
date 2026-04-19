import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

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

const soundItems = Array.from({ length: 19 }, (_, index) => `Sound ${index + 1}`);

const DonateObsSettings = () => {
    const streamer = useSelector((state: RootState) => state.auth.streamer);
    const token = streamer?.token || "ta_ziu_cg2jSvnfFVCVFQ";

    const [sectionTab, setSectionTab] = useState<SectionTab>("content");
    const [showRanking, setShowRanking] = useState(true);
    const [enableVoice, setEnableVoice] = useState(true);
    const [muteSpam, setMuteSpam] = useState(true);
    const [muteLinkText, setMuteLinkText] = useState(true);

    const baseLink = useMemo(
        () => `https://taziu.com/donate-message/${token}`,
        [token]
    );

    const donateLink = baseLink;
    const onlyDonateLink = `${baseLink}?onlyType=donate`;

    const copyLink = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Clipboard can be blocked by browser permissions.
        }
    };

    return (
        <div className="profile-content">
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

                <div className="obs-copy-grid">
                    <div className="obs-link-row">
                        <label>Link hiển thị (Tất cả)</label>
                        <div className="obs-link-input">
                            <input value={donateLink} readOnly />
                            <button type="button" onClick={() => copyLink(donateLink)}>
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="obs-link-row">
                        <label>Link hiển thị (Chỉ donate)</label>
                        <div className="obs-link-input">
                            <input value={onlyDonateLink} readOnly />
                            <button type="button" onClick={() => copyLink(onlyDonateLink)}>
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

                <div className="obs-action-row">
                    <button type="button" className="obs-secondary-btn">
                        Đổi link
                    </button>
                    <button type="button" className="obs-secondary-btn">
                        Donate ảo
                    </button>
                </div>

                <div className="obs-section-title">Cài đặt hiển thị</div>
                <div className="obs-tab-row">
                    <button
                        type="button"
                        className={sectionTab === "content" ? "active" : ""}
                        onClick={() => setSectionTab("content")}
                    >
                        Nội dung
                    </button>
                    <button
                        type="button"
                        className={sectionTab === "image" ? "active" : ""}
                        onClick={() => setSectionTab("image")}
                    >
                        Hình Ảnh
                    </button>
                    <button
                        type="button"
                        className={sectionTab === "sound" ? "active" : ""}
                        onClick={() => setSectionTab("sound")}
                    >
                        Âm Thanh
                    </button>
                </div>

                {sectionTab === "content" && (
                    <div className="obs-content-grid">
                        <div className="form-group obs-full">
                            <label>Nội dung hiển thị</label>
                            <input defaultValue="{name} đã donate {amount} đồng cho bạn. {message}" />
                        </div>
                        <div className="form-group">
                            <label>Thời gian hiển thị tối thiểu (giây)</label>
                            <input defaultValue="10" />
                        </div>
                        <div className="form-group obs-range">
                            <label>Kích cỡ tên người dùng</label>
                            <input type="range" min="12" max="36" defaultValue="18" />
                        </div>
                        <div className="form-group obs-range">
                            <label>Kích cỡ lời nhắn</label>
                            <input type="range" min="12" max="32" defaultValue="16" />
                        </div>
                        <div className="form-group">
                            <label>Vị trí xuất hiện</label>
                            <select defaultValue="center">
                                <option value="top">Trên cùng</option>
                                <option value="center">Giữa khung hình</option>
                                <option value="bottom">Dưới cùng</option>
                            </select>
                        </div>

                        <div className="obs-color-row">
                            <div>
                                <span>Màu tên</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: "#7dd3fc" }} />
                                    <strong>#7dd3fc</strong>
                                </div>
                            </div>
                            <div>
                                <span>Màu số tiền</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: "#facc15" }} />
                                    <strong>#facc15</strong>
                                </div>
                            </div>
                            <div>
                                <span>Màu lời nhắn</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: "#e5e7eb" }} />
                                    <strong>#e5e7eb</strong>
                                </div>
                            </div>
                            <div>
                                <span>Màu nền</span>
                                <div className="obs-color-chip">
                                    <i style={{ background: "#020617" }} />
                                    <strong>#020617</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {sectionTab === "image" && (
                    <div className="obs-image-grid">
                        <div className="obs-image-tile upload">
                            <span>Tải lên</span>
                        </div>
                        {Array.from({ length: 14 }).map((_, index) => (
                            <div
                                className={`obs-image-tile ${index === 4 ? "selected" : ""}`}
                                key={index}
                            >
                                <img src="/images/anhdong.gif" alt={`asset-${index}`} />
                            </div>
                        ))}
                    </div>
                )}

                {sectionTab === "sound" && (
                    <div className="obs-sound-grid">
                        <div className="obs-image-tile upload">
                            <span>Tải lên</span>
                        </div>
                        {soundItems.map((item, index) => (
                            <div
                                className={`obs-sound-tile ${index === 2 ? "selected" : ""}`}
                                key={item}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}

                <div className="obs-display-gallery">
                    <h3>Giao diện hiển thị</h3>
                    <div className="obs-display-cards">
                        <div className="obs-display-card">
                            <img src="/images/anhdong.gif" alt="preview 1" />
                            <div>
                                <strong>Taziu</strong>
                                <p>đã donate 100.000 đ đồng cho bạn.</p>
                                <span>Hello streamer</span>
                            </div>
                        </div>
                        <div className="obs-display-card active">
                            <img src="/images/anhdong.gif" alt="preview 2" />
                            <div>
                                <strong>Taziu</strong>
                                <p>đã donate 100.000 đ đồng cho bạn.</p>
                                <span>Hello streamer</span>
                            </div>
                        </div>
                        <div className="obs-display-card">
                            <img src="/images/anhdong.gif" alt="preview 3" />
                            <div>
                                <strong>Taziu</strong>
                                <p>đã donate 100.000 đ đồng cho bạn.</p>
                                <span>Hello streamer</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="obs-section-title">Cài đặt khác</div>
                <div className="obs-toggle-list">
                    <div className="obs-toggle-row">
                        <span>Hiện bảng xếp hạng</span>
                        <button
                            type="button"
                            className={`obs-toggle ${showRanking ? "active" : ""}`}
                            onClick={() => setShowRanking((value) => !value)}
                        />
                    </div>
                    <div className="form-group obs-inline">
                        <label>Số tiền tối thiểu</label>
                        <input defaultValue="5000" />
                    </div>
                    <div className="form-group obs-tags">
                        <label>Lọc từ khoá</label>
                        <input placeholder="Nhập từ khóa và nhấn Enter để tạo tag..." />
                        <div className="obs-tag-list">
                            {tagList.map((tag, index) => (
                                <span key={`${tag}-${index}`}>{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="obs-section-title">Cài đặt giọng đọc</div>
                <div className="obs-toggle-list">
                    <div className="obs-toggle-row">
                        <span>Bật giọng đọc</span>
                        <button
                            type="button"
                            className={`obs-toggle ${enableVoice ? "active" : ""}`}
                            onClick={() => setEnableVoice((value) => !value)}
                        />
                    </div>
                    <div className="form-group obs-inline">
                        <label>Số tiền tối thiểu để đọc</label>
                        <input defaultValue="8000" />
                    </div>
                    <div className="form-group obs-range">
                        <label>Âm lượng</label>
                        <input type="range" min="0" max="100" defaultValue="92" />
                    </div>
                    <div className="obs-toggle-row">
                        <span>Không đọc nội dung spam</span>
                        <button
                            type="button"
                            className={`obs-toggle ${muteSpam ? "active" : ""}`}
                            onClick={() => setMuteSpam((value) => !value)}
                        />
                    </div>
                    <div className="obs-toggle-row">
                        <span>Không đọc nội dung có chứa liên kết</span>
                        <button
                            type="button"
                            className={`obs-toggle ${muteLinkText ? "active" : ""}`}
                            onClick={() => setMuteLinkText((value) => !value)}
                        />
                    </div>
                </div>

                <button type="button" className="btn-save obs-submit-btn">
                    Cập nhật
                </button>
            </div>
        </div>
    );
};

export default DonateObsSettings;
