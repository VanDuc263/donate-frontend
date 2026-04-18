import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const UserMenu = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    };

    const getClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? "active" : "";

    return (
        <div className="profile-menu">
            <p className="menu-title">Cá Nhân</p>

            <NavLink to="/account/profile" className={getClass}>
                Thông Tin
            </NavLink>

            <NavLink to="/account/donations" className={getClass}>
                Lịch Sử Donate
            </NavLink>

            <NavLink to="/account/following" className={getClass}>
                Danh Sách Theo Dõi
            </NavLink>

            <hr />

            <div className="menu-title">
                <span>Trang ZyScan</span>
                <span className="badge">chưa có liên kết 👁</span>
            </div>

            <NavLink
                to="/account/create-streamer"
                className="create-page-btn"
            >
                + Tạo Trang ZyScan
            </NavLink>

            <hr />

            <span className="logout" onClick={handleLogout}>
                Đăng xuất
            </span>
        </div>
    );
};

export default UserMenu;