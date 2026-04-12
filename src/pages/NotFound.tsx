import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/notfound.css";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="nf-page">
            <div className="nf-content">
                <div className="nf-code">404</div>
                <div className="nf-glitch" aria-hidden="true">404</div>
                <h2>Trang không tồn tại</h2>
                <p>Có vẻ streamer này đã offline rồi 😅<br />Trang bạn tìm không thấy trên ZyScan.</p>
                <div className="nf-btns">
                    <button className="nf-home" onClick={() => navigate("/")}>🏠 Về trang chủ</button>
                    <button className="nf-back" onClick={() => navigate(-1)}>← Quay lại</button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
