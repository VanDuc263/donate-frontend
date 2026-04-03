import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/login.css";

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");

    const handleLogin = () => {
        if (!username) return;
        login(username);
        window.location.href = "/";
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
                <button onClick={handleLogin}>Đăng nhập</button>
            </div>
        </div>
    );
};

export default Login;