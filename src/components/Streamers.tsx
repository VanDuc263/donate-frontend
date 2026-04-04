const streamers = [
    { name: "MixiGaming", img: "https://i.pravatar.cc/150?img=1", money: "246M", rank: 1 },
    { name: "Tabi", img: "https://i.pravatar.cc/150?img=2", money: "51M", rank: 2 },
    { name: "Hướng Mêu", img: "https://i.pravatar.cc/150?img=3", money: "38M", rank: 3 },
    { name: "Độ Mixi Clone", img: "https://i.pravatar.cc/150?img=4", money: "20M" },
];

const Streamers = () => (
    <section className="streamers">
        <h2>🔥 Top Streamers</h2>

        <div className="grid">
            {streamers.map((s, i) => (
                <div className="card" key={i}>
                    {s.rank && <span className="rank">#{s.rank}</span>}
                    <img src={s.img} />
                    <h3>{s.name}</h3>
                    <p className="money">{s.money} VNĐ</p>
                </div>
            ))}
        </div>
    </section>
);

export default Streamers;