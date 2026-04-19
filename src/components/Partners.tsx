import "../styles/styles.css";

const partners = ["/images/pay1.png", "/images/pay2.png"];

const Partners = () => (
    <section className="partners">
        <h2>Doi tac Ngan hang & Vi dien tu</h2>
        <div className="partners-grid">
            {partners.map((src, i) => (
                <img key={i} src={src} alt="Partner logo" />
            ))}
        </div>
    </section>
);

export default Partners;