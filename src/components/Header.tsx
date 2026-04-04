import {Link, useNavigate} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.token);

    return (
        <header className="header">
            <div className="header-left">
                <nav>
                    <Link to="/" className="header-signature">ZyScan</Link>
                    <Link to="/">Trang chủ</Link>
                    <a href="#">Streamer</a>
                    <Link to="/donate">Donate</Link>
                </nav>

            </div>

            {!token ? (
                <button onClick={() => navigate("/login")}>Đăng nhập</button>
            ) : (
                <button onClick={() => dispatch(logout())}>Đăng xuất</button>
            )}
        </header>
    );
};

export default Header;