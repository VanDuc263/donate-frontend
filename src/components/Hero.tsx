const Hero = () => (
    <section className="hero">
        <div className="hero-bg hero-bg-left" />
        <div className="hero-bg hero-bg-right" />

        <div className="hero-inner">
            <div className="hero-copy">
                <p className="hero-kicker">Nền tảng donate cho creator</p>
                <h1>
                    ZyScan đi cùng <span>nhà sáng tạo</span>
                </h1>
                <p className="hero-description">
                    Tạo trang cá nhân nổi bật, nhận donate trực tiếp và quản lý thanh toán trong
                    một giao diện hiện đại, gọn gàng.
                </p>

                <div className="hero-input">
                    <input placeholder="taziu.com/page-url" />
                    <button>Tạo ngay</button>
                </div>
            </div>

            <div className="hero-visual">
                <div className="hero-phone hero-phone-left">
                    <img src="/images/streamers/test.jpeg" alt="mobile preview" />
                </div>

                <div className="hero-phone hero-phone-center">
                    <img src="/images/streamers/test.jpeg" alt="dashboard preview" />
                </div>

                <div className="hero-laptop">
                    <img src="/images/streamers/test.jpeg" alt="desktop preview" />
                </div>
            </div>
        </div>
    </section>
);

export default Hero;
