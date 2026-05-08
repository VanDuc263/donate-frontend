import Hero from "../components/Hero";
import Streamers from "../components/Streamers";
import Footer from "../components/Footer";
import "../styles/styles.css";

const overviewFeatures = [
    {
        title: "Tạo link donate",
        text: "Mỗi creator có một trang donate riêng, dễ chia sẻ và dễ nhớ.",
    },
    {
        title: "Nhận thanh toán",
        text: "Kết nối ngân hàng, ví và các phương thức thanh toán phổ biến.",
    },
    {
        title: "Theo dõi giao dịch",
        text: "Quản lý donate theo thời gian thực, nhìn rõ từng lượt đóng góp.",
    },
];

const faqs = [
    "Taziu là gì và dành cho ai?",
    "Tôi có thể tạo trang cá nhân như thế nào?",
    "Hệ thống hỗ trợ những phương thức thanh toán nào?",
    "Tôi có thể đổi nội dung và ảnh đại diện sau khi tạo trang không?",
    "Người xem có thể donate bằng điện thoại được không?",
    "Nếu gặp lỗi kết nối thì cần kiểm tra những gì?",
    "Taziu có hỗ trợ tùy biến giao diện trang không?",
];

const Home = () => {
    return (
        <>
            <Hero />

            <section className="home-features">
                <div className="home-section-title home-section-title-wide">
                    <span>Tổng quan trang donate</span>
                    <h2>Một không gian donate gọn, đẹp và dễ thao tác hơn</h2>
                    <p>
                        ZyScan giúp creator tạo link donate riêng, trình bày thông tin rõ ràng
                        và giữ trải nghiệm thanh toán liền mạch cho người xem.
                    </p>
                </div>

                <div className="overview-grid">
                    {overviewFeatures.map((feature, index) => (
                        <article key={feature.title} className="overview-feature">
                            <div className="overview-feature-icon">
                                <span>0{index + 1}</span>
                            </div>
                            <div>
                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <Streamers />

            <section className="home-faq">
                <div className="faq-aside">
                    <div className="faq-mark">FAQ?</div>
                    <p>Những câu hỏi thường gặp về ZyScan</p>
                </div>

                <div className="faq-list">
                    {faqs.map((question) => (
                        <button key={question} type="button" className="faq-item">
                            <span>{question}</span>
                            <span className="faq-chevron">⌄</span>
                        </button>
                    ))}
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Home;
