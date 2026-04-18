import React from "react";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../app/store";

const StreamerMenu = () => {
    const streamer = useSelector((state : RootState)=> state.auth.streamer)
    const token = streamer?.token
    return (
        <div className="profile-menu">
            <p className="menu-title">Cá Nhân</p>

            <a className="active">Thông Tin</a>
            <a>Lịch Sử Donate</a>
            <a>Danh Sách Theo Dõi</a>

            <div className="menu-title">
                <span>Trang ZyScan</span>
                <Link to={`/streamer/${token}`}  className="badge">{token} 👁</Link>
            </div>
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