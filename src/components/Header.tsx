import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { useState, useRef, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiMagnify, mdiBellOutline, mdiPlusCircleOutline } from "@mdi/js";
import { useAppSelector } from "../hooks/useAppSelector";
import {
    searchStreamers,
    SearchStreamerResponse,
} from "../features/streamer/streamerApi";
import axiosClient from "../services/exiosClient";
import {generateQr} from "../features/payment/paymentApi";
import QRWidget from "./QRWidget";
import {getMyWallet} from "../features/wallet/walletApi";

interface NotificationItem {
    id: number;
    type: "SYSTEM" | "ACCOUNT" | "SECURITY" | "DONATION" | "PAYMENT" | "FOLLOW" | "STREAMER";
    title: string;
    content: string;
    isRead: boolean;
    redirectUrl?: string | null;
    metadata?: string | null;
    createdAt: string;
}

interface Wallet{
    id: number;
    userId: number;
    balance: number;
    frozenBalance: number;
    currency: string;
    createdAt: string;
}

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.token);

    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [walletOpen, setWalletOpen] = useState(false);
    const [walletStep, setWalletStep] = useState<1 | 2>(1);
    const [paymentMethod, setPaymentMethod] = useState<string>("Chuyển khoản ngân hàng");

    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<SearchStreamerResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [depositAmount, setDepositAmount] = useState<string>("");
    const [depositMessage, setDepositMessage] = useState<string>("");

    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const depositValue = Number(depositAmount);
    const depositFee = depositValue > 0 ? Math.round(depositValue * 0.01) : 0;
    const depositTotal = depositValue > 0 ? depositValue + depositFee : 0;

    const user = useAppSelector((state) => state.auth.user);

    const [qrData, setQrData] = useState<{
        qrUrl: string;
        amount: number;
        content: string;
    } | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const { wallet, error } = useAppSelector(
        (state) => state.wallet
    );
    const fetchUnreadCount = async () => {
        try {
            const res = await axiosClient.get<{ count: number }>("/api/notifications/unread-count");
            setUnreadCount(res.data?.count || 0);
        } catch (error) {
            console.error("Lỗi lấy số thông báo chưa đọc:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setNotificationLoading(true);
            const res = await axiosClient.get<NotificationItem[]>("/api/notifications");
            setNotifications(res.data || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách thông báo:", error);
            setNotifications([]);
        } finally {
            setNotificationLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axiosClient.put(`/api/notifications/${id}/read`);

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, isRead: true } : item
                )
            );

            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Lỗi đánh dấu đã đọc:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosClient.put("/api/notifications/read-all");
            setNotifications((prev) =>
                prev.map((item) => ({ ...item, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Lỗi đọc hết thông báo:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (menuRef.current && !menuRef.current.contains(target)) {
                setOpen(false);
            }

            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchOpen(false);
            }

            if (
                notificationRef.current &&
                !notificationRef.current.contains(target)
            ) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (token) {
            fetchUnreadCount();
        }
    }, [token]);

    useEffect(() => {
        const trimmedKeyword = keyword.trim();

        if (!searchOpen) return;

        if (!trimmedKeyword) {
            setResults([]);
            setSearched(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await searchStreamers(trimmedKeyword);
                setResults(res.data || []);
                setSearched(true);
            } catch (error) {
                console.error("Lỗi tìm kiếm streamer:", error);
                setResults([]);
                setSearched(true);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [keyword, searchOpen]);

    useEffect(() => {
        if (notificationOpen && token) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [notificationOpen, token]);

    const handleSelectStreamer = (streamerToken: string) => {
        setSearchOpen(false);
        setKeyword("");
        setResults([]);
        setSearched(false);
        navigate(`/streamer/${streamerToken}`);
    };

    const handleClickNotification = async (item: NotificationItem) => {
        if (!item.isRead) {
            await markAsRead(item.id);
        }

        setNotificationOpen(false);

        if (item.redirectUrl) {
            navigate(item.redirectUrl);
        }
    };

    const resetWalletModal = () => {
        setWalletOpen(false);
        setWalletStep(1);
        setDepositAmount("");
        setDepositMessage("");
        setPaymentMethod("Chuyển khoản ngân hàng");
    };




    const handleContinue = async () => {
        const amount = Number(depositAmount);

        if (!amount || amount <= 0) {
            setDepositMessage("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        try {
            setQrLoading(true);

            const res = await generateQr({
                methodId: 1, // tạm thời bank default (sau bạn load từ API)
                amount : depositTotal

            });


            setQrData(res.data);

            console.log(res.data.qrUrl)

            setWalletStep(2);
            setDepositMessage("");

        } catch (err) {
            console.error(err);
            setDepositMessage("Không tạo được mã QR");
        } finally {
            setQrLoading(false);
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo">
                    ZyScan
                </Link>

                <nav>
                    <Link to="/">Trang chủ</Link>
                    <Link to="/donate">Donate</Link>
                </nav>
            </div>

            {!token ? (
                <button className="btn-login" onClick={() => navigate("/login")}>
                    Đăng nhập
                </button>
            ) : (
                <div className="header-right">
                    <div className="wallet" onClick={() => {
                        setWalletOpen(!walletOpen);
                        setWalletStep(1);
                        setSearchOpen(false);
                        setNotificationOpen(false);
                        setOpen(false);
                    }}>
                        <div>
                            <small>Ví : </small>
                            <span>{wallet?.balance} </span>
                            <span>{wallet?.currency}</span>
                        </div>
                        <Icon path={mdiPlusCircleOutline} size={1} />
                    </div>

                    {walletOpen && (
                        <div className="wallet-modal-backdrop" onClick={resetWalletModal}>
                            <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="wallet-modal-header">
                                    <div>
                                        <h3>Nạp tiền vào ví</h3>
                                        <p>{walletStep === 1 ? "Chọn phương thức và số tiền nạp." : "Quét mã QR để hoàn tất thanh toán."}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="wallet-modal-close"
                                        onClick={resetWalletModal}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {walletStep === 1 ? (
                                    <>
                                        <div className="wallet-modal-section">
                                            <span>Phương thức thanh toán</span>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            >
                                                <option>Chuyển khoản ngân hàng</option>
                                                <option>Ví Momo</option>
                                                <option>QR Pay</option>
                                            </select>
                                        </div>

                                        <div className="wallet-modal-section">
                                            <span>Số tiền nạp</span>
                                            <input
                                                type="number"
                                                min="1000"
                                                value={depositAmount}
                                                onChange={(e) => {
                                                    setDepositAmount(e.target.value);
                                                    setDepositMessage("");
                                                }}
                                                placeholder="Nhập số tiền bạn muốn nạp"
                                            />
                                            <div className="wallet-modal-quick">
                                                {[50000, 100000, 200000, 300000, 400000].map((amount) => (
                                                    <button
                                                        key={amount}
                                                        type="button"
                                                        onClick={() => {
                                                            setDepositAmount(amount.toString());
                                                            setDepositMessage("");
                                                        }}
                                                    >
                                                        {amount / 1000}K
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="wallet-modal-summary">
                                            <div>
                                                <span>Tiền nạp</span>
                                                <strong>{depositValue ? depositValue.toLocaleString("vi-VN") + "đ" : "0đ"}</strong>
                                            </div>
                                            <div>
                                                <span>Phí giao dịch</span>
                                                <strong>{depositValue ? depositFee.toLocaleString("vi-VN") + "đ" : "0đ"}</strong>
                                            </div>
                                            <div className="wallet-modal-total">
                                                <span>Thành tiền</span>
                                                <strong>{depositValue ? depositTotal.toLocaleString("vi-VN") + "đ" : "0đ"}</strong>
                                            </div>
                                        </div>

                                        <button
                                            className="wallet-modal-submit"
                                            type="button"
                                            onClick={handleContinue}
                                        >
                                            TIẾP TỤC
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="wallet-modal-step2">
                                            <button
                                                type="button"
                                                className="wallet-modal-back"
                                                onClick={() => setWalletStep(1)}
                                            >
                                                ← Quay lại
                                            </button>

                                            <div className="wallet-modal-summary wallet-modal-summary--step2">
                                                <div>
                                                    <span>Tiền nạp</span>
                                                    <strong>{depositValue.toLocaleString("vi-VN")}đ</strong>
                                                </div>
                                                <div>
                                                    <span>Phí giao dịch</span>
                                                    <strong>{depositFee.toLocaleString("vi-VN")}đ</strong>
                                                </div>
                                                <div className="wallet-modal-total">
                                                    <span>Thành tiền</span>
                                                    <strong>{depositTotal.toLocaleString("vi-VN")}đ</strong>
                                                </div>
                                            </div>

                                            <div className="wallet-modal-qr-box">
                                                {qrData?.qrUrl ? (
                                                    <QRWidget qrUrl={qrData.qrUrl} token={""} />
                                                ) : null}


                                                <button type="button" className="wallet-modal-qr-download">
                                                    TẢI MÃ QR
                                                </button>
                                            </div>

                                            <div className="wallet-modal-note">
                                                <p>Mã thanh toán sẽ hết hạn sau <strong>1792 giây</strong>.</p>
                                                <ol>
                                                    <li>Đăng nhập ứng dụng Mobile Banking hoặc ví điện tử.</li>
                                                    <li>Chọn chức năng QR Pay và quét mã QR.</li>
                                                    <li>Xác nhận thanh toán và hoàn tất giao dịch.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {depositMessage && (
                                    <p className="wallet-message">{depositMessage}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="search-wrapper" ref={searchRef}>
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSearchOpen(!searchOpen);
                                setNotificationOpen(false);
                            }}
                            type="button"
                        >
                            <Icon path={mdiMagnify} size={1} />
                        </button>

                        {searchOpen && (
                            <div className="search-panel">
                                <input
                                    className="search-panel-input"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tìm streamer..."
                                    autoFocus
                                />

                                <div className="search-panel-body">
                                    {loading && (
                                        <div className="search-empty">Đang tìm kiếm...</div>
                                    )}

                                    {!loading &&
                                        searched &&
                                        keyword.trim() !== "" &&
                                        results.length === 0 && (
                                            <div className="search-empty">
                                                Không tìm thấy streamer phù hợp.
                                            </div>
                                        )}

                                    {!loading &&
                                        results.map((item) => (
                                            <div
                                                key={item.streamerId}
                                                className="search-item"
                                                onClick={() =>
                                                    handleSelectStreamer(item.token)
                                                }
                                            >
                                                <img
                                                    src={
                                                        item.avatar ||
                                                        "https://i.pravatar.cc/100?img=12"
                                                    }
                                                    alt={item.displayName}
                                                />
                                                <div className="search-item-info">
                                                    <strong>{item.displayName}</strong>
                                                    <span>@{item.token}</span>
                                                </div>
                                            </div>
                                        ))}

                                    {!loading &&
                                        !searched &&
                                        keyword.trim() === "" && (
                                            <div className="search-empty">
                                                Nhập tên streamer để tìm kiếm.
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="notification-wrapper" ref={notificationRef}>
                        <button
                            className="icon-btn"
                            type="button"
                            onClick={() => {
                                setNotificationOpen(!notificationOpen);
                                setSearchOpen(false);
                            }}
                        >
                            <Icon path={mdiBellOutline} size={1} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {notificationOpen && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <strong>Thông báo</strong>
                                    <button type="button" onClick={markAllAsRead}>
                                        Đọc hết
                                    </button>
                                </div>

                                <div className="notification-body">
                                    {notificationLoading && (
                                        <div className="notification-empty">
                                            Đang tải thông báo...
                                        </div>
                                    )}

                                    {!notificationLoading &&
                                        notifications.length === 0 && (
                                            <div className="notification-empty">
                                                Chưa có thông báo nào
                                            </div>
                                        )}

                                    {!notificationLoading &&
                                        notifications.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`notification-item ${
                                                    item.isRead ? "read" : "unread"
                                                }`}
                                                onClick={() =>
                                                    handleClickNotification(item)
                                                }
                                            >
                                                <div className="notification-title">
                                                    {item.title}
                                                </div>
                                                <div className="notification-content">
                                                    {item.content}
                                                </div>
                                                <div className="notification-time">
                                                    {new Date(
                                                        item.createdAt
                                                    ).toLocaleString("vi-VN")}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="header-right" ref={menuRef}>
                        <div className="user-trigger" onClick={() => setOpen(!open)}>
                            <img
                                src={
                                    user?.avatar ||
                                    "https://i.pravatar.cc/100?img=5"
                                }
                                alt=""
                            />
                        </div>

                        {open && (
                            <div className="dropdown-menu">
                                <p className="dropdown-name">
                                    {user?.fullName || user?.username || "Người dùng"}
                                </p>

                                <Link to="/account/profile">Thông tin</Link>
                                <Link to="/account/donations">Lịch sử donate</Link>
                                <Link to="/account/following">Theo dõi</Link>

                                <hr />

                                <button onClick={() => dispatch(logout())}>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;