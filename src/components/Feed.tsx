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
        return amount.toLocaleString("vi-VN") + " VNĐ";
    };

    return (
        <section className="feed">
            <h2>Donate gần đây</h2>

            <div className="feed-list">
                {latestDonation.map((item, index) => (
                    <div key={index} className="feed-item">
                        <img
                            src={item.avatar || "https://i.pravatar.cc/40"}
                            alt=""
                        />

                        <div className="feed-content">
                            <span className="donor">{item.donorName}</span>
                            <span className="text">đã donate</span>
                            <span className="amount">
                                {formatMoney(item.amount)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Feed;