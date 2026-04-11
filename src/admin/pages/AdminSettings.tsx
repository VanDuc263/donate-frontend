import React, { useState } from "react";

const AdminSettings = () => {
    const [minDonate, setMinDonate] = useState("5000");
    const [maxDonate, setMaxDonate] = useState("10000000");
    const [platformFee, setPlatformFee] = useState("2.5");
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>⚙️ Cài đặt hệ thống</h2>
                    <p>Quản lý các thông số vận hành của ZyScan</p>
                </div>
                <button className="as-add-btn" onClick={handleSave}>
                    💾 Lưu tất cả
                </button>
            </div>

            {saved && (
                <div className="settings-saved-toast">✅ Đã lưu cài đặt thành công!</div>
            )}

            <div className="settings-grid">
                {/* Donate Settings */}
                <div className="settings-card">
                    <h3>💰 Cài đặt Donate</h3>
                    <div className="setting-field">
                        <label>Số tiền tối thiểu (đ)</label>
                        <input
                            type="number"
                            value={minDonate}
                            onChange={e => setMinDonate(e.target.value)}
                            className="setting-input"
                        />
                    </div>
                    <div className="setting-field">
                        <label>Số tiền tối đa (đ)</label>
                        <input
                            type="number"
                            value={maxDonate}
                            onChange={e => setMaxDonate(e.target.value)}
                            className="setting-input"
                        />
                    </div>
                    <div className="setting-field">
                        <label>Phí nền tảng (%)</label>
                        <input
                            type="number"
                            value={platformFee}
                            onChange={e => setPlatformFee(e.target.value)}
                            className="setting-input"
                            step="0.1"
                            min="0"
                            max="20"
                        />
                        <p className="field-hint">Hiện tại: {platformFee}% mỗi giao dịch thành công</p>
                    </div>
                </div>

                {/* System toggles */}
                <div className="settings-card">
                    <h3>🔧 Hệ thống</h3>
                    <div className="setting-toggle-row">
                        <div>
                            <p className="toggle-title">Chế độ bảo trì</p>
                            <p className="toggle-sub">Tạm khóa toàn bộ giao dịch</p>
                        </div>
                        <div
                            className={`big-toggle ${maintenanceMode ? "on danger" : ""}`}
                            onClick={() => setMaintenanceMode(v => !v)}
                        >
                            <div className="big-toggle-ball" />
                        </div>
                    </div>
                    <div className="setting-toggle-row">
                        <div>
                            <p className="toggle-title">Email thông báo</p>
                            <p className="toggle-sub">Gửi email cho admin khi có sự kiện</p>
                        </div>
                        <div
                            className={`big-toggle ${emailNotif ? "on" : ""}`}
                            onClick={() => setEmailNotif(v => !v)}
                        >
                            <div className="big-toggle-ball" />
                        </div>
                    </div>
                    <div className="setting-toggle-row">
                        <div>
                            <p className="toggle-title">Tự động duyệt streamer</p>
                            <p className="toggle-sub">Duyệt tài khoản streamer tự động</p>
                        </div>
                        <div
                            className={`big-toggle ${autoApprove ? "on" : ""}`}
                            onClick={() => setAutoApprove(v => !v)}
                        >
                            <div className="big-toggle-ball" />
                        </div>
                    </div>
                </div>

                {/* Danger zone */}
                <div className="settings-card danger-card">
                    <h3>⚠️ Vùng nguy hiểm</h3>
                    <div className="danger-actions">
                        <div className="danger-item">
                            <div>
                                <p className="danger-title">Xóa cache hệ thống</p>
                                <p className="danger-sub">Làm sạch toàn bộ cache Redis</p>
                            </div>
                            <button className="danger-btn secondary">🗑️ Xóa cache</button>
                        </div>
                        <div className="danger-item">
                            <div>
                                <p className="danger-title">Xuất dữ liệu</p>
                                <p className="danger-sub">Tải toàn bộ DB dạng CSV</p>
                            </div>
                            <button className="danger-btn secondary">📥 Xuất CSV</button>
                        </div>
                        <div className="danger-item">
                            <div>
                                <p className="danger-title">Reset hệ thống</p>
                                <p className="danger-sub text-danger">Hành động này không thể hoàn tác!</p>
                            </div>
                            <button className="danger-btn primary">💣 Reset</button>
                        </div>
                    </div>
                </div>

                {/* System info */}
                <div className="settings-card">
                    <h3>📋 Thông tin hệ thống</h3>
                    <div className="sysinfo-list">
                        {[
                            { label: "Phiên bản",    value: "v2.4.1" },
                            { label: "Môi trường",   value: "Production" },
                            { label: "Node.js",      value: "v20.11.0" },
                            { label: "Database",     value: "PostgreSQL 15" },
                            { label: "Redis",        value: "7.2.4" },
                            { label: "Uptime",       value: "14 ngày 6 giờ" },
                            { label: "RAM sử dụng",  value: "1.2 GB / 4 GB" },
                            { label: "CPU",          value: "12%" },
                        ].map((item, i) => (
                            <div key={i} className="sysinfo-row">
                                <span className="sysinfo-label">{item.label}</span>
                                <span className="sysinfo-value">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
