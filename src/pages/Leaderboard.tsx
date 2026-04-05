import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { fetchLeaderboard, setPeriod, LeaderboardEntry } from "../features/leaderboard/leaderboardSlice";
import { useNavigate } from "react-router-dom";
import "../styles/leaderboard.css";

const formatMoney = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n.toString();
};

const badgeIcon: Record<string, string> = {
    gold: "🥇",
    silver: "🥈",
    bronze: "🥉",
    none: "",
};

const changeIcon: Record<string, string> = {
    up: "▲",
    down: "▼",
    same: "—",
};

const Leaderboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { data, loading, period } = useSelector((state: RootState) => state.leaderboard);

    useEffect(() => {
        dispatch(fetchLeaderboard());
    }, [dispatch, period]);

    const periods = [
        { key: "week", label: "Tuần này" },
        { key: "month", label: "Tháng này" },
        { key: "alltime", label: "Toàn thời gian" },
    ];

    const top3 = data.slice(0, 3);
    const rest = data.slice(3);

    return (
        <div className="lb-page">
            {/* Hero Banner */}
            <div className="lb-hero">
                <h1>🏆 Bảng Xếp Hạng Streamer</h1>
                <p>Những streamer được donate nhiều nhất trên ZyScan</p>

                {/* Period selector */}
                <div className="lb-period">
                    {periods.map((p) => (
                        <button
                            key={p.key}
                            className={period === p.key ? "active" : ""}
                            onClick={() => dispatch(setPeriod(p.key as any))}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="lb-loading">
                    <div className="spinner" />
                    <p>Đang tải bảng xếp hạng...</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    <div className="lb-podium">
                        {/* Silver - rank 2 */}
                        {top3[1] && (
                            <div className="podium-item silver" onClick={() => navigate(`/streamer/${top3[1].rank - 1}`)}>
                                <div className="podium-avatar">
                                    <img src={top3[1].avatar} alt={top3[1].streamerName} />
                                    <span className="podium-badge">{badgeIcon[top3[1].badge]}</span>
                                </div>
                                <div className="podium-name">{top3[1].streamerName}</div>
                                <div className="podium-money">{formatMoney(top3[1].totalDonated)}đ</div>
                                <div className="podium-stand silver-stand">
                                    <span>#2</span>
                                </div>
                            </div>
                        )}

                        {/* Gold - rank 1 */}
                        {top3[0] && (
                            <div className="podium-item gold" onClick={() => navigate(`/streamer/${top3[0].rank - 1}`)}>
                                <div className="crown">👑</div>
                                <div className="podium-avatar">
                                    <img src={top3[0].avatar} alt={top3[0].streamerName} />
                                    <span className="podium-badge">{badgeIcon[top3[0].badge]}</span>
                                </div>
                                <div className="podium-name">{top3[0].streamerName}</div>
                                <div className="podium-money">{formatMoney(top3[0].totalDonated)}đ</div>
                                <div className="podium-stand gold-stand">
                                    <span>#1</span>
                                </div>
                            </div>
                        )}

                        {/* Bronze - rank 3 */}
                        {top3[2] && (
                            <div className="podium-item bronze" onClick={() => navigate(`/streamer/${top3[2].rank - 1}`)}>
                                <div className="podium-avatar">
                                    <img src={top3[2].avatar} alt={top3[2].streamerName} />
                                    <span className="podium-badge">{badgeIcon[top3[2].badge]}</span>
                                </div>
                                <div className="podium-name">{top3[2].streamerName}</div>
                                <div className="podium-money">{formatMoney(top3[2].totalDonated)}đ</div>
                                <div className="podium-stand bronze-stand">
                                    <span>#3</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rest of the list */}
                    <div className="lb-table-wrapper">
                        <table className="lb-table">
                            <thead>
                                <tr>
                                    <th>Hạng</th>
                                    <th>Streamer</th>
                                    <th>Game</th>
                                    <th>Donors</th>
                                    <th>Tổng donate</th>
                                    <th>Xu hướng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rest.map((entry: LeaderboardEntry) => (
                                    <tr
                                        key={entry.rank}
                                        className="lb-row"
                                        onClick={() => navigate(`/streamer/${entry.rank - 1}`)}
                                    >
                                        <td className="lb-rank">#{entry.rank}</td>
                                        <td className="lb-streamer">
                                            <img src={entry.avatar} alt={entry.streamerName} />
                                            <span>{entry.streamerName}</span>
                                        </td>
                                        <td className="lb-game">{entry.game}</td>
                                        <td className="lb-donors">{entry.donorCount.toLocaleString()}</td>
                                        <td className="lb-money">{formatMoney(entry.totalDonated)}đ</td>
                                        <td className={`lb-change ${entry.change}`}>
                                            {changeIcon[entry.change]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboard;
