import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">ZyScan</div>
                <nav className="nav">
                    <a href="#">Trang Chủ</a>
                    <a href="#">Nhà Sáng Tạo</a>
                </nav>
            </div>
            <div className="header-right">
                <button
                    className="login-btn"
                    onClick={() => navigate("/login")}
                >
                    Đăng Nhập
                </button>
            </div>
        </header>
    );
};

export default Header;