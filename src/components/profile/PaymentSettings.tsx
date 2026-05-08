import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

type PaymentMethod = {
    name: string;
    fee: string;
    accent: string;
    short: string;
    connected: boolean;
};

const paymentMethods: PaymentMethod[] = [
    {
        name: "Ngân hàng (QR Code)",
        fee: "Phí 0%",
        accent: "#f59e0b",
        short: "QR",
        connected: true,
    },
    {
        name: "Ví điện tử Momo",
        fee: "Miễn phí",
        accent: "#db2777",
        short: "Mo",
        connected: true,
    },
    {
        name: "Paypal",
        fee: "Miễn phí",
        accent: "#0ea5e9",
        short: "P",
        connected: true,
    },
    {
        name: "Tiền điện tử BNB",
        fee: "Miễn phí",
        accent: "#fbbf24",
        short: "BNB",
        connected: false,
    },
];

const banks = [
    "Sacombank",
    "TPBank",
    "VPBank",
    "VietinBank",
    "ACB",
    "BIDV",
    "MBBank",
    "OCB",
    "KienLongBank",
    "MSB",
];

const PaymentSettings = () => {
    const streamer = useSelector((state: RootState) => state.auth.streamer);
    const user = useSelector((state: RootState) => state.auth.user);

    const displayName =
        streamer?.displayName || user?.fullName || user?.username || "Người dùng";

    const [showBankModal, setShowBankModal] = useState(false);
    const [bank, setBank] = useState("MBBank");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState(user?.fullName || "");

    return (
        <div className="profile-content">
            <div className="profile-card payment-card">
                <div className="payment-hero">
                    <div>
                        <h2>Cài Đặt Thanh Toán</h2>
                        <p>Quản lý các kênh thanh toán của bạn</p>
                    </div>
                </div>

                <div className="payment-guide">
                    <div className="payment-guide-text">
                        <h3>Hướng dẫn kết nối thanh toán tự động</h3>
                        <p>Bước 1: Thêm thông tin tài khoản ngân hàng hoặc ví nhận tiền.</p>
                        <p>Bước 2: Sao chép mã QR và đường dẫn callback vào trang thanh toán.</p>
                    </div>

                </div>

                <div className="payment-section-title">Các phương thức thanh toán</div>
                <div className="payment-grid">
                    {paymentMethods.map((method) => (
                        <article key={method.name} className="payment-method-card">
                            <div className="payment-method-top">
                                <div
                                    className="payment-method-icon"
                                    style={{ background: method.accent }}
                                >
                                    {method.short}
                                </div>

                                <div className="payment-method-meta">
                                    <h4>{method.name}</h4>
                                    <span>{method.fee}</span>
                                </div>
                            </div>

                            <div className={`payment-status ${method.connected ? "on" : "off"}`}>
                                {method.connected ? "Đã kết nối" : "Chưa kết nối"}
                            </div>

                            <div className="payment-actions">
                                <button
                                    type="button"
                                    className="payment-edit-btn"
                                    onClick={() => {
                                        if (method.name === "Ngân hàng (QR Code)") {
                                            setShowBankModal(true);
                                        }
                                    }}
                                >
                                    Sửa thanh toán
                                </button>
                                <button type="button" className="payment-icon-btn" aria-label="Xóa">
                                    ×
                                </button>
                            </div>
                        </article>
                    ))}

                    <button type="button" className="payment-add-card" onClick={() => setShowBankModal(true)}>
                        + Thêm thanh toán
                    </button>
                </div>
            </div>

            {showBankModal && (
                <div className="payment-modal-backdrop" onClick={() => setShowBankModal(false)}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <div>
                                <h3>Cập nhật tài khoản thanh toán</h3>
                                <p>Quản lý thông tin ngân hàng QR và tài khoản liên kết.</p>
                            </div>
                            <button
                                type="button"
                                className="payment-modal-close"
                                onClick={() => setShowBankModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Cổng thanh toán</label>
                            <input value="Ngân hàng (QR Code) - SePay" readOnly />
                        </div>

                        <div className="form-group">
                            <label>Ngân hàng</label>
                            <select value={bank} onChange={(e) => setBank(e.target.value)}>
                                {banks.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Số tài khoản</label>
                            <input
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Nhập số tài khoản"
                            />
                        </div>

                        <div className="form-group">
                            <label>Chủ tài khoản</label>
                            <input
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                                placeholder="Tên chủ tài khoản"
                            />
                        </div>

                        <button type="button" className="payment-modal-update-btn" onClick={() => setShowBankModal(false)}>
                            Cập nhật
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentSettings;
