import React, { useMemo, useState } from "react";
import QRWidget from "./QRWidget";

export type QrPaymentWizardResult = {
    qrUrl?: string;
    amount?: number;
    [key: string]: any;
};

type QrPaymentWizardProps<TPayment extends QrPaymentWizardResult> = {
    amountLabel: string;
    amountPlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    onSubmit: (payload: {
        amount: number;
        message: string;
        paymentMethod: string;
    }) => Promise<TPayment>;
    paymentMethods?: string[];
    initialPaymentMethod?: string;
    quickAmounts?: number[];
    feeRate?: number;
    messageLabel?: string;
    messagePlaceholder?: string;
    amountSummaryLabel?: string;
    feeSummaryLabel?: string;
    totalSummaryLabel?: string;
    token?: string;
    note?: React.ReactNode;
    onPaymentCreated?: (payment: TPayment) => void;
    renderStep2Footer?: (
        payment: TPayment,
        helpers: {
            busy: boolean;
            setBusy: React.Dispatch<React.SetStateAction<boolean>>;
            setError: React.Dispatch<React.SetStateAction<string>>;
        }
    ) => React.ReactNode;
};

const defaultQuickAmounts = [50000, 100000, 200000, 300000, 400000];

function QrPaymentWizard<TPayment extends QrPaymentWizardResult>({
    amountLabel,
    amountPlaceholder,
    submitLabel,
    submittingLabel,
    onSubmit,
    paymentMethods = ["Chuyển khoản ngân hàng"],
    initialPaymentMethod,
    quickAmounts = defaultQuickAmounts,
    feeRate = 0,
    messageLabel,
    messagePlaceholder,
    amountSummaryLabel = "Số tiền",
    feeSummaryLabel = "Phí giao dịch",
    totalSummaryLabel = "Thành tiền",
    token = "",
    note,
    onPaymentCreated,
    renderStep2Footer
}: QrPaymentWizardProps<TPayment>) {
    const [step, setStep] = useState<1 | 2>(1);
    const [paymentMethod, setPaymentMethod] = useState(
        initialPaymentMethod || paymentMethods[0] || "Chuyển khoản ngân hàng"
    );
    const [amountInput, setAmountInput] = useState("");
    const [message, setMessage] = useState("");
    const [payment, setPayment] = useState<TPayment | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const amountValue = Number(amountInput);
    const feeValue = amountValue > 0 ? Math.round(amountValue * feeRate) : 0;
    const totalValue = amountValue > 0 ? amountValue + feeValue : 0;
    const showMethodSelect = paymentMethods.length > 1;

    const formattedSummary = useMemo(
        () => ({
            amount: amountValue ? `${amountValue.toLocaleString("vi-VN")}đ` : "0đ",
            fee: feeValue ? `${feeValue.toLocaleString("vi-VN")}đ` : "0đ",
            total: totalValue ? `${totalValue.toLocaleString("vi-VN")}đ` : "0đ"
        }),
        [amountValue, feeValue, totalValue]
    );

    const handleContinue = async () => {
        if (!amountValue || amountValue <= 0) {
            setError("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        try {
            setBusy(true);
            setError("");

            const result = await onSubmit({
                amount: amountValue,
                message,
                paymentMethod
            });

            setPayment(result);
            setStep(2);
            onPaymentCreated?.(result);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || "Không tạo được mã QR.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            {step === 1 ? (
                <>
                    {showMethodSelect && (
                        <div className="wallet-modal-section">
                            <span>Phương thức thanh toán</span>

                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                {paymentMethods.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="wallet-modal-section">
                        <span>{amountLabel}</span>

                        <input
                            type="number"
                            min="1000"
                            value={amountInput}
                            onChange={(e) => {
                                setAmountInput(e.target.value);
                                setError("");
                            }}
                            placeholder={amountPlaceholder}
                        />

                        <div className="wallet-modal-quick">
                            {quickAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => {
                                        setAmountInput(amount.toString());
                                        setError("");
                                    }}
                                >
                                    {amount / 1000}K
                                </button>
                            ))}
                        </div>
                    </div>

                    {messageLabel && (
                        <div className="wallet-modal-section">
                            <span>{messageLabel}</span>

                            <input
                                type="text"
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    setError("");
                                }}
                                placeholder={messagePlaceholder || ""}
                            />
                        </div>
                    )}

                    <div className="wallet-modal-summary">
                        <div>
                            <span>{amountSummaryLabel}</span>
                            <strong>{formattedSummary.amount}</strong>
                        </div>

                        <div>
                            <span>{feeSummaryLabel}</span>
                            <strong>{formattedSummary.fee}</strong>
                        </div>

                        <div className="wallet-modal-total">
                            <span>{totalSummaryLabel}</span>
                            <strong>{formattedSummary.total}</strong>
                        </div>
                    </div>

                    <button
                        className="wallet-modal-submit"
                        type="button"
                        onClick={handleContinue}
                        disabled={busy}
                    >
                        {busy ? submittingLabel : submitLabel}
                    </button>
                </>
            ) : (
                <div className="wallet-modal-step2">
                    <button
                        type="button"
                        className="wallet-modal-back"
                        onClick={() => setStep(1)}
                    >
                        ← Quay lại
                    </button>

                    <div className="wallet-modal-summary wallet-modal-summary--step2">
                        <div>
                            <span>{amountSummaryLabel}</span>
                            <strong>{formattedSummary.amount}</strong>
                        </div>

                        <div>
                            <span>{feeSummaryLabel}</span>
                            <strong>{formattedSummary.fee}</strong>
                        </div>

                        <div className="wallet-modal-total">
                            <span>{totalSummaryLabel}</span>
                            <strong>{formattedSummary.total}</strong>
                        </div>
                    </div>

                    <div className="wallet-modal-qr-box">
                        {payment?.qrUrl ? (
                            <QRWidget qrUrl={payment.qrUrl} token={token} />
                        ) : (
                            <div className="wallet-modal-qr-placeholder">
                                Chưa có mã QR để hiển thị
                            </div>
                        )}
                    </div>

                    {renderStep2Footer?.(payment as TPayment, {
                        busy,
                        setBusy,
                        setError
                    })}

                    {note && <div className="wallet-modal-note">{note}</div>}
                </div>
            )}

            {error && <p className="wallet-message">{error}</p>}
        </>
    );
}

export default QrPaymentWizard;
