import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { getBankAccount, savePaymentAccount } from "../../features/streamer/streamerApi";

type PaymentMethodStatus = "connected" | "disconnected" | "updating";

type PaymentMethod = {
    name: string;
    fee: string;
    accent: string;
    short: string;
    provider: "BANK" | "MOMO" | "PAYPAL" | "BNB";
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
const SEPAY_GUIDE_ROUTE = "/account/payment/sepay-guide";

const paymentMethods: PaymentMethod[] = [
    {
        name: BANK_PAYMENT_METHOD,
        fee: "Phí 0%",
        accent: "#f59e0b",
        short: "QR",
        provider: "BANK",
    },
    {
        name: "Ví điện tử MoMo",
        fee: "Đang cập nhật",
        accent: "#db2777",
        short: "Mo",
        provider: "MOMO",
    },
    {
        name: "PayPal",
        fee: "Đang cập nhật",
        accent: "#0ea5e9",
        short: "P",
        provider: "PAYPAL",
    },
    {
        name: "Tiền điện tử BNB",
        fee: "Đang cập nhật",
        accent: "#fbbf24",
        short: "BNB",
        provider: "BNB",
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

const hasConfiguredBankAccount = (bankAccount?: BankAccountResponse | null) =>
    Boolean(bankAccount?.id || bankAccount?.accountNo || bankAccount?.accountName);

const PaymentSettings = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    const [showBankModal, setShowBankModal] = useState(false);
    const [bank, setBank] = useState("MBBank");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState(user?.fullName || "");
    const [bankAccountLoading, setBankAccountLoading] = useState(false);
    const [bankConfigured, setBankConfigured] = useState(false);

    const syncBankForm = useCallback((bankAccount?: BankAccountResponse | null) => {
        const providerCode = bankAccount?.providerCode;
        const nextBank = providerCode && banks.includes(providerCode) ? providerCode : "MBBank";

        setBank(nextBank);
        setAccountNumber(bankAccount?.accountNo || "");
        setAccountHolder(bankAccount?.accountName || user?.fullName || "");
        setBankConfigured(hasConfiguredBankAccount(bankAccount));
    }, [user?.fullName]);

    const loadBankAccount = useCallback(async (showErrorAlert: boolean) => {
        setBankAccountLoading(true);

        try {
            const response = await getBankAccount();
            syncBankForm(response?.data);
        } catch (error) {
            console.error(error);
            syncBankForm(null);

            if (showErrorAlert) {
                alert("Không lấy được thông tin ngân hàng đã cài đặt");
            }
        } finally {
            setBankAccountLoading(false);
        }
    }, [syncBankForm]);

    const handleOpenBankModal = async () => {
        setShowBankModal(true);
        await loadBankAccount(true);
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

            await savePaymentAccount(payload);
            alert("Lưu tài khoản thành công");
            setBankConfigured(true);
            setShowBankModal(false);
            await loadBankAccount(false);
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

    useEffect(() => {
        loadBankAccount(false);
    }, [loadBankAccount]);

    const getMethodStatus = (method: PaymentMethod): PaymentMethodStatus => {
        if (method.provider !== "BANK") {
            return "updating";
        }

        return bankConfigured ? "connected" : "disconnected";
    };

    const renderStatusLabel = (status: PaymentMethodStatus) => {
        if (status === "connected") {
            return "Đã kết nối";
        }

        if (status === "disconnected") {
            return "Chưa kết nối";
        }

        return "Đang cập nhật";
    };

    return (
        <div className="profile-content">
            <div className="profile-card payment-card">
                <div className="payment-hero">
                    <div>
                        <h2>Cài Đặt Thanh Toán</h2>
                        <p>Quản lý các kênh thanh toán của bạn</p>
                    </div>
                </div>



                <div className="payment-section-title">Các phương thức thanh toán</div>
                <div className="payment-grid">
                    {paymentMethods.map((method) => {
                        const status = getMethodStatus(method);
                        const isBankMethod = method.provider === "BANK";

                        return (
                            <article
                                key={method.name}
                                className={`payment-method-card ${isBankMethod ? "" : "payment-method-card-disabled"}`.trim()}
                            >
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

                                <div className={`payment-status ${status}`}>
                                    {renderStatusLabel(status)}
                                </div>

                                <div className="payment-actions">
                                    <button
                                        type="button"
                                        className="payment-edit-btn"
                                        onClick={isBankMethod ? handleOpenBankModal : undefined}
                                        disabled={!isBankMethod}
                                    >
                                        {isBankMethod ? "Cấu hình" : "Đang cập nhật"}
                                    </button>
                                    <button
                                        type="button"
                                        className="payment-icon-btn"
                                        aria-label={isBankMethod ? "Xóa" : "Đang cập nhật"}
                                        disabled={!isBankMethod}
                                    >
                                        ×
                                    </button>
                                </div>
                            </article>
                        );
                    })}

                    <button type="button" className="payment-add-card" onClick={handleOpenBankModal}>
                        {bankConfigured ? "Cập nhật ngân hàng QR" : "Thêm ngân hàng QR"}
                    </button>
                </div>
            </div>

            {showBankModal && (
                <div className="payment-modal-backdrop" onClick={() => setShowBankModal(false)}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <div>
                                <h3>Cập nhật tài khoản thanh toán</h3>
                                <p>Hệ thống hiện chỉ hỗ trợ tài khoản ngân hàng QR qua SePay.</p>
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
                            <div className="payment-label-row">
                                <label>Cổng thanh toán</label>
                                <Link
                                    to={SEPAY_GUIDE_ROUTE}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="payment-guide-link"
                                >
                                    Xem hướng dẫn cài đặt SePay
                                </Link>
                            </div>
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
