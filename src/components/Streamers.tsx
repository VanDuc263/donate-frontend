import {Link, useNavigate} from "react-router-dom";

const streamers = [
    { id:1,name: "MixiGaming", img: "https://i.pravatar.cc/150?img=1", money: "246M", rank: 1 },
    { id:2,name: "Tabi", img: "https://i.pravatar.cc/150?img=2", money: "51M", rank: 2 },
    { id:3,name: "Hướng Mêu", img: "https://i.pravatar.cc/150?img=3", money: "38M", rank: 3 },
    { id:4,name: "Độ Mixi Clone", img: "https://i.pravatar.cc/150?img=4", money: "20M" },
];

const Streamers = () => {
    return (
        <div>
            <section className="streamers">
                <h2>🔥 Top Streamers</h2>

                <div className="grid">
                    {streamers.map((s, i) => (
                        <Link to={`/streamer/${s.id}`} className="card-link" key={s.id}>
                            <div className="card">
                                {s.rank && <span className="rank">#{s.rank}</span>}
                                <img src={s.img} alt={s.name} />
                                <h3>{s.name}</h3>
                                <p className="money">{s.money} VNĐ</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Streamers;