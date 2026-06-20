import React, { useEffect, useState } from "react";
import {
    getMyStatistics,
    StreamerStatisticPointResponse,
    StreamerStatisticsResponse,
} from "../../features/streamer/streamerApi";

const toInputDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const today = toInputDate(new Date());
const defaultStartDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return toInputDate(date);
})();

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

const getMonthKey = (value: string) => value.slice(0, 7);

const formatMonthLabel = (value: string) => {
    const [year, month] = value.split("-");
    return `${month}/${year}`;
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
    const yAxisValues = hasData
        ? [maxValue, maxValue * 0.66, maxValue * 0.33, 0]
        : [0, 0, 0, 0];

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
                    {yAxisValues.map((item, index) => (
                        <div key={`${title}-grid-${index}`} className="stats-chart-grid-row">
                            <span className="stats-chart-grid-value">
                                {valueFormatter(Math.round(item))}
                            </span>
                            <span className="stats-chart-grid-line" />
                        </div>
                    ))}
                </div>

                {hasData ? (
                    <div className="stats-bars">
                        {points.map((point) => {
                            const normalizedHeight =
                                maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                            const height = point.value > 0 ? Math.max(normalizedHeight, 8) : 0;

                            return (
                                <div className="stats-bar-col" key={`${title}-${point.label}`}>
                                    <span className="stats-bar-value">
                                        {valueFormatter(point.value)}
                                    </span>
                                    <div className="stats-bar-track">
                                        <div
                                            className={`stats-bar ${accentClass}`}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
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
    const [draftStartDate, setDraftStartDate] = useState(defaultStartDate);
    const [draftEndDate, setDraftEndDate] = useState(today);
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(today);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statistics, setStatistics] = useState<StreamerStatisticsResponse | null>(null);

    useEffect(() => {
        let ignore = false;

        const fetchStatistics = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await getMyStatistics(startDate, endDate);

                if (!ignore) {
                    setStatistics(res.data);
                }
            } catch (err) {
                console.error(err);
                if (!ignore) {
                    setError("Không tải được dữ liệu thống kê.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchStatistics();

        return () => {
            ignore = true;
        };
    }, [startDate, endDate]);

    const handleApply = () => {
        if (draftStartDate > draftEndDate) {
            window.alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");
            return;
        }

        setStartDate(draftStartDate);
        setEndDate(draftEndDate);
    };

    const handleReset = () => {
        setDraftStartDate(defaultStartDate);
        setDraftEndDate(today);
        setStartDate(defaultStartDate);
        setEndDate(today);
    };

    const dailyStats: StreamerStatisticPointResponse[] = statistics?.dailyStats || [];
    const totalDonations = statistics?.totalDonations || 0;
    const totalRevenue = statistics?.totalRevenue || 0;
    const totalFollowers = statistics?.totalFollowers || 0;
    const shouldGroupByMonth = getMonthKey(startDate) !== getMonthKey(endDate);

    const chartPoints = shouldGroupByMonth
        ? Object.values(
              dailyStats.reduce<Record<string, { label: string; donations: number; revenue: number }>>(
                  (acc, item) => {
                      const monthKey = getMonthKey(item.date);

                      if (!acc[monthKey]) {
                          acc[monthKey] = {
                              label: formatMonthLabel(monthKey),
                              donations: 0,
                              revenue: 0,
                          };
                      }

                      acc[monthKey].donations += item.donationCount;
                      acc[monthKey].revenue += item.revenue;
                      return acc;
                  },
                  {}
              )
          )
        : dailyStats.map((item) => ({
              label: item.date.slice(5).replace("-", "/"),
              donations: item.donationCount,
              revenue: item.revenue,
          }));

    return (
        <div className="profile-content">
            <div className="profile-card statistics-card">
                <div className="statistics-head">
                    <div>
                        <h2>Thống kê</h2>

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
                        <button
                            type="button"
                            className="statistics-apply-btn"
                            onClick={handleApply}
                        >
                            Áp dụng
                        </button>
                        <button
                            type="button"
                            className="statistics-reset-btn"
                            onClick={handleReset}
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>

                {error && <div className="promo-saved-badge promo-saved-badge-error">{error}</div>}

                <div className="statistics-summary">
                    <div className="statistics-stat-box">
                        <span>Lượt donate</span>
                        <strong>{loading ? "..." : totalDonations}</strong>
                    </div>

                    <div className="statistics-stat-box">
                        <span>Doanh thu</span>
                        <strong>{loading ? "..." : formatCompactMoney(totalRevenue)}</strong>
                    </div>

                    <div className="statistics-stat-box">
                        <span>Follower hiện tại</span>
                        <strong>{loading ? "..." : totalFollowers}</strong>
                    </div>
                </div>

                <div className="statistics-chart-list">
                    <MiniChart
                        title="Lượt donate"
                        accentClass="views"
                        total={loading ? "..." : `${totalDonations}`}
                        subtitle={
                            shouldGroupByMonth
                                ? "Biểu đồ doanh thu theo tháng"
                                : ""
                        }
                        points={chartPoints.map((item) => ({
                            label: item.label,
                            value: item.donations,
                        }))}
                        emptyLabel="Chưa có lượt donate thành công trong khoảng thời gian này."
                    />

                    <MiniChart
                        title="Doanh thu"
                        accentClass="revenue"
                        total={loading ? "..." : formatCompactMoney(totalRevenue)}
                        subtitle={
                            shouldGroupByMonth
                                ? "Biểu đồ doanh thu theo tháng"
                                : ""
                        }
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
