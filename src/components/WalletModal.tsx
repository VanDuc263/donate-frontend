import { useState } from "react";
import QRWidget from "./QRWidget";
import { generateQr } from "../features/payment/paymentApi";

interface WalletModalProps {
    open: boolean;
    onClose: () => void;
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
    const [walletStep, setWalletStep] = useState<1 | 2>(1);
    const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản ngân hàng");

    const [depositAmount, setDepositAmount] = useState("");
    const [depositMessage, setDepositMessage] = useState("");

    const [qrData, setQrData] = useState<{
        qrUrl: string;
        amount: number;
        content: string;
    } | null>(null);

    const [qrLoading, setQrLoading] = useState(false);

    const depositValue = Number(depositAmount);

    const depositFee =
        depositValue > 0 ? Math.round(depositValue * 0.01) : 0;

    const depositTotal =
        depositValue > 0 ? depositValue + depositFee : 0;

    if (!open) return null;

    const resetWalletModal = () => {
        setWalletStep(1);
        setDepositAmount("");
        setDepositMessage("");
        setPaymentMethod("Chuyển khoản ngân hàng");
        setQrData(null);
        onClose();
    };

    const handleContinue = async () => {
        const amount = Number(depositAmount);

        if (!amount || amount <= 0) {
            setDepositMessage("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        try {
            setQrLoading(true);

            const res = await generateQr({
                methodId: 1,
                amount,
            });

            setQrData(res.data);

            setWalletStep(2);
            setDepositMessage("");
        } catch (err) {
            console.error(err);
            setDepositMessage("Không tạo được mã QR");
        } finally {
            setQrLoading(false);
        }
    };

    return (
        <div
            className="wallet-modal-backdrop"
            onClick={resetWalletModal}
        >
            <div
                className="wallet-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="wallet-modal-header">
                    <div>
                        <h3>Nạp tiền vào ví</h3>

                        <p>
                            {walletStep === 1
                                ? "Chọn phương thức và số tiền nạp."
                                : "Quét mã QR để hoàn tất thanh toán."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="wallet-modal-close"
                        onClick={resetWalletModal}
                    >
                        ✕
                    </button>
                </div>

                {walletStep === 1 ? (
                    <>
                        <div className="wallet-modal-section">
                            <span>Phương thức thanh toán</span>

                            <select
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            >
                                <option>
                                    Chuyển khoản ngân hàng
                                </option>

                                <option>Ví Momo</option>

                                <option>QR Pay</option>
                            </select>
                        </div>

                        <div className="wallet-modal-section">
                            <span>Số tiền nạp</span>

                            <input
                                type="number"
                                min="1000"
                                value={depositAmount}
                                onChange={(e) => {
                                    setDepositAmount(e.target.value);
                                    setDepositMessage("");
                                }}
                                placeholder="Nhập số tiền bạn muốn nạp"
                            />

                            <div className="wallet-modal-quick">
                                {[50000, 100000, 200000, 300000, 400000].map(
                                    (amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => {
                                                setDepositAmount(
                                                    amount.toString()
                                                );

                                                setDepositMessage("");
                                            }}
                                        >
                                            {amount / 1000}K
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="wallet-modal-summary">
                            <div>
                                <span>Tiền nạp</span>

                                <strong>
                                    {depositValue
                                        ? depositValue.toLocaleString(
                                        "vi-VN"
                                    ) + "đ"
                                        : "0đ"}
                                </strong>
                            </div>

                            <div>
                                <span>Phí giao dịch</span>

                                <strong>
                                    {depositValue
                                        ? depositFee.toLocaleString(
                                        "vi-VN"
                                    ) + "đ"
                                        : "0đ"}
                                </strong>
                            </div>

                            <div className="wallet-modal-total">
                                <span>Thành tiền</span>

                                <strong>
                                    {depositValue
                                        ? depositTotal.toLocaleString(
                                        "vi-VN"
                                    ) + "đ"
                                        : "0đ"}
                                </strong>
                            </div>
                        </div>

                        <button
                            className="wallet-modal-submit"
                            type="button"
                            onClick={handleContinue}
                            disabled={qrLoading}
                        >
                            {qrLoading
                                ? "ĐANG TẠO QR..."
                                : "TIẾP TỤC"}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="wallet-modal-step2">
                            <button
                                type="button"
                                className="wallet-modal-back"
                                onClick={() => setWalletStep(1)}
                            >
                                ← Quay lại
                            </button>

                            <div className="wallet-modal-summary wallet-modal-summary--step2">
                                <div>
                                    <span>Tiền nạp</span>

                                    <strong>
                                        {depositValue.toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ
                                    </strong>
                                </div>

                                <div>
                                    <span>Phí giao dịch</span>

                                    <strong>
                                        {depositFee.toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ
                                    </strong>
                                </div>

                                <div className="wallet-modal-total">
                                    <span>Thành tiền</span>

                                    <strong>
                                        {depositTotal.toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ
                                    </strong>
                                </div>
                            </div>

                            <div className="wallet-modal-qr-box">
                                {qrData?.qrUrl && (
                                    <QRWidget
                                        qrUrl={qrData.qrUrl}
                                        token=""
                                    />
                                )}

                                <button
                                    type="button"
                                    className="wallet-modal-qr-download"
                                >
                                    TẢI MÃ QR
                                </button>
                            </div>

                            <div className="wallet-modal-note">
                                <p>
                                    Mã thanh toán sẽ hết hạn sau{" "}
                                    <strong>1792 giây</strong>.
                                </p>

                                <ol>
                                    <li>
                                        Đăng nhập ứng dụng Mobile Banking
                                        hoặc ví điện tử.
                                    </li>

                                    <li>
                                        Chọn chức năng QR Pay và quét mã
                                        QR.
                                    </li>

                                    <li>
                                        Xác nhận thanh toán và hoàn tất
                                        giao dịch.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </>
                )}

                {depositMessage && (
                    <p className="wallet-message">
                        {depositMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default WalletModal;