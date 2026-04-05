import React, { useState, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, loginGoogleThunk } from "../features/auth/authSlice";
import { RootState, AppDispatch } from "../app/store";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/login.css";

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = async () => {
        if (!username || !password) return;

        const result = await dispatch(loginThunk({ username, password }));
        if (loginThunk.fulfilled.match(result)) navigate("/");
    };

    const handleGoogleLogin = async (credential: string) => {
        if (!credential) return;

        const result = await dispatch(loginGoogleThunk(credential));
        if (loginGoogleThunk.fulfilled.match(result)) navigate("/");
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h2>Welcome Back</h2>
                <p className="sub">Đăng nhập để tiếp tục</p>

                <input
                    type="text"
                    placeholder="Username..."
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password..."
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                />

                <button onClick={handleLogin} disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <div className="divider">Hoặc</div>

                <div className="social-login">
                    <GoogleLogin
                        onSuccess={(credentialResponse: any) => {
                            console.log("Google response:", credentialResponse);

                            if (credentialResponse.credential) {
                                handleGoogleLogin(credentialResponse.credential);
                            }
                        }}
                        onError={() => console.log("Google login failed")}
                    />
                    <button className="facebook">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" />
                        Đăng nhập Facebook
                    </button>
                </div>

                <div className="divider">Chưa có tài khoản?</div>
                <Link to="/register" className="register-link">Đăng ký ngay</Link>
  
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default Login;