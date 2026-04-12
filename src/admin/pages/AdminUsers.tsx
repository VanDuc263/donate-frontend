import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import {
    fetchAdminUsers, banUser, unbanUser,
    setUserSearch, setUserFilter, AdminUser,
} from "../../features/admin/adminSlice";

const roleBadge: Record<string, string> = {
    admin: "🔴 Admin", streamer: "🎮 Streamer", viewer: "👁️ Viewer",
};
const statusColor: Record<string, string> = {
    active: "#4ade80", banned: "#f87171", pending: "#fbbf24",
};

const AdminUsers = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, userSearch, userFilter } = useSelector((s: RootState) => s.admin);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    useEffect(() => { dispatch(fetchAdminUsers()); }, [dispatch]);

    const filtered = users.filter(u => {
        const matchSearch = u.username.toLowerCase().includes(userSearch.toLowerCase())
            || u.email.toLowerCase().includes(userSearch.toLowerCase());
        const matchFilter = userFilter === "all" || u.status === userFilter;
        return matchSearch && matchFilter;
    });

    const handleBan = (id: string) => { dispatch(banUser(id)); setSelectedUser(null); };
    const handleUnban = (id: string) => { dispatch(unbanUser(id)); setSelectedUser(null); };

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>👥 Quản lý người dùng</h2>
                    <p>{users.length} người dùng trong hệ thống</p>
                </div>
                <button className="as-add-btn">+ Thêm người dùng</button>
            </div>

            {/* Filters */}
            <div className="as-filters">
                <input
                    className="as-search"
                    placeholder="🔍 Tìm theo tên, email..."
                    value={userSearch}
                    onChange={e => dispatch(setUserSearch(e.target.value))}
                />
                <div className="as-filter-tabs">
                    {(["all","active","banned","pending"] as const).map(f => (
                        <button
                            key={f}
                            className={userFilter === f ? "active" : ""}
                            onClick={() => dispatch(setUserFilter(f))}
                        >
                            {f === "all" ? "Tất cả" : f === "active" ? "Hoạt động" : f === "banned" ? "Đã cấm" : "Chờ duyệt"}
                            <span className="filter-count">
                                {f === "all" ? users.length : users.filter(u => u.status === f).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="as-table-wrap">
                <table className="as-table">
                    <thead>
                        <tr>
                            <th>Người dùng</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Tổng donate</th>
                            <th>Lần cuối</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u.id} className="as-row">
                                <td className="as-user-cell">
                                    <img src={u.avatar} alt={u.username} />
                                    <div>
                                        <p className="as-username">{u.username}</p>
                                        <p className="as-email">{u.email}</p>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-tag ${u.role}`}>{roleBadge[u.role]}</span>
                                </td>
                                <td>
                                    <span
                                        className="status-dot"
                                        style={{ background: statusColor[u.status] }}
                                    />
                                    <span style={{ color: statusColor[u.status], fontSize: 13 }}>
                                        {u.status === "active" ? "Hoạt động" : u.status === "banned" ? "Đã cấm" : "Chờ duyệt"}
                                    </span>
                                </td>
                                <td className="as-money">
                                    {u.totalDonated.toLocaleString("vi-VN")}đ
                                </td>
                                <td className="as-last">{u.lastActive}</td>
                                <td className="as-actions-cell">
                                    <button className="act-btn view" onClick={() => setSelectedUser(u)}>
                                        Chi tiết
                                    </button>
                                    {u.status === "banned" ? (
                                        <button className="act-btn unban" onClick={() => handleUnban(u.id)}>
                                            Bỏ cấm
                                        </button>
                                    ) : (
                                        <button className="act-btn ban" onClick={() => handleBan(u.id)}>
                                            Cấm
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="as-empty">Không tìm thấy người dùng nào</div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
                    <div className="user-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
                        <div className="um-header">
                            <img src={selectedUser.avatar} alt={selectedUser.username} />
                            <div>
                                <h3>{selectedUser.username}</h3>
                                <p>{selectedUser.email}</p>
                                <span className={`role-tag ${selectedUser.role}`}>
                                    {roleBadge[selectedUser.role]}
                                </span>
                            </div>
                        </div>
                        <div className="um-stats">
                            <div className="um-stat">
                                <p>Tổng donate</p>
                                <strong>{selectedUser.totalDonated.toLocaleString("vi-VN")}đ</strong>
                            </div>
                            <div className="um-stat">
                                <p>Tổng nhận</p>
                                <strong>{selectedUser.totalReceived.toLocaleString("vi-VN")}đ</strong>
                            </div>
                            <div className="um-stat">
                                <p>Ngày tham gia</p>
                                <strong>{new Date(selectedUser.joinedDate).toLocaleDateString("vi-VN")}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Hoạt động</p>
                                <strong>{selectedUser.lastActive}</strong>
                            </div>
                        </div>
                        <div className="um-actions">
                            {selectedUser.status === "banned" ? (
                                <button className="act-btn unban lg" onClick={() => handleUnban(selectedUser.id)}>
                                    ✅ Bỏ cấm tài khoản
                                </button>
                            ) : (
                                <button className="act-btn ban lg" onClick={() => handleBan(selectedUser.id)}>
                                    🚫 Cấm tài khoản
                                </button>
                            )}
                            <button className="act-btn view lg">📧 Gửi email</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
