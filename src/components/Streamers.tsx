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
        <div>
            <section className="streamers">
                <h2>Top Streamers</h2>

                <div className="grid">
                    {topStreamers.map((s: any, i: number) => (
                        <Link to={`/streamer/${s.token}`} key={s.id}>
                            <div className="card">
                                <span className="rank">#{i + 1}</span>
                                <img src={s.avatar} alt={s.displayName} />
                                <h3>{s.displayName}</h3>
                                <p className="money">{convertAmount(s.totalAmount)} VND</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Streamers;