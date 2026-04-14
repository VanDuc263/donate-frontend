import {Link, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {fetchTopStreamer} from "../features/streamer/streamerSlice";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../app/store";



const Streamers = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(fetchTopStreamer());
    }, [dispatch]);

    const { topStreamers, loading } = useSelector((state: any) => state.streamer);


    return (
        <div>
            <section className="streamers">
                <h2>🔥 Top Streamers</h2>

                <div className="grid">
                    {topStreamers.map((s: any, i: number) => (
                        <Link to={`/streamer/${s.token}`} key={s.id}>
                            <div className="card">
                                <span className="rank">#{i + 1}</span>
                                <img src={s.avatar} alt={s.displayName} />
                                <h3>{s.displayName}</h3>
                                <p className="money">{s.totalAmount}.000 VNĐ</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Streamers;