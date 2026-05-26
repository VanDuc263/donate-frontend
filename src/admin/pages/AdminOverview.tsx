import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchAdminStats } from "../../features/admin/adminSlice";

const money = (n?: number | null) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;
const compact = (n?: number | null) => {
    const x = Number(n || 0);
    if (x >= 1_000_000_000) return `${(x / 1_000_000_000).toFixed(1)} tỷ`;
    if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(1)} triệu`;
    if (x >= 1_000) return `${(x / 1_000).toFixed(1)}K`;
    return x.toString();
};

const AdminOverview = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, loading, error } = useSelector((state: RootState) => state.admin);

    useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

    if (loading && !stats) {
        return <div className="admin-loading"><div className="a-spinner" /><p>Đang tải dữ liệu admin...</p></div>;
    }

    if (error && !stats) {
        return <div className="admin-error">⚠️ {error}</div>;
    }

    if (!stats) return null;

    const revenueMax = Math.max(...(stats.revenueChart || []).map(x => x.amount || 0), 1);
    const userMax = Math.max(...(stats.userGrowth || []).map(x => x.count || 0), 1);

    const cards = [
        { icon: "👥", label: "Tổng người dùng", value: stats.totalUsers, sub: "Tài khoản trong hệ thống", color: "blue" },
        { icon: "🎮", label: "Streamers", value: stats.totalStreamers, sub: "Trang donate đã tạo", color: "purple" },
        { icon: "💳", label: "Donate", value: stats.totalDonations, sub: `${stats.successRate || 0}% thành công`, color: "teal" },
        { icon: "💰", label: "Tổng tiền donate", value: compact(stats.totalRevenue), sub: "Chỉ tính SUCCESS", color: "gold" },
        { icon: "👛", label: "Số dư ví", value: compact(stats.totalWalletBalance as any), sub: "Tổng balance ví", color: "green" },
        { icon: "🏦", label: "PTTT active", value: stats.activePaymentMethods, sub: "System payment methods", color: "red" },
    ];

    return (
        <div className="aov-page">
            <div className="aov-header">
                <h1>📊 Tổng quan hệ thống</h1>
                <button className="view-toggle" onClick={() => dispatch(fetchAdminStats())}>↻ Tải lại</button>
            </div>

            {error && <div className="admin-error small">⚠️ {error}</div>}

            <div className="aov-cards">
                {cards.map((c, i) => (
                    <div key={i} className={`aov-card ${c.color}`}>
                        <div className="aov-card-icon">{c.icon}</div>
                        <div>
                            <p className="aov-card-label">{c.label}</p>
                            <p className="aov-card-value">{typeof c.value === "number" ? c.value.toLocaleString("vi-VN") : c.value}</p>
                            <p className="aov-card-sub">{c.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="aov-charts">
                <div className="aov-chart-box">
                    <h3>💰 Doanh thu donate 7 tháng</h3>
                    <div className="a-bar-chart">
                        {stats.revenueChart?.map((d, i) => (
                            <div key={i} className="a-bar-col">
                                <div className="a-bar-tooltip">{money(d.amount)}</div>
                                <div className="a-bar revenue" style={{ height: `${((d.amount || 0) / revenueMax) * 100}%` }} />
                                <span className="a-bar-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="aov-chart-box">
                    <h3>👥 User mới 7 tháng</h3>
                    <div className="a-bar-chart">
                        {stats.userGrowth?.map((d, i) => (
                            <div key={i} className="a-bar-col">
                                <div className="a-bar-tooltip">{(d.count || 0).toLocaleString("vi-VN")} user</div>
                                <div className="a-bar users" style={{ height: `${((d.count || 0) / userMax) * 100}%` }} />
                                <span className="a-bar-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="aov-chart-box categories">
                    <h3>🧾 Donate gần nhất</h3>
                    <div className="admin-mini-list">
                        {stats.latestDonations?.length ? stats.latestDonations.map(d => (
                            <div className="mini-row" key={d.id}>
                                <span>#{d.id} {d.donorName || "Ẩn danh"} → {d.streamerName || "Streamer"}</span>
                                <b>{money(d.amount)}</b>
                            </div>
                        )) : <p className="admin-muted">Chưa có donate.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
