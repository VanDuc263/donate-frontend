import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchAdminStats } from "../../features/admin/adminSlice";

const fmt = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + " triệu";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
    return n.toString();
};

const AdminOverview = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, loading } = useSelector((state: RootState) => state.admin);

    useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

    if (loading || !stats) {
        return (
            <div className="admin-loading">
                <div className="a-spinner" />
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    const maxRevenue = Math.max(...stats.revenueChart.map(d => d.amount));
    const maxUsers   = Math.max(...stats.userGrowth.map(d => d.count));

    const statCards = [
        { icon: "👥", label: "Tổng người dùng",  value: stats.totalUsers.toLocaleString(),       color: "blue",   sub: `+${stats.newThisMonth} tháng này` },
        { icon: "🎮", label: "Streamer",           value: stats.totalStreamers.toLocaleString(),   color: "purple", sub: "đang hoạt động" },
        { icon: "💳", label: "Tổng giao dịch",    value: stats.totalDonations.toLocaleString(),   color: "teal",   sub: `${stats.successRate}% thành công` },
        { icon: "💰", label: "Doanh thu hệ thống", value: fmt(stats.totalRevenue) + "đ",           color: "gold",   sub: "tổng tích luỹ" },
        { icon: "🟢", label: "Hoạt động hôm nay", value: stats.activeToday.toLocaleString(),      color: "green",  sub: "người dùng online" },
        { icon: "🚨", label: "Báo cáo chờ xử lý", value: stats.pendingReports.toString(),         color: "red",    sub: "cần xử lý ngay" },
    ];

    return (
        <div className="aov-page">
            <div className="aov-header">
                <h1>📊 Tổng quan hệ thống</h1>
                <span className="aov-date">Cập nhật: {new Date().toLocaleDateString("vi-VN")}</span>
            </div>

            {/* Stat cards */}
            <div className="aov-cards">
                {statCards.map((c, i) => (
                    <div key={i} className={`aov-card ${c.color}`}>
                        <div className="aov-card-icon">{c.icon}</div>
                        <div>
                            <p className="aov-card-label">{c.label}</p>
                            <p className="aov-card-value">{c.value}</p>
                            <p className="aov-card-sub">{c.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="aov-charts">
                {/* Revenue bar chart */}
                <div className="aov-chart-box">
                    <h3>💰 Doanh thu 7 tháng</h3>
                    <div className="a-bar-chart">
                        {stats.revenueChart.map((d, i) => (
                            <div key={i} className="a-bar-col">
                                <div className="a-bar-tooltip">{fmt(d.amount)}đ</div>
                                <div
                                    className="a-bar revenue"
                                    style={{ height: `${(d.amount / maxRevenue) * 100}%` }}
                                />
                                <span className="a-bar-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User growth line-style bar */}
                <div className="aov-chart-box">
                    <h3>👥 Người dùng mới</h3>
                    <div className="a-bar-chart">
                        {stats.userGrowth.map((d, i) => (
                            <div key={i} className="a-bar-col">
                                <div className="a-bar-tooltip">{d.count.toLocaleString()} người</div>
                                <div
                                    className="a-bar users"
                                    style={{ height: `${(d.count / maxUsers) * 100}%` }}
                                />
                                <span className="a-bar-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top categories donut-style */}
                <div className="aov-chart-box categories">
                    <h3>🎮 Danh mục phổ biến</h3>
                    <div className="cat-list">
                        {stats.topCategories.map((c, i) => (
                            <div key={i} className="cat-row">
                                <span className="cat-name">{c.name}</span>
                                <div className="cat-bar-wrap">
                                    <div
                                        className="cat-bar"
                                        style={{
                                            width: `${c.percent}%`,
                                            background: ["#38bdf8","#a78bfa","#fb923c","#4ade80","#94a3b8"][i],
                                        }}
                                    />
                                </div>
                                <span className="cat-pct">{c.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div className="aov-quicklinks">
                <h3>⚡ Truy cập nhanh</h3>
                <div className="ql-grid">
                    {[
                        { icon: "👥", label: "Quản lý Users", to: "/admin/users" },
                        { icon: "🎮", label: "Quản lý Streamers", to: "/admin/streamers" },
                        { icon: "💳", label: "Giao dịch", to: "/admin/transactions" },
                        { icon: "🚨", label: "Báo cáo vi phạm", to: "/admin/reports" },
                    ].map((q, i) => (
                        <a key={i} href={q.to} className="ql-btn">
                            <span>{q.icon}</span>
                            <span>{q.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
