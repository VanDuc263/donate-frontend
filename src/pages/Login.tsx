import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../features/auth/authSlice";
import { RootState, AppDispatch } from "../app/store";
import "../styles/login.css";

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!username || !password) return;

        const result = await dispatch(loginThunk({ username, password }));

        if (loginThunk.fulfilled.match(result)) {
            window.location.href = "/";
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h2>Đăng nhập</h2>

                <input
                    type="text"
                    placeholder="Nhập username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Nhập password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleLogin} disabled={loading}>
                    {loading ? "Loading..." : "Đăng nhập"}
                </button>

                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
};

export default Login;