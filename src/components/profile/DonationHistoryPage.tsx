import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../app/store";
import {
    DonationHistoryItem,
    getMyReceivedDonationHistory,
    getMySentDonationHistory,
} from "../../features/donate/donateApi";

type HistoryTab = "received" | "sent";

const PAGE_SIZE = 20;

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

    const [activeTab, setActiveTab] = useState<HistoryTab>(isStreamer ? "received" : "sent");
    const [donations, setDonations] = useState<DonationHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const title = useMemo(() => {
        return activeTab === "received" ? "Lịch sử nhận donate" : "Lịch sử gửi donate";
    }, [activeTab]);

    const description = useMemo(() => {
        return activeTab === "received"
            ? "Hiển thị các khoản donate bạn đã nhận thành công."
            : "Hiển thị các khoản donate bạn đã gửi thành công.";
    }, [activeTab]);

    const emptyText = useMemo(() => {
        return activeTab === "received"
            ? "Khi có người donate thành công, giao dịch sẽ xuất hiện tại đây."
            : "Sau khi bạn donate thành công, giao dịch sẽ xuất hiện tại đây.";
    }, [activeTab]);

    const totalPages = Math.max(1, Math.ceil(donations.length / PAGE_SIZE));

    const paginatedDonations = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return donations.slice(start, start + PAGE_SIZE);
    }, [currentPage, donations]);

    useEffect(() => {
        let ignore = false;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError("");
                setCurrentPage(1);

                const res = activeTab === "received"
                    ? await getMyReceivedDonationHistory(50)
                    : await getMySentDonationHistory(50);

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
    }, [activeTab]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="profile-content">
            <div className="profile-card donation-history-card">
                <div className="donation-history-head">
                    <div>
                        <h2>{title}</h2>
                        <p>{description}</p>

                        <div className="donation-history-tabs">
                            <button
                                type="button"
                                className={activeTab === "received" ? "active" : ""}
                                onClick={() => setActiveTab("received")}
                            >
                                Lịch sử nhận
                            </button>
                            <button
                                type="button"
                                className={activeTab === "sent" ? "active" : ""}
                                onClick={() => setActiveTab("sent")}
                            >
                                Lịch sử gửi
                            </button>
                        </div>
                    </div>

                    <span className="donation-count">{donations.length} giao dịch</span>
                </div>

                {loading && <p className="empty-msg">Đang tải lịch sử donate...</p>}

                {!loading && error && <p className="donation-error">{error}</p>}

                {!loading && !error && donations.length === 0 && (
                    <div className="donation-empty">
                        <h3>Chưa có donate nào</h3>
                        <p>{emptyText}</p>
                    </div>
                )}

                {!loading && !error && donations.length > 0 && (
                    <div className="donation-history-list">
                        <div className="dh-table-shell">
                            <div className="dh-table-head">
                                <span>Username</span>
                                <span>Số tiền</span>
                                <span>Nội dung</span>
                                <span>Thời gian</span>
                            </div>

                            <div className="dh-table-body">
                                {paginatedDonations.map((item) => {
                                    const username = activeTab === "received"
                                        ? item.donorName || "Anonymous"
                                        : item.streamerName || "Streamer";
                                    const detail = item.content || item.message || "Không có nội dung";

                                    return (
                                        <div className="dh-item" key={item.id}>
                                            <div className="dh-cell dh-user" data-label="Username">
                                                {activeTab === "sent" && item.streamerToken ? (
                                                    <Link to={`/streamer/${item.streamerToken}`}>{username}</Link>
                                                ) : (
                                                    <span>{username}</span>
                                                )}
                                            </div>

                                            <div className="dh-cell dh-amount" data-label="Số tiền">
                                                {formatMoney(item.amount)}
                                            </div>

                                            <div className="dh-cell dh-content" data-label="Nội dung">
                                                {detail}
                                            </div>

                                            <div className="dh-cell dh-time" data-label="Thời gian">
                                                {formatDate(item.createdAt)}
                                            </div>

                                            {item.referenceCode && (
                                                <div className="dh-row-meta">
                                                    Mã GD: {item.referenceCode}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="dh-pagination">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Trước
                                </button>

                                <span>
                                    Trang {currentPage}/{totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationHistoryPage;
