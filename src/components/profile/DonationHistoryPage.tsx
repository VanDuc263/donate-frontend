import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../app/store";
import {
    DonationHistoryItem,
    getMyReceivedDonationHistory,
    getMySentDonationHistory,
} from "../../features/donate/donateApi";
import {
    blockUserByStreamer,
    unblockUserByStreamer,
} from "../../features/streamer/streamerApi";

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
        const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, nano = 0] = value;

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
    const [processingUserId, setProcessingUserId] = useState<number | null>(null);

    const title = useMemo(
        () => (activeTab === "received" ? "Lịch sử nhận donate" : "Lịch sử gửi donate"),
        [activeTab]
    );

    const description = useMemo(
        () =>
            activeTab === "received"
                ? "Xem lại các khoản donate bạn đã nhận theo cách rõ ràng và dễ theo dõi hơn."
                : "Xem lại các khoản donate bạn đã gửi theo cách rõ ràng và dễ theo dõi hơn.",
        [activeTab]
    );

    const emptyText = useMemo(
        () =>
            activeTab === "received"
                ? "Khi có người donate thành công, giao dịch sẽ xuất hiện tại đây."
                : "Sau khi bạn donate thành công, giao dịch sẽ xuất hiện tại đây.",
        [activeTab]
    );

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

                const res =
                    activeTab === "received"
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

    const handleToggleBlock = async (item: DonationHistoryItem) => {
        if (!item.donorId) {
            return;
        }

        try {
            setProcessingUserId(item.donorId);
            setError("");

            if (item.blockedByStreamer) {
                await unblockUserByStreamer(item.donorId);
            } else {
                await blockUserByStreamer(item.donorId);
            }

            setDonations((prev) =>
                prev.map((donation) =>
                    donation.donorId === item.donorId
                        ? {
                              ...donation,
                              blockedByStreamer: !item.blockedByStreamer,
                          }
                        : donation
                )
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || "Cập nhật trạng thái chặn thất bại.");
        } finally {
            setProcessingUserId(null);
        }
    };

    return (
        <div className="profile-content">
            <div className="profile-card donation-history-card">
                <div className="donation-history-head">
                    <div>
                        <h2 style={{marginBottom : 20}}>{title}</h2>

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
                            <div className={`dh-table-head ${activeTab === "received" ? "dh-table-head--received" : ""}`}>
                                <span>Username</span>
                                <span>Số tiền</span>
                                <span>Nội dung</span>
                                <span>Thời gian</span>
                                {activeTab === "received" && <span>Thao tác</span>}
                            </div>

                            <div className="dh-table-body">
                                {paginatedDonations.map((item) => {
                                    const username =
                                        activeTab === "received"
                                            ? item.donorName || "Anonymous"
                                            : item.streamerName || "Streamer";
                                    const detail = item.content || item.message || "Không có nội dung";

                                    return (
                                        <div
                                            className={`dh-item ${activeTab === "received" ? "dh-item--received" : ""}`}
                                            key={item.id}
                                        >
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

                                            {activeTab === "received" && (
                                                <div className="dh-cell dh-actions" data-label="Thao tác">
                                                    {item.donorId ? (
                                                        <button
                                                            type="button"
                                                            className={`dh-action-btn ${
                                                                item.blockedByStreamer ? "danger" : ""
                                                            }`}
                                                            onClick={() => handleToggleBlock(item)}
                                                            disabled={processingUserId === item.donorId}
                                                        >
                                                            {processingUserId === item.donorId
                                                                ? "Đang xử lý..."
                                                                : item.blockedByStreamer
                                                                  ? "Bỏ chặn"
                                                                  : "Chặn"}
                                                        </button>
                                                    ) : (
                                                        <span className="dh-action-disabled">Ẩn danh</span>
                                                    )}
                                                </div>
                                            )}

                                            {item.referenceCode && (
                                                <div className="dh-row-meta">Mã GD: {item.referenceCode}</div>
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
