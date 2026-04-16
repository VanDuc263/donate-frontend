import React from "react";

const StreamerMenu = () => {
    return (
        <div className="profile-menu">
            <p className="menu-title">Cá Nhân</p>

            <a className="active">Thông Tin</a>
            <a>Lịch Sử Donate</a>
            <a>Danh Sách Theo Dõi</a>

            <p className="menu-title">Trang Cá Nhân</p>
            <a>Thông Tin Bio</a>
            <a>Cài Đặt Thanh Toán</a>
            <a>Cài Đặt Donate OBS</a>

            <p className="menu-title">Khác</p>
            <a>Nâng Cao</a>
            <a className="logout">Đăng xuất</a>
        </div>
    );
};

export default StreamerMenu;