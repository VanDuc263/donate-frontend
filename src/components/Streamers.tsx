import "../styles/styles.css";

const streamers = [
    { name: "Hoàng Luân", img: "asserts/img/mokup.png" },
    { name: "Thầy Giáo Ba", img: "/images/ba.jpg" },
    { name: "Optimus", img: "/images/optimus.jpg" },
    { name: "Tú Lê", img: "/images/tule.jpg" },
];

const Streamers = () => (
    <section className="streamers">
        <h2>Streamer đang dùng WeScan</h2>
        <div className="streamers-grid">
            {streamers.map((s) => (
                <div key={s.name}>
                    <img src={s.img} alt={s.name} />
                    <p>{s.name}</p>
                </div>
            ))}
        </div>
    </section>
);

export default Streamers;