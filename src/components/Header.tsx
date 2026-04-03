import { useNavigate } from "react-router-dom";
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
                <div className="logo">ZyScan</div>
            </div>

            <div className="header-right">
                {!token ? (
                    <button onClick={() => navigate("/login")}>
                        Đăng nhập
                    </button>
                ) : (
                    <button onClick={() => dispatch(logout())}>
                        Đăng xuất
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;