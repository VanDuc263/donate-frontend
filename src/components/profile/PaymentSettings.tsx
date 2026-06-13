import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { getBankAccount, savePaymentAccount } from "../../features/streamer/streamerApi";

type PaymentMethod = {
    name: string;
    fee: string;
    accent: string;
    short: string;
    connected: boolean;
};

type BankAccountResponse = {
    id?: number;
    providerType?: string;
    providerCode?: string;
    accountNo?: string;
    accountName?: string;
    streamerId?: number;
    createdAt?: string | null;
};

const BANK_PAYMENT_METHOD = "Ngân hàng (QR Code)";

const paymentMethods: PaymentMethod[] = [
    {
        name: BANK_PAYMENT_METHOD,
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
    const user = useSelector((state: RootState) => state.auth.user);

    const [showBankModal, setShowBankModal] = useState(false);
    const [bank, setBank] = useState("MBBank");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState(user?.fullName || "");
    const [bankAccountLoading, setBankAccountLoading] = useState(false);

    const syncBankForm = (bankAccount?: BankAccountResponse | null) => {
        const providerCode = bankAccount?.providerCode;
        const nextBank = providerCode && banks.includes(providerCode) ? providerCode : "MBBank";

        setBank(nextBank);
        setAccountNumber(bankAccount?.accountNo || "");
        setAccountHolder(bankAccount?.accountName || user?.fullName || "");
    };

    const handleOpenBankModal = async () => {
        setShowBankModal(true);
        setBankAccountLoading(true);

        try {
            const response = await getBankAccount();
            syncBankForm(response?.data);
        } catch (error) {
            console.error(error);
            syncBankForm(null);
            alert("Không lấy được thông tin ngân hàng đã cài đặt");
        } finally {
            setBankAccountLoading(false);
        }
    };

    const handleSavePayment = async () => {
        try {
            const payload = {
                providerType: "BANK",
                providerCode: bank,
                accountNo: accountNumber,
                accountName: accountHolder,
                apiKey: "",
                secretKey: "",
                qrTemplate: "",
            };

            const response = await savePaymentAccount(payload);

            console.log(response.data);
            alert("Lưu tài khoản thành công");
            setShowBankModal(false);
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra");
        }
    };

    useEffect(() => {
        if (!showBankModal) {
            setAccountHolder(user?.fullName || "");
        }
    }, [showBankModal, user?.fullName]);

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
                                        if (method.name === BANK_PAYMENT_METHOD) {
                                            handleOpenBankModal();
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

                    <button type="button" className="payment-add-card" onClick={handleOpenBankModal}>
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
                            <select
                                value={bank}
                                onChange={(e) => setBank(e.target.value)}
                                disabled={bankAccountLoading}
                            >
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
                                disabled={bankAccountLoading}
                                placeholder="Nhập số tài khoản"
                            />
                        </div>

                        <div className="form-group">
                            <label>Chủ tài khoản</label>
                            <input
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                                disabled={bankAccountLoading}
                                placeholder="Tên chủ tài khoản"
                            />
                        </div>

                        <button
                            type="button"
                            className="payment-modal-update-btn"
                            onClick={handleSavePayment}
                            disabled={bankAccountLoading}
                        >
                            {bankAccountLoading ? "Đang tải..." : "Cập nhật"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentSettings;
