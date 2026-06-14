import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { RootState } from "../../app/store";

const StreamerMenu = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const streamer = useSelector((state: RootState) => state.auth.streamer);
    const token = streamer?.token;

    const getClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? "active" : "";

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="profile-menu">
            <p className="menu-title">Cá Nhân</p>

            <NavLink to="/account/profile" end className={getClass}>
                Thông Tin
            </NavLink>
            <NavLink to="/account/wallet" className={getClass}>
                Ví của tôi
            </NavLink>
            <NavLink to="/account/donations" className={getClass}>
                Lịch Sử Donate
            </NavLink>
            <NavLink to="/account/following" className={getClass}>
                Danh Sách Theo Dõi
            </NavLink>

            <hr />

            <p className="menu-title">Quảng Bá</p>

            <NavLink to="/account/product-promotion" className={getClass}>
                Quảng bá sản phẩm
            </NavLink>

            <hr />

            <div className="menu-title">
                <span>Trang ZyScan</span>
                <Link to={`/streamer/${token || ""}`} className="badge">
                    {token || "chưa có"} {"\u{1F441}"}
                </Link>
            </div>

            <NavLink to="/account/profile/bio" className={getClass}>
                Thông Tin Bio
            </NavLink>
            <NavLink to="/account/payment" className={getClass}>
                Cài Đặt Thanh Toán
            </NavLink>
            <NavLink to="/account/donate-obs" className={getClass}>
                Cài Đặt Donate OBS
            </NavLink>
            <NavLink to="/account/blocked-users" className={getClass}>
                Danh Sách Chặn
            </NavLink>
            <NavLink to="/account/statistics" className={getClass}>
                Thống kê
            </NavLink>

            <span className="logout" onClick={handleLogout}>
                Đăng xuất
            </span>
        </div>
    );
};

export default StreamerMenu;
