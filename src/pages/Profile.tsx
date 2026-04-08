import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { fetchProfile, updateProfile, clearSaveStatus } from "../features/profile/profileSlice";
import "../styles/profile.css";

const formatMoney = (n: number) => n.toLocaleString("vi-VN") + "đ";

const Profile = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, saving, saveSuccess, error } = useSelector((state: RootState) => state.profile);
    const [editMode, setEditMode] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [activeTab, setActiveTab] = useState<"overview" | "donations" | "settings">("overview");

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            setDisplayName(data.displayName);
            setBio(data.bio);
        }
    }, [data]);

    useEffect(() => {
        if (saveSuccess) {
            setEditMode(false);
            const timer = setTimeout(() => dispatch(clearSaveStatus()), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveSuccess, dispatch]);

    const handleSave = () => {
        dispatch(updateProfile({ displayName, bio }));
    };

    if (loading || !data) {
        return (
            <div className="profile-loading">
                <div className="spinner" />
                <p>Đang tải profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Cover & Avatar */}
            <div className="profile-cover">
                <div className="profile-cover-bg" />
                <div className="profile-top">
                    <div className="profile-avatar-wrap">
                        <img src={data.avatar} alt={data.displayName} className="profile-avatar" />
                        <span className="profile-online" />
                    </div>
                    <div className="profile-info">
                        {editMode ? (
                            <input
                                className="profile-edit-name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        ) : (
                            <h2>{data.displayName}</h2>
                        )}
                        <p className="profile-username">@{data.username}</p>
                        <div className="profile-stats">
                            <span><strong>{data.followers}</strong> Followers</span>
                            <span><strong>{data.following}</strong> Following</span>
                            <span>Tham gia từ {new Date(data.joinedDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                    </div>
                    <div className="profile-btns">
                        {editMode ? (
                            <>
                                <button className="btn-save" onClick={handleSave} disabled={saving}>
                                    {saving ? "Đang lưu..." : "💾 Lưu"}
                                </button>
                                <button className="btn-cancel" onClick={() => setEditMode(false)}>Huỷ</button>
                            </>
                        ) : (
                            <button className="btn-edit" onClick={() => setEditMode(true)}>✏️ Chỉnh sửa</button>
                        )}
                    </div>
                </div>
            </div>

            {saveSuccess && <div className="save-toast">✅ Cập nhật thành công!</div>}
            {error && <div className="error-toast">❌ {error}</div>}

            {/* Tabs */}
            <div className="profile-tabs">
                {(["overview", "donations", "settings"] as const).map((tab) => (
                    <button
                        key={tab}
                        className={activeTab === tab ? "active" : ""}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "overview" && "📋 Tổng quan"}
                        {tab === "donations" && "💙 Lịch sử donate"}
                        {tab === "settings" && "⚙️ Cài đặt"}
                    </button>
                ))}
            </div>

            <div className="profile-body">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="profile-overview">
                        <div className="pov-card">
                            <h4>💰 Tổng đã donate</h4>
                            <p className="pov-big">{formatMoney(data.totalDonated)}</p>
                        </div>
                        <div className="pov-card">
                            <h4>❤️ Streamer yêu thích</h4>
                            <div className="fav-list">
                                {data.favoriteStreamers.map((s, i) => (
                                    <span key={i} className="fav-tag">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div className="pov-card bio-card">
                            <h4>📝 Giới thiệu</h4>
                            {editMode ? (
                                <textarea
                                    className="profile-edit-bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                />
                            ) : (
                                <p>{data.bio || "Chưa có giới thiệu"}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Donation History Tab */}
                {activeTab === "donations" && (
                    <div className="donation-history">
                        <h3>Lịch sử donate của bạn</h3>
                        {data.recentDonations.length === 0 ? (
                            <p className="empty-msg">Bạn chưa donate lần nào 😢</p>
                        ) : (
                            data.recentDonations.map((d, i) => (
                                <div key={i} className="dh-item">
                                    <div className="dh-left">
                                        <p className="dh-streamer">💙 {d.streamer}</p>
                                        {d.message && <p className="dh-msg">"{d.message}"</p>}
                                        <p className="dh-date">{new Date(d.date).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                    <span className="dh-amount">{formatMoney(d.amount)}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                    <div className="profile-settings">
                        <div className="setting-group">
                            <h4>🔔 Thông báo</h4>
                            <label className="toggle-row">
                                <span>Nhận email khi được donate</span>
                                <div className="toggle on" />
                            </label>
                            <label className="toggle-row">
                                <span>Thông báo đẩy</span>
                                <div className="toggle" />
                            </label>
                        </div>
                        <div className="setting-group">
                            <h4>🔒 Bảo mật</h4>
                            <button className="setting-btn">Đổi mật khẩu</button>
                            <button className="setting-btn">Liên kết tài khoản ngân hàng</button>
                        </div>
                        <div className="setting-group danger-zone">
                            <h4>⚠️ Vùng nguy hiểm</h4>
                            <button className="setting-btn danger">Xoá tài khoản</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
