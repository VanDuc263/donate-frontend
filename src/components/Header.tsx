import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { useState, useRef, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiMagnify, mdiBellOutline, mdiPlusCircleOutline } from "@mdi/js";
import {useAppSelector} from "../hooks/useAppSelector";



const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.token);

    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const user = useAppSelector(state => state.auth.user)


    // đóng menu khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="header">

            {/* LEFT */}
            <div className="header-left">
                <Link to="/" className="logo">ZyScan</Link>

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
                <div className="header-right" ref={menuRef}>

                    {/* Wallet */}
                    <div className="wallet">
                        <div>
                            <small>Ví : </small>
                            <span>0đ</span>
                        </div>
                        <Icon path={mdiPlusCircleOutline} size={1} />
                    </div>

                    {/* Icons */}
                    <button className="icon-btn">
                        <Icon path={mdiMagnify} size={1} />
                    </button>

                    <button className="icon-btn">
                        <Icon path={mdiBellOutline} size={1} />
                    </button>

                    {/* Avatar */}
                    <div className="user-trigger" onClick={() => setOpen(!open)}>
                        <img src={user?.avatar} alt="" />
                    </div>


                    {/* Dropdown */}
                    {open && (
                        <div className="dropdown-menu">
                            <p className="dropdown-name">Đức Văn</p>

                            <Link to="/user/profile">Thông tin</Link>
                            <Link to="/user/payment_order">Lịch sử donate</Link>
                            <Link to="/user/follow">Theo dõi</Link>

                            <hr />

                            <button onClick={() => dispatch(logout())}>
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;