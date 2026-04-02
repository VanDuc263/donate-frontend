import React from "react";
import "../styles/styles.css";

const Hero = () => (
    <section className="hero">
        <div className="hero-text">
            <h1>ZyScan đi cùng <span className="highlight">nhà sáng tạo</span></h1>
            <p>ZyScan giúp bạn tạo trang cá nhân miễn phí hoàn toàn, không quảng cáo, tích hợp thanh toán online và nhận donate trực tiếp vào tài khoản.</p>
            <div className="hero-input">
                <input type="text" placeholder="zyscan.com/page-url" />
                <button>Tạo ngay</button>
            </div>
        </div>
    </section>
);

export default Hero;