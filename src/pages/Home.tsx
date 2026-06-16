import { useState } from "react";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Streamers from "../components/Streamers";
import "../styles/styles.css";

const overviewFeatures = [
    {
        title: "Tạo link donate",
        text: "Mỗi creator có một trang donate riêng, dễ chia sẻ và dễ nhớ hơn cho cộng đồng.",
    },
    {
        title: "Nhận thanh toán",
        text: "Kết nối ngân hàng, ví và các phương thức thanh toán quen thuộc ngay trên một giao diện gọn gàng.",
    },
    {
        title: "Theo dõi giao dịch",
        text: "Quản lý donate theo thời gian thực, nhìn rõ từng lượt đóng góp và giữ trải nghiệm luôn liền mạch.",
    },
];

const faqs = [
    {
        question: "ZyScan là gì và dành cho ai?",
        summary: "ZyScan là nền tảng tạo trang donate chuyên nghiệp cho creator, streamer và idol cá nhân.",
        details: [
            "ZyScan phù hợp với những ai đang xây dựng cộng đồng riêng trên internet và muốn có một nơi nhận ủng hộ rõ ràng, đẹp mắt.",
            "Thay vì dùng nhiều công cụ rời rạc, bạn có thể giới thiệu bản thân, hiển thị thông tin donate và kết nối cộng đồng ngay trên cùng một trang.",
            "Mục tiêu của ZyScan là giúp creator vận hành việc nhận donate đơn giản hơn nhưng vẫn giữ cảm giác chỉn chu và đáng tin cậy.",
        ],
    },
    {
        question: "Tôi tạo trang donate trên ZyScan như thế nào?",
        summary: "Bạn có thể tạo trang donate chỉ sau vài bước thiết lập cơ bản.",
        details: [
            "Chỉ cần đăng nhập, cập nhật tên hiển thị, ảnh đại diện, ảnh bìa và phần giới thiệu ngắn về bản thân.",
            "Sau đó, bạn liên kết thông tin nhận thanh toán để hệ thống hiển thị các cách donate phù hợp cho người xem.",
            "Khi hoàn tất, ZyScan sẽ tạo cho bạn một trang donate riêng với đường dẫn dễ chia sẻ trên livestream, mạng xã hội hoặc hồ sơ cá nhân.",
        ],
    },
    {
        question: "ZyScan hỗ trợ những phương thức thanh toán nào?",
        summary: "ZyScan ưu tiên các phương thức thanh toán quen thuộc, ít bước và dễ thao tác.",
        details: [
            "Nền tảng hỗ trợ liên kết tài khoản ngân hàng và các hình thức thanh toán phổ biến với người dùng Việt Nam.",
            "Mục tiêu là giúp người xem hoàn tất donate nhanh mà không bị gián đoạn khi đang theo dõi nội dung của bạn.",
            "Tùy theo cấu hình tài khoản, hệ thống sẽ hiển thị phương thức phù hợp để người ủng hộ thao tác thuận tiện hơn.",
        ],
    },
    {
        question: "Người xem có thể donate bằng điện thoại hoặc quét QR không?",
        summary: "Có. ZyScan được tối ưu cho điện thoại và hỗ trợ quét QR để donate nhanh hơn.",
        details: [
            "Người xem có thể truy cập trang donate và thao tác dễ dàng ngay trên thiết bị di động.",
            "Nếu bạn đã cấu hình thanh toán, hệ thống cũng hỗ trợ hiển thị mã QR để người xem quét và hoàn tất giao dịch chỉ trong vài giây.",
            "Đây là cách donate đặc biệt phù hợp trong lúc livestream hoặc khi bạn chia sẻ link trên mạng xã hội.",
        ],
    },
    {
        question: "Tôi có thể tùy biến giao diện trang donate không?",
        summary: "Có. Bạn có thể cá nhân hóa trang donate để giữ đúng màu sắc và phong cách riêng của mình.",
        details: [
            "Bạn có thể thay đổi ảnh đại diện, ảnh bìa, nội dung giới thiệu và liên kết mạng xã hội để trang donate mang dấu ấn cá nhân rõ hơn.",
            "Một giao diện đồng bộ, chỉn chu thường giúp tăng độ tin cậy với người xem ngay từ lần truy cập đầu tiên.",
            "ZyScan được thiết kế để creator có thể tùy biến nhanh mà không cần kỹ năng thiết kế chuyên sâu.",
        ],
    },
    {
        question: "ZyScan bảo mật giao dịch và thông tin người dùng như thế nào?",
        summary: "Bảo mật và minh bạch là một phần cốt lõi trong trải nghiệm sử dụng ZyScan.",
        details: [
            "Nền tảng được xây dựng theo hướng hiển thị rõ thông tin cần thiết để người dùng dễ kiểm soát quá trình donate.",
            "Các khu vực liên quan đến cấu hình tài khoản, lịch sử donate và thông tin hiển thị đều được tổ chức rõ ràng để hạn chế nhầm lẫn khi sử dụng.",
            "Điều này giúp creator yên tâm hơn khi vận hành trang donate, đồng thời tăng độ tin cậy với người ủng hộ.",
        ],
    },
    {
        question: "Tôi có thể xem và quản lý lịch sử donate ở đâu?",
        summary: "Bạn có thể theo dõi lịch sử donate ngay trong khu vực quản lý tài khoản.",
        details: [
            "Các giao dịch được hiển thị rõ ràng để bạn dễ xem lại người donate, số tiền và thời điểm phát sinh.",
            "Việc có một nơi tổng hợp lịch sử giúp creator quản lý cộng đồng tốt hơn và đối chiếu thông tin nhanh khi cần.",
            "Đây cũng là yếu tố quan trọng để duy trì sự minh bạch và chuyên nghiệp trong quá trình sử dụng nền tảng.",
        ],
    },
    {
        question: "ZyScan có hỗ trợ donate realtime và thông báo khi livestream không?",
        summary: "Có. ZyScan hỗ trợ donate realtime để creator phản hồi kịp thời và giữ nhịp livestream tốt hơn.",
        details: [
            "Hệ thống giúp bạn dễ theo dõi các lượt donate mới ngay khi đang phát trực tiếp.",
            "Điều này đặc biệt quan trọng với streamer vì phản hồi đúng lúc luôn góp phần tạo cảm xúc và tăng kết nối với người xem.",
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
                    <div className="faq-mark">FAQ</div>
                    <h2 className="faq-heading">Những câu hỏi thường gặp về ZyScan</h2>
                    <p className="faq-lead">
                        Giải đáp nhanh về cách tạo trang donate, nhận thanh toán và vận hành
                        livestream mượt hơn cho creator.
                    </p>
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
