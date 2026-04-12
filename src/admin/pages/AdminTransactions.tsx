import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import {
    fetchAdminTransactions,
    setTxSearch, setTxFilter,
} from "../../features/admin/adminSlice";

const FEE_PERCENT = 2.5;

const statusLabel: Record<string, { label: string; color: string }> = {
    completed: { label: "Hoàn thành", color: "#4ade80" },
    pending:   { label: "Đang xử lý", color: "#fbbf24" },
    failed:    { label: "Thất bại",   color: "#f87171" },
    refunded:  { label: "Hoàn tiền",  color: "#a78bfa" },
};

const methodLabel: Record<string, string> = {
    wallet: "💜 Ví",
    qr:     "📷 QR",
    bank:   "🏦 Ngân hàng",
};

const AdminTransactions = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { transactions, txSearch, txFilter } = useSelector((s: RootState) => s.admin);
    const [showDetail, setShowDetail] = useState<any>(null);

    useEffect(() => { dispatch(fetchAdminTransactions()); }, [dispatch]);

    const filtered = transactions.filter(t => {
        const matchSearch =
            t.from.toLowerCase().includes(txSearch.toLowerCase()) ||
            t.to.toLowerCase().includes(txSearch.toLowerCase()) ||
            t.id.toLowerCase().includes(txSearch.toLowerCase());
        const matchFilter = txFilter === "all" || t.status === txFilter;
        return matchSearch && matchFilter;
    });

    // Tính toán tổng hợp chỉ cho giao dịch hoàn thành
    const completedTxs = filtered.filter(t => t.status === "completed");
    const totalAmount  = completedTxs.reduce((s, t) => s + t.amount, 0);
    const totalFee     = completedTxs.reduce((s, t) => s + Math.round(t.amount * FEE_PERCENT / 100), 0);
    const totalNet     = totalAmount - totalFee;

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>💳 Quản lý giao dịch</h2>
                    <p>{transactions.length} giao dịch tổng cộng</p>
                </div>
                {/* Summary badges */}
                <div className="tx-summary-badges">
                    <div className="tx-badge green">
                        <span className="tx-badge-label">✅ Tổng donate</span>
                        <span className="tx-badge-value">{totalAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="tx-badge gold">
                        <span className="tx-badge-label">⚡ Phí hệ thống ({FEE_PERCENT}%)</span>
                        <span className="tx-badge-value">{totalFee.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="tx-badge blue">
                        <span className="tx-badge-label">💸 Streamer nhận</span>
                        <span className="tx-badge-value">{totalNet.toLocaleString("vi-VN")}đ</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="as-filters">
                <input
                    className="as-search"
                    placeholder="🔍 Tìm mã GD, người gửi, người nhận..."
                    value={txSearch}
                    onChange={e => dispatch(setTxSearch(e.target.value))}
                />
                <div className="as-filter-tabs">
                    {(["all","completed","pending","failed","refunded"] as const).map(f => (
                        <button
                            key={f}
                            className={txFilter === f ? "active" : ""}
                            onClick={() => dispatch(setTxFilter(f))}
                        >
                            {statusLabel[f]?.label ?? "Tất cả"}
                            <span className="filter-count">
                                {f === "all"
                                    ? transactions.length
                                    : transactions.filter(t => t.status === f).length}
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
                            <th>Mã GD</th>
                            <th>Từ</th>
                            <th>Đến</th>
                            <th>Số tiền</th>
                            <th>Phí ({FEE_PERCENT}%)</th>
                            <th>Streamer nhận</th>
                            <th>Phương thức</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => {
                            const s        = statusLabel[t.status];
                            const fee      = Math.round(t.amount * FEE_PERCENT / 100);
                            const net      = t.amount - fee;
                            const isEarned = t.status === "completed";

                            return (
                                <tr key={t.id} className="as-row">
                                    <td className="tx-id">#{t.id}</td>
                                    <td className="as-username">{t.from}</td>
                                    <td className="as-username">{t.to}</td>
                                    <td className="as-money">{t.amount.toLocaleString("vi-VN")}đ</td>

                                    {/* Phí hệ thống */}
                                    <td>
                                        <span className={`fee-cell ${isEarned ? "earned" : "muted"}`}>
                                            {isEarned ? "+" : ""}
                                            {isEarned ? fee.toLocaleString("vi-VN") : "—"}
                                            {isEarned ? "đ" : ""}
                                        </span>
                                    </td>

                                    {/* Streamer thực nhận */}
                                    <td>
                                        <span className={`net-cell ${isEarned ? "" : "muted"}`}>
                                            {isEarned ? net.toLocaleString("vi-VN") + "đ" : "—"}
                                        </span>
                                    </td>

                                    <td style={{ fontSize: 13 }}>{methodLabel[t.method]}</td>
                                    <td style={{ fontSize: 12, color: "#94a3b8" }}>{t.timestamp}</td>

                                    <td>
                                        <span className="tx-status-badge" style={{ color: s.color, borderColor: s.color + "44" }}>
                                            {s.label}
                                        </span>
                                    </td>

                                    <td className="as-actions-cell">
                                        <button
                                            className="act-btn view"
                                            style={{ fontSize: 12 }}
                                            onClick={() => setShowDetail(t)}
                                        >
                                            Chi tiết
                                        </button>
                                        {t.status === "completed" && (
                                            <button className="act-btn ban" style={{ fontSize: 12 }}>Hoàn tiền</button>
                                        )}
                                        {t.status === "pending" && (
                                            <button className="act-btn unban" style={{ fontSize: 12 }}>Duyệt</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="as-empty">Không có giao dịch nào phù hợp</div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && (() => {
                const t   = showDetail;
                const s   = statusLabel[t.status];
                const fee = Math.round(t.amount * FEE_PERCENT / 100);
                const net = t.amount - fee;
                return (
                    <div className="modal-backdrop" onClick={() => setShowDetail(null)}>
                        <div className="user-modal" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowDetail(null)}>✕</button>

                            <h3 style={{ marginBottom: 20 }}>📋 Chi tiết giao dịch <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>#{t.id}</span></h3>

                            {/* Parties */}
                            <div className="tx-parties">
                                <div className="tx-party">
                                    <p className="party-label">Người gửi</p>
                                    <p className="party-name">👤 {t.from}</p>
                                </div>
                                <div className="tx-arrow">→</div>
                                <div className="tx-party">
                                    <p className="party-label">Streamer</p>
                                    <p className="party-name">🎮 {t.to}</p>
                                </div>
                            </div>

                            {/* Fee breakdown */}
                            <div className="tx-fee-breakdown">
                                <div className="fee-row">
                                    <span>Số tiền gốc</span>
                                    <span className="as-money">{t.amount.toLocaleString("vi-VN")}đ</span>
                                </div>
                                <div className="fee-row highlight-fee">
                                    <span>⚡ Phí hệ thống ({FEE_PERCENT}%)</span>
                                    <span className="fee-earned">
                                        {t.status === "completed"
                                            ? `+${fee.toLocaleString("vi-VN")}đ`
                                            : "—"}
                                    </span>
                                </div>
                                <div className="fee-row total-row">
                                    <span>💸 Streamer thực nhận</span>
                                    <span className="net-value">
                                        {t.status === "completed"
                                            ? `${net.toLocaleString("vi-VN")}đ`
                                            : "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="um-stats" style={{ marginTop: 16 }}>
                                <div className="um-stat">
                                    <p>Phương thức</p>
                                    <strong>{methodLabel[t.method]}</strong>
                                </div>
                                <div className="um-stat">
                                    <p>Thời gian</p>
                                    <strong>{t.timestamp}</strong>
                                </div>
                                <div className="um-stat">
                                    <p>Trạng thái</p>
                                    <strong style={{ color: s.color }}>{s.label}</strong>
                                </div>
                                {t.message && (
                                    <div className="um-stat" style={{ gridColumn: "span 2" }}>
                                        <p>Lời nhắn</p>
                                        <strong>"{t.message}"</strong>
                                    </div>
                                )}
                            </div>

                            <div className="um-actions" style={{ marginTop: 16 }}>
                                {t.status === "completed" && (
                                    <button className="act-btn ban lg">↩️ Hoàn tiền</button>
                                )}
                                {t.status === "pending" && (
                                    <button className="act-btn unban lg">✅ Duyệt giao dịch</button>
                                )}
                                <button className="act-btn view lg" onClick={() => setShowDetail(null)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default AdminTransactions;