// import React from "react";
// import "../styles/donate_page.css";
// import {useNavigate} from "react-router-dom";

// const streamers = [
//     { name: "MixiGaming", img: "https://i.pravatar.cc/150?img=1", money: "246M", rank: 1 },
//     { name: "Tabi", img: "https://i.pravatar.cc/150?img=2", money: "51M", rank: 2 },
//     { name: "Hướng Mêu", img: "https://i.pravatar.cc/150?img=3", money: "38M", rank: 3 },
//     { name: "Độ Mixi Clone", img: "https://i.pravatar.cc/150?img=4", money: "20M" },
// ];

// const DonatePage = () => {
//     const navigate = useNavigate();
//     return (
//         <div className="donate-container">
//             {/* Header */}
//             <div className="donate-header">
//                 <h1>💙 Donate cho Streamer</h1>
//             </div>

//             {/* Search */}
//             <div className="search-box">
//                 <input placeholder="Nhập tên streamer để tìm kiếm..." />
//             </div>

//             {/* Suggested */}
//             <div className="suggest-section">
//                 <h2>✨ Streamer gợi ý</h2>

//                 <div className="streamer-grid">
//                     {streamers.map((s, i) => (
//                         <div key={i} className="streamer-card"  onClick={() => navigate(`/streamer/${i}`)}>
//                             <img src={s.img} alt={s.name} />
//                             <span>{s.name}</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };


// export default DonatePage;
import React, { useEffect, useState } from "react";
import "../styles/donate_page.css";
import { useNavigate } from "react-router-dom";
import {
    getTopStreamer,
    searchStreamers,
    SearchStreamerResponse,
    TopStreamerResponse,
} from "../features/streamer/streamerApi";

const DonatePage = () => {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<SearchStreamerResponse[]>([]);
    const [topStreamers, setTopStreamers] = useState<TopStreamerResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const loadTopStreamers = async () => {
            try {
                const res = await getTopStreamer();
                setTopStreamers(res.data || []);
            } catch (error) {
                console.error("Lỗi lấy top streamer:", error);
            }
        };

        loadTopStreamers();
    }, []);

    useEffect(() => {
        const trimmedKeyword = keyword.trim();

        if (!trimmedKeyword) {
            setResults([]);
            setSearched(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await searchStreamers(trimmedKeyword);
                setResults(res.data || []);
                setSearched(true);
            } catch (error) {
                console.error("Lỗi tìm kiếm streamer:", error);
                setResults([]);
                setSearched(true);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [keyword]);

    const renderCard = (
        streamer: {
            streamerId: number;
            displayName: string;
            avatar: string;
            token: string;
        },
        index?: number
    ) => (
        <div
            key={streamer.streamerId}
            className="streamer-card"
            onClick={() => navigate(`/streamer/${streamer.token}`)}
        >
            <img
                src={streamer.avatar || "https://i.pravatar.cc/150?img=1"}
                alt={streamer.displayName}
            />
            <span>
                {index !== undefined ? `#${index + 1} ` : ""}
                {streamer.displayName}
            </span>
        </div>
    );

    return (
        <div className="donate-container">
            <div className="donate-header">
                <h1>💙 Donate cho Streamer</h1>
            </div>

            <div className="search-box">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Nhập tên streamer để tìm kiếm..."
                />
            </div>

            {loading && (
                <div className="suggest-section">
                    <p>Đang tìm kiếm...</p>
                </div>
            )}

            {!loading && keyword.trim() !== "" && searched && results.length === 0 && (
                <div className="suggest-section">
                    <p>Không tìm thấy streamer phù hợp.</p>
                </div>
            )}

            {!loading && keyword.trim() !== "" && results.length > 0 && (
                <div className="suggest-section">
                    <h2>🔎 Kết quả tìm kiếm</h2>
                    <div className="streamer-grid">
                        {results.map((s) => renderCard(s))}
                    </div>
                </div>
            )}

            {!keyword.trim() && (
                <div className="suggest-section">
                    <h2>✨ Streamer gợi ý</h2>
                    <div className="streamer-grid">
                        {topStreamers.map((s, i) => renderCard(s, i))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonatePage;