import React, { useState } from "react";

interface Report {
    id: string;
    reporter: string;
    target: string;
    type: "spam" | "fraud" | "abusive" | "other";
    description: string;
    date: string;
    status: "pending" | "resolved" | "dismissed";
}

const mockReports: Report[] = [
    { id: "r001", reporter: "Alice", target: "GGBoy", type: "spam", description: "Tài khoản này spam message trong donate", date: "2025-04-05 14:30", status: "pending" },
    { id: "r002", reporter: "Zeno", target: "FakeStream99", type: "fraud", description: "Nhận donate nhưng không stream, lừa đảo người dùng", date: "2025-04-04 22:10", status: "pending" },
    { id: "r003", reporter: "Lily", target: "ToxicUser", type: "abusive", description: "Gửi nội dung không phù hợp trong tin nhắn donate", date: "2025-04-04 18:00", status: "pending" },
    { id: "r004", reporter: "Bob", target: "ScamStreamer", type: "fraud", description: "Giả mạo streamer nổi tiếng để nhận donate", date: "2025-04-03 11:20", status: "resolved" },
    { id: "r005", reporter: "Carol", target: "SpamBot01", type: "spam", description: "Bot spam liên tục donate với nội dung quảng cáo", date: "2025-04-02 09:45", status: "dismissed" },
    { id: "r006", reporter: "Dave", target: "HateAccount", type: "abusive", description: "Nội dung thù ghét trong phần mô tả trang donate", date: "2025-04-01 20:15", status: "pending" },
];

const typeLabel: Record<string, { label: string; color: string; icon: string }> = {
    spam:    { label: "Spam",     color: "#fbbf24", icon: "📢" },
    fraud:   { label: "Lừa đảo", color: "#f87171", icon: "⚠️" },
    abusive: { label: "Lạm dụng", color: "#fb923c", icon: "🚫" },
    other:   { label: "Khác",    color: "#94a3b8", icon: "❓" },
};

const statusInfo: Record<string, { label: string; color: string }> = {
    pending:   { label: "Chờ xử lý", color: "#fbbf24" },
    resolved:  { label: "Đã xử lý",  color: "#4ade80" },
    dismissed: { label: "Bỏ qua",    color: "#94a3b8" },
};

const AdminReports = () => {
    const [reports, setReports] = useState<Report[]>(mockReports);
    const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("pending");
    const [selected, setSelected] = useState<Report | null>(null);

    const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter);

    const resolve = (id: string) => {
        setReports(rs => rs.map(r => r.id === id ? { ...r, status: "resolved" } : r));
        setSelected(null);
    };
    const dismiss = (id: string) => {
        setReports(rs => rs.map(r => r.id === id ? { ...r, status: "dismissed" } : r));
        setSelected(null);
    };

    const pending = reports.filter(r => r.status === "pending").length;

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>🚨 Báo cáo vi phạm</h2>
                    <p>{pending} báo cáo đang chờ xử lý</p>
                </div>
                {pending > 0 && (
                    <div className="report-alert">⚠️ Có {pending} báo cáo cần xử lý!</div>
                )}
            </div>

            {/* Filters */}
            <div className="as-filters">
                <div className="as-filter-tabs">
                    {(["all","pending","resolved","dismissed"] as const).map(f => (
                        <button
                            key={f}
                            className={filter === f ? "active" : ""}
                            onClick={() => setFilter(f)}
                        >
                            {f === "all" ? "Tất cả" : statusInfo[f].label}
                            <span className="filter-count">
                                {f === "all" ? reports.length : reports.filter(r => r.status === f).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Report cards */}
            <div className="report-list">
                {filtered.map(r => {
                    const t = typeLabel[r.type];
                    const s = statusInfo[r.status];
                    return (
                        <div
                            key={r.id}
                            className={`report-card ${r.status}`}
                            onClick={() => setSelected(r)}
                        >
                            <div className="report-card-top">
                                <span className="report-type" style={{ color: t.color, borderColor: t.color + "44" }}>
                                    {t.icon} {t.label}
                                </span>
                                <span className="report-status" style={{ color: s.color }}>● {s.label}</span>
                            </div>
                            <div className="report-info">
                                <p>
                                    <strong>Người báo cáo:</strong> {r.reporter}
                                    {" → "}
                                    <strong>Đối tượng:</strong> @{r.target}
                                </p>
                                <p className="report-desc">{r.description}</p>
                                <p className="report-date">{r.date}</p>
                            </div>
                            {r.status === "pending" && (
                                <div className="report-actions" onClick={e => e.stopPropagation()}>
                                    <button className="act-btn unban" onClick={() => resolve(r.id)}>✅ Xử lý</button>
                                    <button className="act-btn view" onClick={() => dismiss(r.id)}>🚫 Bỏ qua</button>
                                    <button className="act-btn ban">🔒 Cấm ngay</button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="as-empty">🎉 Không có báo cáo nào!</div>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="user-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        <h3 style={{ marginBottom: 16 }}>📋 Chi tiết báo cáo #{selected.id}</h3>
                        <div className="um-stats">
                            <div className="um-stat">
                                <p>Người báo cáo</p><strong>{selected.reporter}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Đối tượng</p><strong>@{selected.target}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Loại vi phạm</p><strong>{typeLabel[selected.type].label}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Ngày báo cáo</p><strong>{selected.date}</strong>
                            </div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 14, margin: "16px 0", fontSize: 14, lineHeight: 1.6 }}>
                            {selected.description}
                        </div>
                        {selected.status === "pending" && (
                            <div className="um-actions">
                                <button className="act-btn unban lg" onClick={() => resolve(selected.id)}>✅ Đánh dấu đã xử lý</button>
                                <button className="act-btn ban lg">🔒 Cấm @{selected.target}</button>
                                <button className="act-btn view lg" onClick={() => dismiss(selected.id)}>🚫 Bỏ qua báo cáo</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
