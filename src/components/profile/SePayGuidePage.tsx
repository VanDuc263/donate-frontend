import React from "react";
import { Link } from "react-router-dom";

const virtualAccountNotes = [
    { bank: "VPBank", note: "Chưa hỗ trợ tài khoản ảo" },
    { bank: "TPBank", note: "Chưa hỗ trợ tài khoản ảo" },
    { bank: "VietinBank", note: "Chưa hỗ trợ tài khoản ảo" },
    { bank: "ACB", note: "Hỗ trợ tạo tài khoản ảo" },
    { bank: "BIDV", note: "Bắt buộc phải dùng tài khoản ảo" },
    { bank: "OCB", note: "Bắt buộc phải dùng tài khoản ảo" },
    { bank: "MBBank", note: "Không nên dùng tài khoản ảo vì hay bị lỗi" },
];

const SePayGuidePage = () => {
    return (
        <div className="profile-content">
            <div className="profile-card sepay-guide-card">
                <div className="sepay-guide-header">
                    <div>
                        <h2>Hướng Dẫn Cài Đặt Thanh Toán SePay</h2>
                        <p>
                            Làm theo từng bước bên dưới để kết nối tài khoản ngân hàng QR qua
                            SePay cho hệ thống.
                        </p>
                    </div>
                    <Link to="/account/payment" className="sepay-guide-back">
                        Quay lại cài đặt thanh toán
                    </Link>
                </div>

                <section className="sepay-guide-section">
                    <div className="sepay-guide-step-head">
                        <span className="sepay-step-badge">Bước 1</span>
                        <h3>Tạo tài khoản tại SePay</h3>
                    </div>
                    <div className="sepay-guide-body">
                        <p>
                            Truy cập{" "}
                            <a href="https://sepay.vn/" target="_blank" rel="noreferrer">
                                https://sepay.vn/
                            </a>
                        </p>
                        <p>
                            Đăng ký tài khoản và thực hiện xác thực thông tin theo hướng dẫn của
                            SePay.
                        </p>
                    </div>
                </section>

                <section className="sepay-guide-section">
                    <div className="sepay-guide-step-head">
                        <span className="sepay-step-badge">Bước 2</span>
                        <h3>Thêm tài khoản ngân hàng thanh toán</h3>
                    </div>
                    <div className="sepay-guide-body">
                        <p>
                            Trên giao diện SePay, chọn <strong>Ngân Hàng</strong> -{" "}
                            <strong>Kết nối tài khoản</strong>. Hoặc truy cập{" "}
                            <a
                                href="https://my.sepay.vn/bankaccount/connect"
                                target="_blank"
                                rel="noreferrer"
                            >
                                https://my.sepay.vn/bankaccount/connect
                            </a>
                        </p>
                        <p>
                            Nếu bạn chưa có tài khoản ngân hàng, có thể tạo tài khoản trực tiếp
                            trên các ứng dụng ngân hàng như MB Bank, OCB.
                        </p>
                        <p>
                            Hiện tại hệ thống chỉ đang hỗ trợ các ngân hàng trên SePay. Một số
                            ngân hàng có thể tạo tài khoản ảo để nhận tiền, giúp tránh để lộ số
                            tài khoản chính.
                        </p>

                        <div className="sepay-guide-highlight">
                            <h4>Hỗ trợ tài khoản ảo theo ngân hàng</h4>
                            <ul className="sepay-guide-bank-list">
                                {virtualAccountNotes.map((item) => (
                                    <li key={item.bank}>
                                        <strong>{item.bank}</strong>
                                        <span>{item.note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p>
                            Thêm lọc giao dịch theo từ khóa <strong>ZYPAGE</strong> trên SePay để
                            dễ theo dõi giao dịch hơn.
                        </p>

                        <div className="sepay-guide-highlight">
                            <h4>Kiểm tra tài khoản ảo</h4>
                            <p>
                                Kiểm tra xem sau khi tích hợp ngân hàng có tạo ra tài khoản ảo hay
                                không. Nếu có, bạn cần thay số tài khoản nhận tiền trên hệ thống
                                bằng số tài khoản ảo đó. Tiền gửi qua số tài khoản ảo vẫn sẽ về
                                tài khoản chính của bạn.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="sepay-guide-section">
                    <div className="sepay-guide-step-head">
                        <span className="sepay-step-badge">Bước 3</span>
                        <h3>Thêm webhook thanh toán</h3>
                    </div>
                    <div className="sepay-guide-body">
                        <p>
                            Truy cập vào mục <strong>Tích Hợp Webhook</strong> hoặc theo liên kết{" "}
                            <a
                                href="https://my.sepay.vn/webhooks"
                                target="_blank"
                                rel="noreferrer"
                            >
                                https://my.sepay.vn/webhooks
                            </a>
                        </p>
                        <p>Nhấn thêm webhook mới và thay đổi các mục sau:</p>

                        <div className="sepay-guide-config">
                            <div className="sepay-guide-config-row">
                                <strong>Gọi đến URL</strong>
                                <span>https://your-domain.com/api/webhooks/sepay</span>
                            </div>
                            <div className="sepay-guide-config-row">
                                <strong>Là WebHooks xác thực thanh toán?</strong>
                                <span>Đúng</span>
                            </div>
                            <div className="sepay-guide-config-row">
                                <strong>Gọi lại Webhooks khi?</strong>
                                <span>Tích vào ô</span>
                            </div>
                            <div className="sepay-guide-config-row">
                                <strong>Kiểu chứng thực</strong>
                                <span>ApiKey</span>
                            </div>
                            <div className="sepay-guide-config-row">
                                <strong>ApiKey</strong>
                                <span>
                                    Điền chuỗi bảo mật bạn muốn dùng. ApiKey bên hệ thống phải
                                    khớp với ApiKey trên SePay.
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="sepay-guide-section">
                    <div className="sepay-guide-step-head">
                        <span className="sepay-step-badge">Bước 4</span>
                        <h3>Kiểm tra chức năng thanh toán</h3>
                    </div>
                    <div className="sepay-guide-body">
                        <p>
                            Trước khi chính thức cho người dùng thanh toán, bạn cần test thử chức
                            năng thanh toán để đảm bảo mọi quy trình hoạt động trơn tru.
                        </p>
                        <p>
                            Theo dõi gói giao dịch bạn đang sử dụng trên SePay. Nếu hết lượt của
                            gói giao dịch, chức năng thanh toán có thể bị gián đoạn.
                        </p>
                    </div>
                </section>

                <section className="sepay-guide-section sepay-guide-warning">
                    <div className="sepay-guide-step-head">
                        <span className="sepay-step-badge sepay-step-badge-warning">Lưu ý</span>
                        <h3>Một vài điểm cần kiểm tra trước khi dùng thật</h3>
                    </div>
                    <div className="sepay-guide-body">
                        <p>
                            Một số ngân hàng trên SePay yêu cầu gửi tiền qua số tài khoản ảo được
                            tạo ra sau khi kết nối thì SePay mới nhận được giao dịch. Nếu có tài
                            khoản ảo, hãy ưu tiên dùng số đó thay cho số tài khoản chính.
                        </p>
                        <p>
                            Chúc bạn tích hợp thanh toán thành công với SePay. Đừng quên đăng ký
                            gói SePay để không làm gián đoạn quá trình sử dụng.
                        </p>
                    </div>
                </section>

                <div className="sepay-guide-footer">
                    <a href="https://sepay.vn/" target="_blank" rel="noreferrer">
                        Đăng ký gói SePay
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SePayGuidePage;
