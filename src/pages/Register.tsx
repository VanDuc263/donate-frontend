import React, { useState, useEffect, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { registerThunk, resetRegister } from "../features/auth/registerSlice";
import { useNavigate, Link } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, success, error } = useSelector((state: RootState) => state.register);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [role, setRole] = useState<"viewer" | "streamer">("viewer");
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        return () => { dispatch(resetRegister()); };
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => navigate("/login"), 2000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const handleRegister = async () => {
        setLocalError("");
        if (!username || !email || !password || !confirm) {
            setLocalError("Vui lòng điền đầy đủ thông tin");
            return;
        }
        if (password !== confirm) {
            setLocalError("Mật khẩu xác nhận không khớp");
            return;
        }
        if (password.length < 6) {
            setLocalError("Mật khẩu phải ít nhất 6 ký tự");
            return;
        }
        dispatch(registerThunk({ username, email, password }));
    };

    return (
        <div className="register-page">
            <div className="register-box">
                {/* Logo */}
                <div className="reg-logo">
                    <span className="logo-text">ZyScan</span>
                    <p>Tạo tài khoản miễn phí</p>
                </div>

                {success ? (
                    <div className="reg-success">
                        <div className="success-icon">✅</div>
                        <h3>Đăng ký thành công!</h3>
                        <p>Đang chuyển hướng đến trang đăng nhập...</p>
                    </div>
                ) : (
                    <>
                        {/* Role selector */}
                        <div className="role-selector">
                            <button
                                className={role === "viewer" ? "active" : ""}
                                onClick={() => setRole("viewer")}
                            >
                                👁️ Người xem
                            </button>
                            <button
                                className={role === "streamer" ? "active" : ""}
                                onClick={() => setRole("streamer")}
                            >
                                🎮 Streamer
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Tên người dùng..."
                            value={username}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email..."
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu..."
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu..."
                            value={confirm}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                        />

                        {role === "streamer" && (
                            <div className="streamer-notice">
                                🎮 Bạn sẽ có thể tạo trang donate cá nhân sau khi đăng ký
                            </div>
                        )}

                        {(localError || error) && (
                            <p className="reg-error">❌ {localError || error}</p>
                        )}

                        <button
                            className="reg-btn"
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký ngay"}
                        </button>

                        <div className="reg-divider">Đã có tài khoản?</div>
                        <Link to="/login" className="reg-login-link">Đăng nhập</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;
