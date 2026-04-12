import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchAdminStreamers, AdminStreamer } from "../../features/admin/adminSlice";

const fmt = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
    return n.toString();
};

const AdminStreamers = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { streamers } = useSelector((s: RootState) => s.admin);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"grid" | "table">("grid");
    const [selected, setSelected] = useState<AdminStreamer | null>(null);

    useEffect(() => { dispatch(fetchAdminStreamers()); }, [dispatch]);

    const filtered = streamers.filter(s =>
        s.username.toLowerCase().includes(search.toLowerCase()) ||
        s.game.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>🎮 Quản lý Streamers</h2>
                    <p>{streamers.length} streamer đang đăng ký</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="view-toggle" onClick={() => setView(v => v === "grid" ? "table" : "grid")}>
                        {view === "grid" ? "📋 Dạng bảng" : "🪟 Dạng thẻ"}
                    </button>
                    <button className="as-add-btn">+ Thêm streamer</button>
                </div>
            </div>

            <div className="as-filters">
                <input
                    className="as-search"
                    placeholder="🔍 Tìm streamer, game..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Grid view */}
            {view === "grid" ? (
                <div className="streamer-admin-grid">
                    {filtered.map(s => (
                        <div key={s.id} className={`sa-card ${s.status}`} onClick={() => setSelected(s)}>
                            {s.verified && <span className="sa-verified">✔ Xác minh</span>}
                            <img src={s.avatar} alt={s.username} />
                            <h4>{s.username}</h4>
                            <p className="sa-game">{s.game}</p>
                            <div className="sa-stats">
                                <span>💰 {fmt(s.totalEarned)}đ</span>
                                <span>👥 {s.donorCount.toLocaleString()}</span>
                            </div>
                            <span className={`sa-status ${s.status}`}>
                                {s.status === "active" ? "🟢 Hoạt động" : s.status === "suspended" ? "🔴 Tạm khóa" : "🟡 Chờ duyệt"}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                /* Table view */
                <div className="as-table-wrap">
                    <table className="as-table">
                        <thead>
                            <tr>
                                <th>Streamer</th>
                                <th>Game</th>
                                <th>Xác minh</th>
                                <th>Donors</th>
                                <th>Doanh thu</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id} className="as-row">
                                    <td className="as-user-cell">
                                        <img src={s.avatar} alt={s.username} />
                                        <span className="as-username">{s.username}</span>
                                    </td>
                                    <td style={{ color: "#94a3b8", fontSize: 13 }}>{s.game}</td>
                                    <td>{s.verified ? "✔️" : "—"}</td>
                                    <td>{s.donorCount.toLocaleString()}</td>
                                    <td className="as-money">{fmt(s.totalEarned)}đ</td>
                                    <td>
                                        <span className={`sa-status ${s.status}`}>
                                            {s.status === "active" ? "🟢 Hoạt động" : "🔴 Khóa"}
                                        </span>
                                    </td>
                                    <td className="as-actions-cell">
                                        <button className="act-btn view" onClick={() => setSelected(s)}>Chi tiết</button>
                                        <button className="act-btn ban">Khóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="user-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        <div className="um-header">
                            <img src={selected.avatar} alt={selected.username} />
                            <div>
                                <h3>{selected.username} {selected.verified && "✔️"}</h3>
                                <p>🎮 {selected.game}</p>
                                <p style={{ fontSize: 12, opacity: 0.5 }}>
                                    Tham gia {new Date(selected.joinedDate).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>
                        <div className="um-stats">
                            <div className="um-stat">
                                <p>Tổng thu nhập</p>
                                <strong>{selected.totalEarned.toLocaleString("vi-VN")}đ</strong>
                            </div>
                            <div className="um-stat">
                                <p>Tổng donors</p>
                                <strong>{selected.donorCount.toLocaleString()}</strong>
                            </div>
                        </div>
                        <div className="um-actions">
                            {!selected.verified && (
                                <button className="act-btn unban lg">✔ Xác minh tài khoản</button>
                            )}
                            <button className="act-btn view lg">🔗 Xem trang donate</button>
                            <button className="act-btn ban lg">🚫 Tạm khóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStreamers;
