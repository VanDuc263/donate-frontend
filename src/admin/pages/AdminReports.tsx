import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../features/admin/adminApi";

interface ViolationReport {
    id: number;
    reporterId?: number;
    reporterUsername?: string;
    targetType: "STREAMER" | "USER" | "DONATION" | string;
    targetId: number;
    targetName?: string;
    reason: string;
    description?: string;
    evidenceUrl?: string;
    targetSnapshot?: string;
    status: "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED" | "FALSE_REPORT" | string;
    adminNote?: string;
    reviewedBy?: number;
    reviewedByUsername?: string;
    reviewedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

type FilterStatus = "ALL" | "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED" | "FALSE_REPORT";
type FilterTarget = "ALL" | "STREAMER" | "USER" | "DONATION";

const statusInfo: Record<string, { label: string; color: string; icon: string }> = {
    PENDING: { label: "Chờ xử lý", color: "#fbbf24", icon: "⏳" },
    REVIEWING: { label: "Đang xem", color: "#38bdf8", icon: "👀" },
    RESOLVED: { label: "Đúng / đã xử lý", color: "#4ade80", icon: "✅" },
    REJECTED: { label: "Từ chối", color: "#94a3b8", icon: "🚫" },
    FALSE_REPORT: { label: "Báo cáo bịa", color: "#fb7185", icon: "⚠️" },
};

const targetInfo: Record<string, { label: string; icon: string }> = {
    STREAMER: { label: "Streamer", icon: "🎮" },
    USER: { label: "User", icon: "👤" },
    DONATION: { label: "Donate", icon: "💸" },
};

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
};

const getErrorMessage = (err: any) => {
    return (
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Có lỗi xảy ra"
    );
};

