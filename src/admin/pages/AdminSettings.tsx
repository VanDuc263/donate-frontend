import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import {
    AdminPaymentMethod,
    createAdminPaymentMethod,
    deleteAdminPaymentMethod,
    fetchAdminPaymentMethods,
    updateAdminPaymentMethod,
} from "../../features/admin/adminSlice";

const blank = {
    providerType: "BANK",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    qrTemplate: "compact2",
    qrImageUrl: "",
    active: true,
};

const AdminSettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { paymentMethods, loading, saving, error } = useSelector((s: RootState) => s.admin);
    const [editing, setEditing] = useState<AdminPaymentMethod | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<any>(blank);

    useEffect(() => { dispatch(fetchAdminPaymentMethods()); }, [dispatch]);

    const openCreate = () => {
        setEditing(null);
        setForm(blank);
        setShowForm(true);
    };

    const openEdit = (m: AdminPaymentMethod) => {
        setEditing(m);
        setForm({
            providerType: m.providerType || "BANK",
            bankCode: m.bankCode || "",
            accountNumber: m.accountNumber || "",
            accountName: m.accountName || "",
            qrTemplate: m.qrTemplate || "",
            qrImageUrl: m.qrImageUrl || "",
            active: !!m.active,
        });
        setShowForm(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) await dispatch(updateAdminPaymentMethod({ id: editing.id, data: form }));
        else await dispatch(createAdminPaymentMethod(form));
        setShowForm(false);
        setEditing(null);
    };

    const remove = async (m: AdminPaymentMethod) => {
        if (!window.confirm(`Xóa phương thức ${m.providerType} - ${m.accountNumber}?`)) return;
        await dispatch(deleteAdminPaymentMethod(m.id));
    };

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>⚙️ Cài đặt hệ thống</h2>
                    <p>Quản lý bảng system_payment_methods để tạo QR nạp ví / donate</p>
                </div>
                <button className="as-add-btn" onClick={openCreate}>+ Thêm phương thức</button>
            </div>

            {error && <div className="admin-error small">⚠️ {error}</div>}

            <div className="settings-grid">
                <div className="settings-card wide-card">
                    <h3>🏦 System payment methods</h3>
                    <div className="as-table-wrap flat">
                        <table className="as-table">
                            <thead>
                            <tr>
                                <th>ID</th><th>Provider</th><th>Bank</th><th>Số tài khoản</th><th>Chủ tài khoản</th><th>Active</th><th>QR URL</th><th>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? <tr><td colSpan={8}>Đang tải...</td></tr> : paymentMethods.map(m => (
                                <tr key={m.id} className="as-row">
                                    <td>#{m.id}</td>
                                    <td>{m.providerType}</td>
                                    <td>{m.bankCode || "—"}</td>
                                    <td>{m.accountNumber || "—"}</td>
                                    <td>{m.accountName || "—"}</td>
                                    <td>{m.active ? "🟢 Bật" : "⚪ Tắt"}</td>
                                    <td className="qr-cell">{m.qrImageUrl || "—"}</td>
                                    <td className="as-actions-cell">
                                        <button className="act-btn view" onClick={() => openEdit(m)}>Sửa</button>
                                        <button className="act-btn ban" onClick={() => remove(m)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="settings-card">
                    <h3>📌 Gợi ý cấu hình VietQR</h3>
                    <div className="sysinfo-list">
                        <div className="sysinfo-row"><span className="sysinfo-label">providerType</span><span className="sysinfo-value">BANK</span></div>
                        <div className="sysinfo-row"><span className="sysinfo-label">bankCode</span><span className="sysinfo-value">VD: MB, VCB, ACB</span></div>
                        <div className="sysinfo-row"><span className="sysinfo-label">qrImageUrl</span><span className="sysinfo-value">Base URL QR của ngân hàng/API</span></div>
                        <div className="sysinfo-row"><span className="sysinfo-label">active</span><span className="sysinfo-value">Chỉ active mới cho user chọn</span></div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="modal-backdrop" onClick={() => setShowForm(false)}>
                    <form className="user-modal admin-form-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
                        <button type="button" className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                        <h3>{editing ? "Sửa phương thức thanh toán" : "Thêm phương thức thanh toán"}</h3>
                        <div className="admin-form-grid one-col">
                            <label>Provider type<input value={form.providerType} onChange={e => setForm({ ...form, providerType: e.target.value })} required /></label>
                            <label>Bank code<input value={form.bankCode} onChange={e => setForm({ ...form, bankCode: e.target.value })} /></label>
                            <label>Số tài khoản<input value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} /></label>
                            <label>Chủ tài khoản<input value={form.accountName} onChange={e => setForm({ ...form, accountName: e.target.value })} /></label>
                            <label>QR template<input value={form.qrTemplate} onChange={e => setForm({ ...form, qrTemplate: e.target.value })} /></label>
                            <label>QR image URL<input value={form.qrImageUrl} onChange={e => setForm({ ...form, qrImageUrl: e.target.value })} /></label>
                            <label className="checkbox-label"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active</label>
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

export default AdminSettings;
