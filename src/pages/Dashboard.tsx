import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { fetchDashboard } from "../features/dashboard/dashboardSlice";
import "../styles/dashboard.css";

const formatMoney = (n: number) =>
    n.toLocaleString("vi-VN") + "đ";

const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading } = useSelector((state: RootState) => state.dashboard);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    if (loading || !data) {
        return (
            <div className="dash-loading">
                <div className="spinner" />
                <p>Đang tải dashboard...</p>
            </div>
        );
    }

    const maxAmount = Math.max(...data.chartData.map((d) => d.amount));

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-header">
                <div>
                    <h1>📊 Dashboard</h1>
                    <p>Xin chào, <strong>{user?.username || "Streamer"}</strong> 👋</p>
                </div>
                <button className="dash-copy-btn">
                    📋 Sao chép link donate
                </button>
            </div>

            {/* Stats Cards */}
            <div className="dash-stats">
                <div className="stat-card teal">
                    <div className="stat-icon">💰</div>
                    <div>
                        <p className="stat-label">Tổng thu nhập</p>
                        <p className="stat-value">{formatMoney(data.totalEarned)}</p>
                    </div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-icon">📅</div>
                    <div>
                        <p className="stat-label">Tháng này</p>
                        <p className="stat-value">{formatMoney(data.thisMonthEarned)}</p>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon">👥</div>
                    <div>
                        <p className="stat-label">Tổng donors</p>
                        <p className="stat-value">{data.totalDonors.toLocaleString()}</p>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon">⭐</div>
                    <div>
                        <p className="stat-label">Top donor</p>
                        <p className="stat-value">{data.topDonor}</p>
                    </div>
                </div>
            </div>

            {/* Chart + Recent Transactions */}
            <div className="dash-main">
                {/* Bar Chart */}
                <div className="dash-chart-box">
                    <h3>📈 Donate 7 ngày qua</h3>
                    <div className="bar-chart">
                        {data.chartData.map((d, i) => (
                            <div key={i} className="bar-col">
                                <div className="bar-tooltip">{formatMoney(d.amount)}</div>
                                <div
                                    className="bar"
                                    style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                                />
                                <span className="bar-label">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="dash-transactions">
                    <h3>🔔 Giao dịch gần đây</h3>
                    <div className="tx-list">
                        {data.recentTransactions.map((tx) => (
                            <div key={tx.id} className="tx-item">
                                <div className="tx-left">
                                    <div className={`tx-dot ${tx.status}`} />
                                    <div>
                                        <p className="tx-name">{tx.donorName}</p>
                                        {tx.message && <p className="tx-msg">"{tx.message}"</p>}
                                        <p className="tx-time">{tx.timestamp}</p>
                                    </div>
                                </div>
                                <div className="tx-right">
                                    <span className="tx-amount">+{formatMoney(tx.amount)}</span>
                                    <span className={`tx-status ${tx.status}`}>
                                        {tx.status === "completed" ? "✓" : tx.status === "pending" ? "⏳" : "✗"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dash-actions">
                <h3>⚡ Thao tác nhanh</h3>
                <div className="action-grid">
                    <button className="action-btn">🎨 Tùy chỉnh trang</button>
                    <button className="action-btn">🔔 Cài alert âm thanh</button>
                    <button className="action-btn">💳 Rút tiền</button>
                    <button className="action-btn">📊 Xem báo cáo</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
