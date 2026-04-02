import "../styles/styles.css";

const partners = [
    "/images/bank1.png",
    "/images/bank2.png",
    "/images/bank3.png",
    "/images/pay1.png",
    "/images/pay2.png",
];

const Partners = () => (
    <section className="partners">
        <h2>Đối tác Ngân hàng & Ví điện tử</h2>
        <div className="partners-grid">
            {partners.map((src, i) => (
                <img key={i} src={src} alt="Partner logo" />
            ))}
        </div>
    </section>
);

export default Partners;