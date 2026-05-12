import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../app/store";
import { DonationHistoryItem, getMyDonationHistory } from "../../features/donate/donateApi";

const formatMoney = (value?: number) => {
    if (value == null) return "0đ";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (value?: string | number[] | null) => {
    if (!value) return "Không rõ thời gian";

    let date: Date;

    if (Array.isArray(value)) {
        const [
            year,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0,
            nano = 0,
        ] = value;

        date = new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
            second,
            Math.floor(nano / 1000000)
        );
    } else {
        const raw = String(value).trim();

        if (!raw) return "Không rõ thời gian";

        date = new Date(raw);
    }

    if (Number.isNaN(date.getTime())) {
        return "Không rõ thời gian";
    }

    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

const DonationHistoryPage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const role = user?.role?.replace("ROLE_", "");
    const isStreamer = role === "STREAMER";

    const [donations, setDonations] = useState<DonationHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const title = useMemo(() => {
        return isStreamer ? "Lịch sử nhận donate" : "Lịch sử donate";
    }, [isStreamer]);

    useEffect(() => {
        let ignore = false;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await getMyDonationHistory(50);

                if (!ignore) {
                    setDonations(res.data || []);
                }
            } catch (err: any) {
                if (!ignore) {
                    setError(err?.response?.data?.message || "Không lấy được lịch sử donate.");
                    setDonations([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchHistory();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div className="profile-content">
            <div className="profile-card donation-history-card">
                <div className="donation-history-head">
                    <div>
                        <h2>{title}</h2>
                        <p>Chỉ hiển thị các giao dịch đã thanh toán thành công.</p>
                    </div>

                    <span className="donation-count">{donations.length} giao dịch</span>
                </div>

                {loading && <p className="empty-msg">Đang tải lịch sử donate...</p>}

                {!loading && error && <p className="donation-error">{error}</p>}

                {!loading && !error && donations.length === 0 && (
                    <div className="donation-empty">
                        <h3>Chưa có donate nào</h3>
                        <p>
                            {isStreamer
                                ? "Khi có người donate thành công, giao dịch sẽ xuất hiện tại đây."
                                : "Sau khi bạn donate thành công, giao dịch sẽ xuất hiện tại đây."}
                        </p>
                    </div>
                )}

                {!loading && !error && donations.length > 0 && (
                    <div className="donation-history-list">
                        {donations.map((item) => (
                            <div className="dh-item" key={item.id}>
                                <div className="dh-left">
                                    <div className="dh-avatar">
                                        {isStreamer
                                            ? (item.donorName || "A").charAt(0).toUpperCase()
                                            : item.streamerAvatar
                                                ? <img src={item.streamerAvatar} alt={item.streamerName || "streamer"} />
                                                : (item.streamerName || "S").charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <div className="dh-streamer">
                                            {isStreamer ? (
                                                <>Từ: {item.donorName || "Anonymous"}</>
                                            ) : item.streamerToken ? (
                                                <>
                                                    Đến:{" "}
                                                    <Link to={`/streamer/${item.streamerToken}`}>
                                                        {item.streamerName || "Streamer"}
                                                    </Link>
                                                </>
                                            ) : (
                                                <>Đến: {item.streamerName || "Streamer"}</>
                                            )}
                                        </div>

                                        {item.message && <div className="dh-msg">“{item.message}”</div>}

                                        <div className="dh-meta">
                                            <span>{formatDate(item.createdAt)}</span>
                                            {item.referenceCode && <span>Mã GD: {item.referenceCode}</span>}
                                            {item.content && <span>Nội dung: {item.content}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="dh-right">
                                    <div className="dh-amount">{formatMoney(item.amount)}</div>
                                    <span className="dh-status">{item.status || "SUCCESS"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationHistoryPage;
