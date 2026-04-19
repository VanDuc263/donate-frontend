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

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.token);

    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<SearchStreamerResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const user = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (menuRef.current && !menuRef.current.contains(target)) {
                setOpen(false);
            }

            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleSelectStreamer = (streamerToken: string) => {
        setSearchOpen(false);
        setKeyword("");
        setResults([]);
        setSearched(false);
        navigate(`/streamer/${streamerToken}`);
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
                    <div className="wallet">
                        <div>
                            <small>Ví : </small>
                            <span>0đ</span>
                        </div>
                        <Icon path={mdiPlusCircleOutline} size={1} />
                    </div>

                    <div className="search-wrapper" ref={searchRef}>
                        <button
                            className="icon-btn"
                            onClick={() => setSearchOpen(!searchOpen)}
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

                    <button className="icon-btn" type="button">
                        <Icon path={mdiBellOutline} size={1} />
                    </button>

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