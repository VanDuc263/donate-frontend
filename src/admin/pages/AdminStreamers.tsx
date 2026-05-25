import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { AdminStreamer, deleteAdminStreamer, fetchAdminStreamers, updateAdminStreamer } from "../../features/admin/adminSlice";

const money = (n?: number | null) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;
const short = (n?: number | null) => {
    const x = Number(n || 0);
    if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`;
    if (x >= 1_000) return `${(x / 1_000).toFixed(1)}K`;
    return x.toString();
};

const AdminStreamers = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { streamers, loading, saving, error } = useSelector((s: RootState) => s.admin);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<AdminStreamer | null>(null);
    const [form, setForm] = useState<any>({});

    useEffect(() => { dispatch(fetchAdminStreamers()); }, [dispatch]);

    const filtered = useMemo(() => streamers.filter(s => {
        const q = search.toLowerCase();
        return (s.displayName || "").toLowerCase().includes(q)
            || (s.token || "").toLowerCase().includes(q)
            || (s.username || "").toLowerCase().includes(q);
    }), [streamers, search]);

    const openEdit = (s: AdminStreamer) => {
        setEditing(s);
        setForm({
            displayName: s.displayName || "",
            token: s.token || "",
            avatar: s.avatar || "",
            thumb: s.thumb || "",
            bio: s.bio || "",
            followers: s.followers || 0,
        });
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        await dispatch(updateAdminStreamer({ id: editing.id, data: form }));
        setEditing(null);
    };

    const remove = async (s: AdminStreamer) => {
        if (!window.confirm(`Xóa streamer ${s.displayName}? Dữ liệu donate liên quan có thể khiến DB chặn xóa.`)) return;
        await dispatch(deleteAdminStreamer(s.id));
    };

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>🎮 Quản lý Streamers</h2>
                    <p>{streamers.length} streamer trong hệ thống</p>
                </div>
                <button className="view-toggle" onClick={() => dispatch(fetchAdminStreamers())}>↻ Tải lại</button>
            </div>

            {error && <div className="admin-error small">⚠️ {error}</div>}

            <div className="as-filters">
                <input className="as-search" placeholder="🔍 Tìm display name, token, username..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="streamer-admin-grid">
                {loading ? <p>Đang tải...</p> : filtered.map(s => (
                    <div key={s.id} className="sa-card active">
                        <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.displayName || "S")}`} alt={s.displayName} />
                        <h4>{s.displayName}</h4>
                        <p className="sa-game">@{s.token}</p>
                        <p className="admin-muted">User: {s.username || s.userId}</p>
                        <div className="sa-stats">
                            <span>💰 {short(s.totalReceived)}đ</span>
                            <span>🧾 {Number(s.donationCount || 0).toLocaleString("vi-VN")}</span>
                            <span>👥 {Number(s.followers || 0).toLocaleString("vi-VN")}</span>
                        </div>
                        <div className="um-actions compact-actions">
                            <button className="act-btn view" onClick={() => openEdit(s)}>Sửa</button>
                            <button className="act-btn ban" onClick={() => remove(s)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>

            {editing && (
                <div className="modal-backdrop" onClick={() => setEditing(null)}>
                    <form className="user-modal admin-form-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
                        <button type="button" className="modal-close" onClick={() => setEditing(null)}>✕</button>
                        <h3>Sửa streamer #{editing.id}</h3>
                        <div className="um-header">
                            <img src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.displayName || "S")}`} alt={form.displayName} />
                            <div>
                                <h3>{editing.displayName}</h3>
                                <p>{editing.email || editing.username}</p>
                                <strong>{money(editing.totalReceived)}</strong>
                            </div>
                        </div>
                        <div className="admin-form-grid one-col">
                            <label>Display name<input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required /></label>
                            <label>Token URL<input value={form.token} onChange={e => setForm({ ...form, token: e.target.value })} required /></label>
                            <label>Avatar URL<input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} /></label>
                            <label>Thumbnail URL<input value={form.thumb} onChange={e => setForm({ ...form, thumb: e.target.value })} /></label>
                            <label>Followers<input type="number" value={form.followers} onChange={e => setForm({ ...form, followers: Number(e.target.value) })} /></label>
                            <label>Bio<textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} /></label>
                        </div>
                        <div className="um-actions">
                            <button className="act-btn unban lg" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu streamer"}</button>
                            <button type="button" className="act-btn view lg" onClick={() => setEditing(null)}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminStreamers;
