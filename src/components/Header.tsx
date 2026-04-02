import React from "react";
import "../styles/styles.css";

const Header = () => {
    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">ZyScan</div>
                <nav className="nav">
                    <a href="#" className="nav-link">Trang Chủ</a>
                    <a href="#" className="nav-link">Nhà Sáng Tạo</a>
                </nav>
            </div>
            <div className="header-right">
                <button className="login-btn">Đăng Nhập</button>
            </div>
        </header>
    );
};

export default Header;