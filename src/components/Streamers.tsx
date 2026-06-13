import { Link } from "react-router-dom";
import { useEffect } from "react";
import { fetchTopStreamer } from "../features/streamer/streamerSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../app/store";

const convertAmount = (amount: number): string => {
    if (amount < 1000) return amount.toString();

    if (amount < 1_000_000) {
        return (amount / 1000).toFixed(1).replace(".0", "") + "K";
    }

    if (amount < 1_000_000_000) {
        return (amount / 1_000_000).toFixed(1).replace(".0", "") + "M";
    }

    return (amount / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
};

const Streamers = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchTopStreamer());
    }, [dispatch]);

    const { topStreamers } = useSelector((state: any) => state.streamer);

    return (
        <section className="streamers home-streamers">
            <div className="home-section-title">
                <span>Top streamer</span>
                <h2>Những kênh nổi bật nhất trên hệ thống</h2>

            </div>

            <div className="streamers-rail">
                {topStreamers.slice(0, 8).map((s: any, i: number) => (
                    <Link
                        to={`/streamer/${s.token}`}
                        key={s.id || s.streamerId}
                        className="card"
                    >
                        <img src={s.avatar} alt={s.displayName} />
                        <div className="rank">{i + 1}</div>
                        <h3 className="streamers-rail__name">{s.displayName}</h3>
                        <p className="money">{convertAmount(s.totalAmount)} VND</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default Streamers;
