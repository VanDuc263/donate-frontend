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
            <p className="menu-title">{"C\u00e1 Nh\u00e2n"}</p>

            <NavLink to="/account/profile" end className={getClass}>
                {"Th\u00f4ng Tin"}
            </NavLink>
            <NavLink to="/account/donations" className={getClass}>
                {"L\u1ecbch S\u1eed Donate"}
            </NavLink>
            <NavLink to="/account/following" className={getClass}>
                {"Danh S\u00e1ch Theo D\u00f5i"}
            </NavLink>

            <div className="menu-title">
                <span>Trang ZyScan</span>
                <Link to={`/streamer/${token || ""}`} className="badge">
                    {token || "chua co"} {"\u{1F441}"}
                </Link>
            </div>

            <NavLink to="/account/profile/bio" className={getClass}>
                {"Th\u00f4ng Tin Bio"}
            </NavLink>
            <NavLink to="/account/donations" className={getClass}>
                {"C\u00e0i \u0110\u1eb7t Thanh To\u00e1n"}
            </NavLink>
            <NavLink to="/account/donate-obs" className={getClass}>
                {"C\u00e0i \u0110\u1eb7t Donate OBS"}
            </NavLink>

            <p className="menu-title">{"Kh\u00e1c"}</p>
            <NavLink to="/account/donations" className={getClass}>
                {"N\u00e2ng Cao"}
            </NavLink>

            <span className="logout" onClick={handleLogout}>
                {"\u0110\u0103ng xu\u1ea5t"}
            </span>
        </div>
    );
};

export default StreamerMenu;
