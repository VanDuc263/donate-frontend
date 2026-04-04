import React from "react";
import "../styles/donate_page.css";
import {useNavigate} from "react-router-dom";

const streamers = [
    { name: "MixiGaming", img: "https://i.pravatar.cc/150?img=1", money: "246M", rank: 1 },
    { name: "Tabi", img: "https://i.pravatar.cc/150?img=2", money: "51M", rank: 2 },
    { name: "Hướng Mêu", img: "https://i.pravatar.cc/150?img=3", money: "38M", rank: 3 },
    { name: "Độ Mixi Clone", img: "https://i.pravatar.cc/150?img=4", money: "20M" },
];

const DonatePage = () => {
    const navigate = useNavigate();
    return (
        <div className="donate-container">
            {/* Header */}
            <div className="donate-header">
                <h1>💙 Donate cho Streamer</h1>
            </div>

            {/* Search */}
            <div className="search-box">
                <input placeholder="Nhập tên streamer để tìm kiếm..." />
            </div>

            {/* Suggested */}
            <div className="suggest-section">
                <h2>✨ Streamer gợi ý</h2>

                <div className="streamer-grid">
                    {streamers.map((s, i) => (
                        <div key={i} className="streamer-card"  onClick={() => navigate(`/streamer/${i}`)}>
                            <img src={s.img} alt={s.name} />
                            <span>{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default DonatePage;