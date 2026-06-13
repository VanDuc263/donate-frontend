import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { useState, useRef, useEffect } from "react";
import Icon from "@mdi/react";
import {
    mdiAccountCircleOutline,
    mdiBellOutline,
    mdiCogOutline,
    mdiEyeOutline,
    mdiHeartOutline,
    mdiHistory,
    mdiLogout,
    mdiMagnify,
    mdiPlusCircleOutline,
} from "@mdi/js";
import { useAppSelector } from "../hooks/useAppSelector";
import {
    searchStreamers,
    SearchStreamerResponse,
} from "../features/streamer/streamerApi";
import axiosClient from "../services/exiosClient";
import WalletModal from "./WalletModal";

interface NotificationItem {
    id: number;
    type:
        | "SYSTEM"
        | "ACCOUNT"
        | "SECURITY"
        | "DONATION"
        | "PAYMENT"
        | "FOLLOW"
        | "STREAMER";
    title: string;
    content: string;
    isRead: boolean;
    redirectUrl?: string | null;
    metadata?: string | null;
    createdAt: string;
}

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const token = useSelector(
        (state: RootState) => state.auth.token
    );

    const user = useAppSelector(
        (state) => state.auth.user
    );

    const streamer = useAppSelector(
        (state) => state.auth.streamer
    );

    const { wallet } = useAppSelector(
        (state) => state.wallet
    );

    const [open, setOpen] = useState(false);

    const [searchOpen, setSearchOpen] =
        useState(false);

    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const [walletOpen, setWalletOpen] =
        useState(false);

    const [keyword, setKeyword] = useState("");

    const [results, setResults] = useState<
        SearchStreamerResponse[]
    >([]);

    const [loading, setLoading] =
        useState(false);

    const [searched, setSearched] =
        useState(false);

    const [notifications, setNotifications] =
        useState<NotificationItem[]>([]);

    const [notificationLoading, setNotificationLoading] =
        useState(false);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const menuRef = useRef<HTMLDivElement>(null);

    const searchRef =
        useRef<HTMLDivElement>(null);

    const notificationRef =
        useRef<HTMLDivElement>(null);

    const fetchUnreadCount = async () => {
        try {
            const res = await axiosClient.get<{
                count: number;
            }>("/api/notifications/unread-count");

            setUnreadCount(
                res.data?.count || 0
            );
        } catch (error) {
            console.error(
                "Lỗi lấy số thông báo chưa đọc:",
                error
            );
        }
    };

    const fetchNotifications = async () => {
        try {
            setNotificationLoading(true);

            const res =
                await axiosClient.get<
                    NotificationItem[]
                >("/api/notifications");

            setNotifications(res.data || []);
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách thông báo:",
                error
            );

            setNotifications([]);
        } finally {
            setNotificationLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axiosClient.put(
                `/api/notifications/${id}/read`
            );

            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            isRead: true,
                        }
                        : item
                )
            );

            setUnreadCount((prev) =>
                Math.max(0, prev - 1)
            );
        } catch (error) {
            console.error(
                "Lỗi đánh dấu đã đọc:",
                error
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosClient.put(
                "/api/notifications/read-all"
            );

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    isRead: true,
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Lỗi đọc hết thông báo:",
                error
            );
        }
    };

    useEffect(() => {
        const handleClickOutside = (
            e: MouseEvent
        ) => {
            const target = e.target as Node;

            if (
                menuRef.current &&
                !menuRef.current.contains(target)
            ) {
                setOpen(false);
            }

            if (
                searchRef.current &&
                !searchRef.current.contains(target)
            ) {
                setSearchOpen(false);
            }

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    target
                )
            ) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    useEffect(() => {
        if (token) {
            fetchUnreadCount();
        }
    }, [token]);

    useEffect(() => {
        const trimmedKeyword =
            keyword.trim();

        if (!searchOpen) return;

        if (!trimmedKeyword) {
            setResults([]);
            setSearched(false);
            return;
        }

        const timeout = setTimeout(
            async () => {
                try {
                    setLoading(true);

                    const res =
                        await searchStreamers(
                            trimmedKeyword
                        );

                    setResults(
                        res.data || []
                    );

                    setSearched(true);
                } catch (error) {
                    console.error(
                        "Lỗi tìm kiếm streamer:",
                        error
                    );

                    setResults([]);

                    setSearched(true);
                } finally {
                    setLoading(false);
                }
            },
            300
        );

        return () =>
            clearTimeout(timeout);
    }, [keyword, searchOpen]);

    useEffect(() => {
        if (notificationOpen && token) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [notificationOpen, token]);

    const handleSelectStreamer = (
        streamerToken: string
    ) => {
        setSearchOpen(false);

        setKeyword("");

        setResults([]);

        setSearched(false);

        navigate(
            `/streamer/${streamerToken}`
        );
    };

    const handleClickNotification =
        async (
            item: NotificationItem
        ) => {
            if (!item.isRead) {
                await markAsRead(item.id);
            }

            setNotificationOpen(false);

            if (item.redirectUrl) {
                navigate(item.redirectUrl);
            }
        };

    const closeAccountMenu = () => {
        setOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        closeAccountMenu();
        navigate("/login");
    };

    const quickMenuItems = [
        {
            to: "/account/profile",
            icon: mdiAccountCircleOutline,
            title: "Hồ sơ",
        },
        {
            to: "/account/donations",
            icon: mdiHistory,
            title: "Lịch sử donate",
        },
        {
            to: "/account/following",
            icon: mdiHeartOutline,
            title: "Đang theo dõi",
        },
    ];

    const streamerMenuItems = streamer?.token
        ? [
              {
                  to: `/streamer/${streamer.token}`,
                  icon: mdiEyeOutline,
                  title: "Trang ZyScan",
              },
              {
                  to: "/account/profile/bio",
                  icon: mdiCogOutline,
                  title: "Cài đặt streamer",
              },
          ]
        : [
              {
                  to: "/account/create-streamer",
                  icon: mdiPlusCircleOutline,
                  title: "Tạo trang ZyScan",
              },
          ];

    return (
        <header className="header">
            <div className="header-left">
                <Link
                    to="/"
                    className="logo"
                >
                    ZyScan
                </Link>

                <nav>
                    <Link to="/">
                        Trang chủ
                    </Link>

                    <Link to="/donate">
                        Donate
                    </Link>
                </nav>
            </div>

            {!token ? (
                <button
                    className="btn-login"
                    onClick={() =>
                        navigate("/login")
                    }
                >
                    Đăng nhập
                </button>
            ) : (
                <div className="header-right">
                    <div
                        className="wallet"
                        onClick={() => {
                            setWalletOpen(true);

                            setSearchOpen(false);

                            setNotificationOpen(
                                false
                            );

                            setOpen(false);
                        }}
                    >
                        <div>
                            <small>Ví : </small>

                            <span>
                                {
                                    wallet?.balance
                                }{" "}
                            </span>

                            <span>
                                {
                                    wallet?.currency
                                }
                            </span>
                        </div>

                        <Icon
                            path={
                                mdiPlusCircleOutline
                            }
                            size={1}
                        />
                    </div>

                    <WalletModal
                        open={walletOpen}
                        onClose={() =>
                            setWalletOpen(
                                false
                            )
                        }
                    />

                    <div
                        className="search-wrapper"
                        ref={searchRef}
                    >
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setSearchOpen(
                                    !searchOpen
                                );

                                setNotificationOpen(
                                    false
                                );
                            }}
                            type="button"
                        >
                            <Icon
                                path={
                                    mdiMagnify
                                }
                                size={1}
                            />
                        </button>

                        {searchOpen && (
                            <div className="search-panel">
                                <input
                                    className="search-panel-input"
                                    value={
                                        keyword
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setKeyword(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Tìm streamer..."
                                    autoFocus
                                />

                                <div className="search-panel-body">
                                    {loading && (
                                        <div className="search-empty">
                                            Đang tìm kiếm...
                                        </div>
                                    )}

                                    {!loading &&
                                        searched &&
                                        keyword.trim() !==
                                        "" &&
                                        results.length ===
                                        0 && (
                                            <div className="search-empty">
                                                Không
                                                tìm
                                                thấy
                                                streamer
                                                phù
                                                hợp.
                                            </div>
                                        )}

                                    {!loading &&
                                        results.map(
                                            (
                                                item
                                            ) => (
                                                <div
                                                    key={
                                                        item.streamerId
                                                    }
                                                    className="search-item"
                                                    onClick={() =>
                                                        handleSelectStreamer(
                                                            item.token
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            item.avatar ||
                                                            "https://i.pravatar.cc/100?img=12"
                                                        }
                                                        alt={
                                                            item.displayName
                                                        }
                                                    />

                                                    <div className="search-item-info">
                                                        <strong>
                                                            {
                                                                item.displayName
                                                            }
                                                        </strong>

                                                        <span>
                                                            @
                                                            {
                                                                item.token
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}

                                    {!loading &&
                                        !searched &&
                                        keyword.trim() ===
                                        "" && (
                                            <div className="search-empty">
                                                Nhập
                                                tên
                                                streamer
                                                để tìm
                                                kiếm.
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="notification-wrapper"
                        ref={
                            notificationRef
                        }
                    >
                        <button
                            className="icon-btn"
                            type="button"
                            onClick={() => {
                                setNotificationOpen(
                                    !notificationOpen
                                );

                                setSearchOpen(
                                    false
                                );
                            }}
                        >
                            <Icon
                                path={
                                    mdiBellOutline
                                }
                                size={1}
                            />

                            {unreadCount >
                                0 && (
                                    <span className="notification-badge">
                                    {unreadCount >
                                    99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                                )}
                        </button>

                        {notificationOpen && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <strong>
                                        Thông báo
                                    </strong>

                                    <button
                                        type="button"
                                        onClick={
                                            markAllAsRead
                                        }
                                    >
                                        Đọc hết
                                    </button>
                                </div>

                                <div className="notification-body">
                                    {notificationLoading && (
                                        <div className="notification-empty">
                                            Đang
                                            tải
                                            thông
                                            báo...
                                        </div>
                                    )}

                                    {!notificationLoading &&
                                        notifications.length ===
                                        0 && (
                                            <div className="notification-empty">
                                                Chưa
                                                có
                                                thông
                                                báo
                                                nào
                                            </div>
                                        )}

                                    {!notificationLoading &&
                                        notifications.map(
                                            (
                                                item
                                            ) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className={`notification-item ${
                                                        item.isRead
                                                            ? "read"
                                                            : "unread"
                                                    }`}
                                                    onClick={() =>
                                                        handleClickNotification(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <div className="notification-title">
                                                        {
                                                            item.title
                                                        }
                                                    </div>

                                                    <div className="notification-content">
                                                        {
                                                            item.content
                                                        }
                                                    </div>

                                                    <div className="notification-time">
                                                        {new Date(
                                                            item.createdAt
                                                        ).toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="header-right"
                        ref={menuRef}
                    >
                        <div
                            className={`user-trigger ${
                                open ? "active" : ""
                            }`}
                            onClick={() =>
                                setOpen(!open)
                            }
                        >
                            <img
                                src={
                                    user?.avatar ||
                                    "https://i.pravatar.cc/100?img=5"
                                }
                                alt="Avatar tai khoan"
                            />
                        </div>

                        {open && (
                            <div className="dropdown-menu">
                                <div className="dropdown-account">
                                    <p className="dropdown-account-name">
                                        {user?.fullName ||
                                            user?.username ||
                                            "Người dùng"}
                                    </p>

                                    <span className="dropdown-account-email">
                                        {user?.email ||
                                            "Tai khoản ZyScan"}
                                    </span>
                                </div>

                                <div className="dropdown-section">
                                    {quickMenuItems.map((item) => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className="dropdown-link"
                                            onClick={closeAccountMenu}
                                        >
                                            <span className="dropdown-link-icon">
                                                <Icon
                                                    path={item.icon}
                                                    size={0.85}
                                                />
                                            </span>

                                            <span className="dropdown-link-copy">
                                                <strong>
                                                    {item.title}
                                                </strong>
                                            </span>
                                        </Link>
                                    ))}
                                </div>

                                <div className="dropdown-section-label">
                                    Creator tools
                                </div>

                                <div className="dropdown-section">
                                    {streamerMenuItems.map((item) => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className="dropdown-link"
                                            onClick={closeAccountMenu}
                                        >
                                            <span className="dropdown-link-icon">
                                                <Icon
                                                    path={item.icon}
                                                    size={0.85}
                                                />
                                            </span>

                                            <span className="dropdown-link-copy">
                                                <strong>
                                                    {item.title}
                                                </strong>
                                            </span>
                                        </Link>
                                    ))}
                                </div>

                                <p className="dropdown-name">
                                    {user?.fullName ||
                                        user?.username ||
                                        "Người dùng"}
                                </p>

                                <Link to="/account/profile">
                                    Thông tin
                                </Link>

                                <Link to="/account/donations">
                                    Lịch sử
                                    donate
                                </Link>

                                <Link to="/account/following">
                                    theo dõi
                                </Link>

                                <hr />

                                <button
                                    type="button"
                                    className="dropdown-logout"
                                    onClick={handleLogout}
                                >
                                    <Icon
                                        path={mdiLogout}
                                        size={0.85}
                                    />
                                    <span>Đăng xuất</span>
                                </button>

                                <button
                                    onClick={() =>
                                        dispatch(
                                            logout()
                                        )
                                    }
                                >
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
