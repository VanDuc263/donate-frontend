import { useEffect, useState } from "react";
import { getLatestDonation } from "../features/donate/donateApi";

const Feed = () => {
    const [latestDonation, setLatestDonation] = useState<any[]>([]);

    useEffect(() => {
        const fetchLatestDonation = async () => {
            const res = await getLatestDonation();
            setLatestDonation(res.data);
        };

        fetchLatestDonation();
    }, []);

    const formatMoney = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " VND";
    };

    const totalAmount = latestDonation.reduce(
        (sum, item) => sum + (item?.amount || 0),
        0
    );

    const highestAmount = latestDonation.reduce(
        (max, item) => Math.max(max, item?.amount || 0),
        0
    );

    return (
        <section className="feed">
            <div className="feed-shell">
                <div className="feed-header">
                    <div>
                        <h2>Donate Gan Day</h2>
                        <p className="feed-subtitle">Cap nhat giao dich moi nhat tu cong dong</p>
                    </div>
                </div>

                <div className="feed-stats">
                    <div className="feed-stat-card">
                        <span>Tong Luot</span>
                        <strong>{latestDonation.length}</strong>
                    </div>
                    <div className="feed-stat-card">
                        <span>Tong Gia Tri</span>
                        <strong>{formatMoney(totalAmount)}</strong>
                    </div>
                    <div className="feed-stat-card">
                        <span>Cao Nhat</span>
                        <strong>{formatMoney(highestAmount)}</strong>
                    </div>
                </div>

                <div className="feed-list">
                    {latestDonation.map((item, index) => (
                        <div key={index} className="feed-item">
                            <div className="feed-item-left">
                                <img
                                    src={item.avatar || "https://i.pravatar.cc/40"}
                                    alt={item.donorName || "donor avatar"}
                                />

                                <div className="feed-content">
                                    <span className="donor">{item.donorName}</span>
                                    <span className="text">da donate</span>
                                    <span className="amount">{formatMoney(item.amount || 0)}</span>
                                    {item.message ? <p className="feed-message">{item.message}</p> : null}
                                </div>
                            </div>

                            <span className="feed-rank">#{index + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Feed;