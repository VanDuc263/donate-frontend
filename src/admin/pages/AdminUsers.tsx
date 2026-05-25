import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import {
    AdminRole,
    AdminUser,
    createAdminUser,
    deleteAdminUser,
    fetchAdminUsers,
    setUserFilter,
    setUserSearch,
    updateAdminUser,
} from "../../features/admin/adminSlice";

const blankForm = {
    username: "",
    email: "",
    password: "",
    fullName: "",
    avatar: "",
    role: "USER" as AdminRole,
};

const roleLabel: Record<AdminRole, string> = {
    ADMIN: "🔴 Admin",
    STREAMER: "🎮 Streamer",
    USER: "👤 User",
};

const money = (n?: number | null) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;

const AdminUsers = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, userSearch, userFilter, loading, saving, error } = useSelector((s: RootState) => s.admin);
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(blankForm);

    useEffect(() => { dispatch(fetchAdminUsers()); }, [dispatch]);

    const filtered = useMemo(() => users.filter(u => {
        const q = userSearch.toLowerCase();
        const matchSearch = (u.username || "").toLowerCase().includes(q)
            || (u.email || "").toLowerCase().includes(q)
            || (u.fullName || "").toLowerCase().includes(q);
        const matchRole = userFilter === "all" || u.role === userFilter;
        return matchSearch && matchRole;
    }), [users, userSearch, userFilter]);

    const openCreate = () => {
        setEditing(null);
        setForm(blankForm);
        setShowForm(true);
    };

    const openEdit = (u: AdminUser) => {
        setEditing(u);
        setForm({
            username: u.username || "",
            email: u.email || "",
            password: "",
            fullName: u.fullName || "",
            avatar: u.avatar || "",
            role: u.role || "USER",
        });
        setShowForm(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            username: form.username,
            email: form.email,
            fullName: form.fullName,
            avatar: form.avatar,
            role: form.role,
        };
        if (form.password.trim()) payload.password = form.password;

        if (editing) {
            await dispatch(updateAdminUser({ id: editing.id, data: payload }));
        } else {
            if (!payload.password) return alert("Tạo user mới phải nhập password");
            await dispatch(createAdminUser(payload as any));
        }
        setShowForm(false);
        setEditing(null);
    };

    const remove = async (u: AdminUser) => {
        if (!window.confirm(`Xóa user ${u.username}? Nếu user có dữ liệu liên quan, database có thể chặn xóa.`)) return;
        await dispatch(deleteAdminUser(u.id));
    };

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>👥 Quản lý người dùng</h2>
                    <p>{users.length} tài khoản: USER / STREAMER / ADMIN</p>
                </div>
                <button className="as-add-btn" onClick={openCreate}>+ Thêm người dùng</button>
            </div>

            {error && <div className="admin-error small">⚠️ {error}</div>}

            <div className="as-filters">
                <input
                    className="as-search"
                    placeholder="🔍 Tìm username, email, họ tên..."
                    value={userSearch}
                    onChange={e => dispatch(setUserSearch(e.target.value))}
                />
                <div className="as-filter-tabs">
                    {(["all", "USER", "STREAMER", "ADMIN"] as const).map(f => (
                        <button key={f} className={userFilter === f ? "active" : ""} onClick={() => dispatch(setUserFilter(f))}>
                            {f === "all" ? "Tất cả" : roleLabel[f]}
                            <span className="filter-count">{f === "all" ? users.length : users.filter(u => u.role === f).length}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="as-table-wrap">
                <table className="as-table">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Vai trò</th>
                        <th>Ví</th>
                        <th>Streamer page</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? <tr><td colSpan={6}>Đang tải...</td></tr> : filtered.map(u => (
                        <tr key={u.id} className="as-row">
                            <td className="as-user-cell">
                                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || "U")}`} alt={u.username} />
                                <div>
                                    <span className="as-username">{u.username}</span>
                                    <small>{u.email}</small>
                                    {u.fullName && <small>{u.fullName}</small>}
                                </div>
                            </td>
                            <td><span className={`role-tag ${u.role.toLowerCase()}`}>{roleLabel[u.role]}</span></td>
                            <td className="as-money">{money(u.walletBalance as any)}</td>
                            <td>{u.streamerDisplayName || "—"}</td>
                            <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}</td>
                            <td className="as-actions-cell">
                                <button className="act-btn view" onClick={() => openEdit(u)}>Sửa</button>
                                <button className="act-btn ban" onClick={() => remove(u)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="modal-backdrop" onClick={() => setShowForm(false)}>
                    <form className="user-modal admin-form-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
                        <button type="button" className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        <h3>{editing ? "Sửa người dùng" : "Thêm người dùng"}</h3>
                        <div className="admin-form-grid">
                            <label>Username<input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></label>
                            <label>Email<input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
                            <label>Họ tên<input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></label>
                            <label>Avatar URL<input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} /></label>
                            <label>{editing ? "Password mới (để trống nếu không đổi)" : "Password"}<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
                            <label>Role<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as AdminRole })}>
                                <option value="USER">USER</option>
                                <option value="STREAMER">STREAMER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select></label>
                        </div>
                        <div className="um-actions">
                            <button className="act-btn unban lg" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu"}</button>
                            <button type="button" className="act-btn view lg" onClick={() => setShowForm(false)}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