const AdminReports = () => {
    const [reports, setReports] = useState<ViolationReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
    const [targetFilter, setTargetFilter] = useState<FilterTarget>("ALL");
    const [selected, setSelected] = useState<ViolationReport | null>(null);
    const [adminNote, setAdminNote] = useState("");

    const loadReports = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: { status?: string; targetType?: string } = {};
            if (statusFilter !== "ALL") params.status = statusFilter;
            if (targetFilter !== "ALL") params.targetType = targetFilter;

            const res = await adminApi.getReports(params);
            const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
            setReports(data);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, targetFilter]);

    const counts = useMemo(() => {
        const base: Record<string, number> = {
            ALL: reports.length,
            PENDING: 0,
            REVIEWING: 0,
            RESOLVED: 0,
            REJECTED: 0,
            FALSE_REPORT: 0,
        };

        reports.forEach((report) => {
            base[report.status] = (base[report.status] || 0) + 1;
        });

        return base;
    }, [reports]);

    const pendingCount = reports.filter((r) => r.status === "PENDING").length;

    const openDetail = async (report: ViolationReport) => {
        try {
            setError(null);
            const res = await adminApi.getReportDetail(report.id);
            setSelected(res.data);
            setAdminNote(res.data?.adminNote || "");
        } catch {
            setSelected(report);
            setAdminNote(report.adminNote || "");
        }
    };

    const updateStatus = async (status: "REVIEWING" | "RESOLVED" | "REJECTED" | "FALSE_REPORT") => {
        if (!selected) return;

        const confirmMessage: Record<string, string> = {
            REVIEWING: "Chuyển báo cáo này sang trạng thái đang xem xét?",
            RESOLVED: "Xác nhận báo cáo này là đúng / đã xử lý thủ công?",
            REJECTED: "Từ chối báo cáo này vì sai hoặc không đủ bằng chứng?",
            FALSE_REPORT: "Đánh dấu đây là báo cáo bịa đặt? User báo cáo sẽ bị ghi nhận lỗi.",
        };

        if (!window.confirm(confirmMessage[status])) return;

        try {
            setSaving(true);
            setError(null);
            const res = await adminApi.updateReportStatus(selected.id, {
                status,
                adminNote,
            });

            setReports((prev) =>
                prev.map((item) => (item.id === selected.id ? res.data : item))
            );
            setSelected(res.data);
            await loadReports();
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };


    const updateStatusForReport = async (report: ViolationReport, status: "REVIEWING" | "RESOLVED" | "REJECTED" | "FALSE_REPORT") => {
        const confirmMessage: Record<string, string> = {
            REVIEWING: "Chuyển báo cáo này sang trạng thái đang xem xét?",
            RESOLVED: "Xác nhận báo cáo này là đúng / đã xử lý thủ công?",
            REJECTED: "Từ chối báo cáo này vì sai hoặc không đủ bằng chứng?",
            FALSE_REPORT: "Đánh dấu đây là báo cáo bịa đặt? User báo cáo sẽ bị ghi nhận lỗi.",
        };

        if (!window.confirm(confirmMessage[status])) return;

        try {
            setSaving(true);
            setError(null);
            const res = await adminApi.updateReportStatus(report.id, {
                status,
                adminNote: report.adminNote || "",
            });

            setReports((prev) =>
                prev.map((item) => (item.id === report.id ? res.data : item))
            );

            if (selected?.id === report.id) {
                setSelected(res.data);
                setAdminNote(res.data?.adminNote || "");
            }

            await loadReports();
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const deleteReport = async (report: ViolationReport) => {
        if (!window.confirm(`Xóa báo cáo #${report.id}?`)) return;

        try {
            setSaving(true);
            setError(null);
            await adminApi.deleteReport(report.id);
            setReports((prev) => prev.filter((item) => item.id !== report.id));
            if (selected?.id === report.id) setSelected(null);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>🚨 Báo cáo vi phạm</h2>
                    <p>Quản lý báo cáo do người dùng gửi. Báo cáo đúng/sai đều do admin duyệt.</p>
                </div>

                <button className="as-add-btn" onClick={loadReports} disabled={loading}>
                    {loading ? "Đang tải..." : "↻ Tải lại"}
                </button>
            </div>

            {pendingCount > 0 && (
                <div className="report-alert">⚠️ Có {pendingCount} báo cáo đang chờ xử lý</div>
            )}

            {error && <div className="admin-error">{error}</div>}

            <div className="report-toolbar">
                <div className="as-filter-tabs">
                    {(["ALL", "PENDING", "REVIEWING", "RESOLVED", "REJECTED", "FALSE_REPORT"] as FilterStatus[]).map((status) => (
                        <button
                            key={status}
                            className={statusFilter === status ? "active" : ""}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "ALL" ? "Tất cả" : statusInfo[status]?.label}
                            <span className="filter-count">{counts[status] || 0}</span>
                        </button>
                    ))}
                </div>

                <select
                    className="admin-filter-select"
                    value={targetFilter}
                    onChange={(e) => setTargetFilter(e.target.value as FilterTarget)}
                >
                    <option value="ALL">Tất cả đối tượng</option>
                    <option value="STREAMER">Streamer</option>
                    <option value="USER">User</option>
                    <option value="DONATION">Donate</option>
                </select>
            </div>

            <div className="report-list">
                {loading ? (
                    <div className="as-empty">Đang tải báo cáo...</div>
                ) : reports.length === 0 ? (
                    <div className="as-empty">🎉 Không có báo cáo nào.</div>
                ) : (
                    reports.map((report) => {
                        const status = statusInfo[report.status] || statusInfo.PENDING;
                        const target = targetInfo[report.targetType] || { label: report.targetType, icon: "📌" };

                        return (
                            <div
                                key={report.id}
                                className={`report-card ${String(report.status).toLowerCase()}`}
                                onClick={() => openDetail(report)}
                            >
                                <div className="report-card-top">
                                    <span className="report-type">
                                        {target.icon} {target.label} #{report.targetId}
                                    </span>
                                    <span className="report-status" style={{ color: status.color }}>
                                        {status.icon} {status.label}
                                    </span>
                                </div>

                                <div className="report-info">
                                    <p>
                                        <strong>Người báo cáo:</strong> {report.reporterUsername || `User #${report.reporterId || "-"}`}
                                        {" → "}
                                        <strong>Đối tượng:</strong> {report.targetName || `${report.targetType} #${report.targetId}`}
                                    </p>
                                    <p><strong>Lý do:</strong> {report.reason}</p>
                                    <p className="report-desc">{report.description || "Không có mô tả chi tiết."}</p>
                                    <p className="report-date">Ngày gửi: {formatDate(report.createdAt)}</p>
                                </div>

                                <div className="report-actions" onClick={(e) => e.stopPropagation()}>
                                    {(report.status === "PENDING" || report.status === "REVIEWING") && (
                                        <>
                                            <button className="act-btn view" onClick={() => openDetail(report)}>👀 Xem</button>
                                            <button className="act-btn unban" onClick={() => updateStatusForReport(report, "RESOLVED")}>✅ Đúng</button>
                                            <button className="act-btn view" onClick={() => updateStatusForReport(report, "REJECTED")}>🚫 Từ chối</button>
                                            <button className="act-btn ban" onClick={() => updateStatusForReport(report, "FALSE_REPORT")}>⚠️ Bịa</button>
                                        </>
                                    )}
                                    <button className="act-btn danger-outline" onClick={() => deleteReport(report)}>🗑 Xóa</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="user-modal report-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelected(null)}>✕</button>

                        <h3>📋 Chi tiết báo cáo #{selected.id}</h3>

                        <div className="um-stats report-detail-grid">
                            <div className="um-stat">
                                <p>Người báo cáo</p>
                                <strong>{selected.reporterUsername || `User #${selected.reporterId || "-"}`}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Đối tượng</p>
                                <strong>{selected.targetName || `${selected.targetType} #${selected.targetId}`}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Loại đối tượng</p>
                                <strong>{targetInfo[selected.targetType]?.label || selected.targetType}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Trạng thái</p>
                                <strong>{statusInfo[selected.status]?.label || selected.status}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Ngày gửi</p>
                                <strong>{formatDate(selected.createdAt)}</strong>
                            </div>
                            <div className="um-stat">
                                <p>Người duyệt</p>
                                <strong>{selected.reviewedByUsername || (selected.reviewedBy ? `Admin #${selected.reviewedBy}` : "Chưa duyệt")}</strong>
                            </div>
                        </div>

                        <div className="report-detail-box">
                            <p><strong>Lý do:</strong> {selected.reason}</p>
                            <p><strong>Mô tả:</strong> {selected.description || "Không có mô tả."}</p>
                            {selected.evidenceUrl && (
                                <p>
                                    <strong>Bằng chứng:</strong>{" "}
                                    <a href={selected.evidenceUrl} target="_blank" rel="noreferrer">
                                        Mở link bằng chứng
                                    </a>
                                </p>
                            )}
                            {selected.targetSnapshot && (
                                <p><strong>Snapshot:</strong> {selected.targetSnapshot}</p>
                            )}
                        </div>

                        <div className="admin-form-grid one-col">
                            <label>
                                Ghi chú admin
                                <textarea
                                    rows={4}
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Ví dụ: Không đủ bằng chứng / Đã xác nhận vi phạm / Báo cáo sai sự thật..."
                                />
                            </label>
                        </div>

                        {(selected.status === "PENDING" || selected.status === "REVIEWING") && (
                            <div className="um-actions report-modal-actions">
                                <button className="act-btn view lg" disabled={saving} onClick={() => updateStatus("REVIEWING")}>
                                    👀 Đang xem xét
                                </button>
                                <button className="act-btn unban lg" disabled={saving} onClick={() => updateStatus("RESOLVED")}>
                                    ✅ Báo cáo đúng
                                </button>
                                <button className="act-btn view lg" disabled={saving} onClick={() => updateStatus("REJECTED")}>
                                    🚫 Từ chối
                                </button>
                                <button className="act-btn ban lg" disabled={saving} onClick={() => updateStatus("FALSE_REPORT")}>
                                    ⚠️ Báo cáo bịa
                                </button>
                            </div>
                        )}

                        <div className="report-modal-footer">
                            <button className="act-btn danger-outline lg" disabled={saving} onClick={() => deleteReport(selected)}>
                                🗑 Xóa báo cáo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
