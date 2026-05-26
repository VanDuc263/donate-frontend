import { useState } from "react";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Streamers from "../components/Streamers";
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
    {
        question: "ZyScan là gì và dành cho ai?",
        summary: "ZyScan là nền tảng tạo trang donate chuyên nghiệp cho creator.",
        details: [
            "ZyScan phù hợp với streamer, creator, idol và những người đang xây dựng cộng đồng cá nhân trên internet.",
            "Nền tảng giúp bạn tập trung toàn bộ trải nghiệm nhận ủng hộ vào một trang duy nhất, rõ ràng hơn và dễ tạo niềm tin hơn với người xem.",
            "Thay vì dùng nhiều công cụ rời rạc, bạn có thể giới thiệu bản thân, hiển thị thông tin thanh toán và kết nối cộng đồng tại cùng một nơi.",
        ],
    },
    {
        question: "Tôi tạo trang donate trên ZyScan như thế nào?",
        summary: "Bạn có thể tạo trang donate chỉ sau vài bước thiết lập cơ bản.",
        details: [
            "Chỉ cần đăng nhập, cập nhật tên hiển thị, ảnh đại diện, ảnh bìa và phần giới thiệu ngắn về mình.",
            "Sau đó, bạn liên kết thông tin nhận thanh toán để hệ thống có thể hỗ trợ người xem donate thuận tiện hơn.",
            "Khi hoàn tất, ZyScan sẽ tạo cho bạn một trang donate riêng với đường dẫn dễ chia sẻ trên livestream, mạng xã hội hoặc hồ sơ cá nhân.",
        ],
    },
    {
        question: "ZyScan hỗ trợ những phương thức thanh toán nào?",
        summary: "ZyScan ưu tiên các phương thức thanh toán quen thuộc và dễ dùng.",
        details: [
            "Nền tảng hỗ trợ liên kết tài khoản ngân hàng và những cách thanh toán phổ biến với người dùng Việt Nam.",
            "Mục tiêu là giúp người xem hoàn tất donate nhanh, ít bước và không bị gián đoạn khi đang theo dõi nội dung của bạn.",
            "Tùy theo cấu hình tài khoản, hệ thống sẽ hiển thị phương thức phù hợp để người ủng hộ thao tác thuận tiện hơn.",
        ],
    },
    {
        question: "Người xem có thể donate bằng điện thoại hoặc quét QR không?",
        summary: "Có. ZyScan được tối ưu cho điện thoại và hỗ trợ quét QR.",
        details: [
            "Người xem có thể truy cập trang donate và thao tác dễ dàng ngay trên thiết bị di động.",
            "Nếu bạn đã cấu hình thanh toán, hệ thống cũng hỗ trợ hiển thị mã QR để người xem quét và hoàn tất giao dịch nhanh chóng.",
            "Đây là cách donate đặc biệt phù hợp trong lúc livestream hoặc khi bạn chia sẻ link trên mạng xã hội.",
        ],
    },
    {
        question: "Tôi có thể tùy biến giao diện trang donate không?",
        summary: "Có. Bạn có thể cá nhân hóa trang donate theo phong cách riêng.",
        details: [
            "Bạn có thể thay đổi ảnh đại diện, ảnh bìa, nội dung giới thiệu và liên kết mạng xã hội để trang donate mang dấu ấn cá nhân rõ ràng hơn.",
            "Một giao diện chỉn chu và đồng bộ thường giúp tăng độ tin cậy với người xem ngay từ lần truy cập đầu tiên.",
            "ZyScan được thiết kế để creator có thể tùy biến nhanh mà không cần kỹ năng thiết kế chuyên sâu.",
        ],
    },
    {
        question: "ZyScan bảo mật giao dịch và thông tin người dùng như thế nào?",
        summary: "Bảo mật và minh bạch là một phần cốt lõi của ZyScan.",
        details: [
            "Nền tảng được xây dựng theo hướng hiển thị rõ thông tin cần thiết và giúp người dùng dễ kiểm soát quá trình donate.",
            "Các khu vực liên quan đến cấu hình tài khoản, lịch sử donate và thông tin hiển thị đều được tổ chức rõ ràng để hạn chế nhầm lẫn khi sử dụng.",
            "Điều này giúp creator yên tâm hơn khi vận hành trang donate, đồng thời tăng độ tin cậy đối với người ủng hộ.",
        ],
    },
    {
        question: "Tôi có thể xem và quản lý lịch sử donate ở đâu?",
        summary: "Bạn có thể theo dõi lịch sử donate ngay trong khu vực quản lý tài khoản.",
        details: [
            "Các giao dịch được hiển thị rõ ràng để bạn dễ xem lại người donate, số tiền và thời điểm phát sinh.",
            "Việc có một nơi tổng hợp lịch sử giúp creator quản lý cộng đồng tốt hơn và nhanh chóng đối chiếu thông tin khi cần.",
            "Đây cũng là yếu tố quan trọng để duy trì sự minh bạch và chuyên nghiệp trong quá trình sử dụng nền tảng.",
        ],
    },
    {
        question: "ZyScan có hỗ trợ donate realtime và thông báo khi livestream không?",
        summary: "Có. ZyScan hỗ trợ donate realtime để creator phản hồi kịp thời hơn.",
        details: [
            "Hệ thống giúp bạn dễ theo dõi các lượt donate mới khi đang phát trực tiếp.",
            "Điều này đặc biệt quan trọng với streamer vì phản hồi đúng lúc luôn góp phần tạo nên cảm xúc và sự kết nối với người xem.",
            "Khi thông báo hiển thị ổn định và kịp thời, bạn có thể giữ nhịp livestream tự nhiên hơn và nâng cao trải nghiệm cộng đồng.",
        ],
    },
];

const Home = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

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
                    {faqs.map((item, index) => {
                        const isOpen = openFaq === index;

                        return (
                            <div
                                key={item.question}
                                className={`faq-entry ${isOpen ? "open" : ""}`}
                            >
                                <button
                                    type="button"
                                    className="faq-item"
                                    onClick={() =>
                                        setOpenFaq((prev) => (prev === index ? null : index))
                                    }
                                >
                                    <span>{item.question}</span>
                                    <span className="faq-chevron">{isOpen ? "⌃" : "⌄"}</span>
                                </button>

                                {isOpen && (
                                    <div className="faq-answer">
                                        <p className="faq-summary">{item.summary}</p>
                                        {item.details.map((detail) => (
                                            <p key={detail}>{detail}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Home;
