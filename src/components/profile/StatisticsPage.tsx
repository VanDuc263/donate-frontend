import React, { useState } from "react";

type StatisticPoint = {
    date: string;
    views: number;
    revenue: number;
};

const statisticSeed: StatisticPoint[] = [
    { date: "2026-06-07", views: 1, revenue: 0 },
    { date: "2026-06-08", views: 3, revenue: 120000 },
    { date: "2026-06-09", views: 2, revenue: 0 },
    { date: "2026-06-10", views: 4, revenue: 250000 },
    { date: "2026-06-11", views: 1, revenue: 0 },
    { date: "2026-06-12", views: 6, revenue: 420000 },
    { date: "2026-06-13", views: 5, revenue: 180000 },
    { date: "2026-06-14", views: 2, revenue: 0 },
];

const today = "2026-06-14";
const defaultStart = "2026-06-07";

const formatDateLabel = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
};

const formatCompactMoney = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);

const formatAxisMoney = (value: number) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}tr`;
    }

    if (value >= 1000) {
        return `${Math.round(value / 1000)}k`;
    }

    return `${value}`;
};

type MiniChartProps = {
    title: string;
    accentClass: string;
    total: string;
    subtitle: string;
    points: { label: string; value: number }[];
    valueFormatter?: (value: number) => string;
    emptyLabel: string;
};

const MiniChart = ({
    title,
    accentClass,
    total,
    subtitle,
    points,
    valueFormatter = (value) => `${value}`,
    emptyLabel,
}: MiniChartProps) => {
    const maxValue = Math.max(...points.map((item) => item.value), 0);
    const hasData = maxValue > 0;

    return (
        <section className="stats-chart-card">
            <div className="stats-chart-head">
                <div>
                    <span className={`stats-chart-kicker ${accentClass}`}>{title}</span>
                    <strong>{total}</strong>
                    <p>{subtitle}</p>
                </div>
            </div>

            <div className="stats-chart-shell">
                <div className="stats-chart-grid">
                    {[0, 1, 2, 3].map((item) => (
                        <span key={item} />
                    ))}
                </div>

                {hasData ? (
                    <div className="stats-bars">
                        {points.map((point) => {
                            const height = Math.max((point.value / maxValue) * 100, point.value > 0 ? 10 : 4);

                            return (
                                <div className="stats-bar-col" key={`${title}-${point.label}`}>
                                    <span className="stats-bar-value">
                                        {valueFormatter(point.value)}
                                    </span>
                                    <div className={`stats-bar ${accentClass}`} style={{ height: `${height}%` }} />
                                    <span className="stats-bar-label">{point.label}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="stats-chart-empty">{emptyLabel}</div>
                )}
            </div>
        </section>
    );
};

const StatisticsPage = () => {
    const [draftStartDate, setDraftStartDate] = useState(defaultStart);
    const [draftEndDate, setDraftEndDate] = useState(today);
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(today);

    const filteredData = statisticSeed.filter(
        (item) => item.date >= startDate && item.date <= endDate
    );

    const totalViews = filteredData.reduce((sum, item) => sum + item.views, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
    const bestDay = filteredData.reduce<StatisticPoint | null>((best, item) => {
        if (!best || item.revenue > best.revenue) {
            return item;
        }

        return best;
    }, null);

    const chartPoints = filteredData.map((item) => ({
        label: item.date.slice(5).replace("-", "/"),
        views: item.views,
        revenue: item.revenue,
    }));

    const handleApply = () => {
        if (draftStartDate > draftEndDate) {
            alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");
            return;
        }

        setStartDate(draftStartDate);
        setEndDate(draftEndDate);
    };

    const handleReset = () => {
        setDraftStartDate(defaultStart);
        setDraftEndDate(today);
        setStartDate(defaultStart);
        setEndDate(today);
    };

    return (
        <div className="profile-content">
            <div className="profile-card statistics-card">
                <div className="statistics-head">
                    <div>
                        <h2>Thống Kê</h2>
                        <p>Theo dõi lượt truy cập và doanh thu của trang donate trong khoảng thời gian bạn chọn.</p>
                    </div>
                    <div className="statistics-range-note">
                        <span>Khoảng đang xem</span>
                        <strong>
                            {formatDateLabel(startDate)} - {formatDateLabel(endDate)}
                        </strong>
                    </div>
                </div>

                <div className="statistics-toolbar">
                    <div className="statistics-filter-group">
                        <label htmlFor="stats-start-date">Từ ngày</label>
                        <input
                            id="stats-start-date"
                            type="date"
                            value={draftStartDate}
                            onChange={(e) => setDraftStartDate(e.target.value)}
                            max={draftEndDate}
                        />
                    </div>

                    <div className="statistics-filter-group">
                        <label htmlFor="stats-end-date">Đến ngày</label>
                        <input
                            id="stats-end-date"
                            type="date"
                            value={draftEndDate}
                            onChange={(e) => setDraftEndDate(e.target.value)}
                            min={draftStartDate}
                            max={today}
                        />
                    </div>

                    <div className="statistics-toolbar-actions">
                        <button type="button" className="statistics-apply-btn" onClick={handleApply}>
                            Áp dụng
                        </button>
                        <button type="button" className="statistics-reset-btn" onClick={handleReset}>
                            Đặt lại
                        </button>
                    </div>
                </div>

                <div className="statistics-summary">
                    <div className="statistics-stat-box">
                        <span>Lượt truy cập</span>
                        <strong>{totalViews}</strong>
                        <p>Tổng số lượt mở trang donate trong khoảng thời gian đang xem.</p>
                    </div>

                    <div className="statistics-stat-box">
                        <span>Doanh thu</span>
                        <strong>{formatCompactMoney(totalRevenue)}</strong>
                        <p>Tổng số tiền nhận được từ các lượt donate mẫu trong giai đoạn này.</p>
                    </div>

                    <div className="statistics-stat-box">
                        <span>Ngày nổi bật</span>
                        <strong>{bestDay ? formatDateLabel(bestDay.date) : "--"}</strong>
                        <p>
                            {bestDay && bestDay.revenue > 0
                                ? `Doanh thu cao nhất đạt ${formatCompactMoney(bestDay.revenue)}.`
                                : "Chưa có ngày nào phát sinh doanh thu trong khoảng này."}
                        </p>
                    </div>
                </div>

                <div className="statistics-chart-list">
                    <MiniChart
                        title="Lượt truy cập"
                        accentClass="views"
                        total={`${totalViews}`}
                        subtitle="Biểu đồ tổng lượt xem theo ngày"
                        points={chartPoints.map((item) => ({
                            label: item.label,
                            value: item.views,
                        }))}
                        emptyLabel="Chưa có dữ liệu lượt truy cập trong khoảng thời gian này."
                    />

                    <MiniChart
                        title="Doanh thu"
                        accentClass="revenue"
                        total={formatCompactMoney(totalRevenue)}
                        subtitle="Biểu đồ doanh thu theo ngày"
                        points={chartPoints.map((item) => ({
                            label: item.label,
                            value: item.revenue,
                        }))}
                        valueFormatter={formatAxisMoney}
                        emptyLabel="Chưa có doanh thu phát sinh trong khoảng thời gian này."
                    />
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
