import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket } from "../services/socket";
import "../styles/donate_overlay.css";

const DonateOverlayPage = () => {
    const { streamerId } = useParams();

    const [queue, setQueue] = useState<any[]>([]);
    const [current, setCurrent] = useState<any | null>(null);
    const [visible, setVisible] = useState(false);

    // ================= SOCKET =================
    useEffect(() => {
        console.log(streamerId)
        if (!streamerId) return;

        const disconnect = connectSocket(Number(streamerId), (data) => {
            console.log("🔥 overlay receive:", data);

            setQueue((prev) => [...prev, data]);
        });

        return () => disconnect();
    }, [streamerId]);

    // ================= QUEUE HANDLER =================
    useEffect(() => {
        if (!current && queue.length > 0) {
            const next = queue[0];
            setQueue((prev) => prev.slice(1));

            setCurrent(next);
            setVisible(true);

            // auto hide
            setTimeout(() => {
                setVisible(false);
                setTimeout(() => {
                    setCurrent(null);
                }, 500);
            }, 4000);
        }
    }, [queue, current]);

    if (!current || !visible) return null;

    return (
        <div className="donate-overlay">
            <div className="overlay-content">

                {/* LEFT: animation */}
                <div className="overlay-image">
                    <img src="/images/anhdong.gif" alt="donate" />
                </div>

                {/* RIGHT: info */}
                <div className="overlay-text">
                    <h3>{current.donorName}</h3>
                    <p>Donate {current.amount} VND</p>
                    {current.message && <p>"{current.message}"</p>}
                </div>

            </div>
        </div>
    );
};

export default DonateOverlayPage;