import React, { useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiAccountHeart, mdiMagnify, mdiQrcode, mdiShieldCheck } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import {
    getTopStreamer,
    searchStreamers,
    SearchStreamerResponse,
    TopStreamerResponse,
} from "../features/streamer/streamerApi";
import "../styles/donate_page.css";

const donateHighlights = [
    {
        icon: mdiAccountHeart,
        title: "Ủng hộ nhanh",
        text: "Tìm đúng creator và chuyển đến trang donate chỉ trong vài giây.",
    },
    {
        icon: mdiQrcode,
        title: "Hỗ trợ QR",
        text: "Người xem có thể donate thuận tiện hơn trên điện thoại.",
    },
    {
        icon: mdiShieldCheck,
        title: "Rõ ràng hơn",
        text: "Thông tin creator và luồng thao tác được trình bày dễ hiểu hơn.",
    },
];

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
        <button
            key={streamer.streamerId}
            type="button"
            className="streamer-card"
            onClick={() => navigate(`/streamer/${streamer.token}`)}
        >
            <div className="streamer-card-avatar">
                <img
                    src={streamer.avatar || "https://i.pravatar.cc/150?img=1"}
                    alt={streamer.displayName}
                />
            </div>
            <div className="streamer-card-meta">
                {index !== undefined && <small>Top #{index + 1}</small>}
                <strong>{streamer.displayName}</strong>
                <span>Đi đến trang donate</span>
            </div>
        </button>
    );

    return (
        <div className="donate-container">
            <section className="donate-hero">
                <div className="donate-header">
                    <span className="donate-badge">ZyScan Donate</span>
                    <h1>Tìm creator bạn muốn ủng hộ</h1>
                    <p>Chọn đúng streamer hoặc creator để bắt đầu donate nhanh, rõ ràng và dễ thao tác hơn.</p>
                </div>

                <div className="search-box">
                    <div className="search-field">
                        <Icon path={mdiMagnify} size={0.95} />
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Nhập tên streamer hoặc creator..."
                        />
                    </div>
                </div>

                <div className="donate-highlights">
                    {donateHighlights.map((item) => (
                        <article key={item.title} className="donate-highlight-card">
                            <div className="donate-highlight-icon">
                                <Icon path={item.icon} size={1} />
                            </div>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {loading && (
                <div className="suggest-section">
                    <p className="donate-status">Đang tìm kiếm...</p>
                </div>
            )}

            {!loading && keyword.trim() !== "" && searched && results.length === 0 && (
                <div className="suggest-section">
                    <p className="donate-status">Không tìm thấy streamer phù hợp.</p>
                </div>
            )}

            {!loading && keyword.trim() !== "" && results.length > 0 && (
                <div className="suggest-section">
                    <div className="suggest-header">
                        <h2>Kết quả tìm kiếm</h2>
                        <span>{results.length} kết quả</span>
                    </div>
                    <div className="streamer-grid">
                        {results.map((s) => renderCard(s))}
                    </div>
                </div>
            )}

            {!keyword.trim() && (
                <div className="suggest-section">
                    <div className="suggest-header">
                        <h2>Streamer gợi ý</h2>
                        <span>{topStreamers.length} creator nổi bật</span>
                    </div>
                    <div className="streamer-grid">
                        {topStreamers.map((s, i) => renderCard(s, i))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonatePage;
