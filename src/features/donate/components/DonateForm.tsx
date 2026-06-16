import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../../styles/donate_form.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { getPaymentStatus, transactionSyncTest } from "../../../services/paymentApi";
import QRWidget from "../../../components/QRWidget";
import WalletModal from "../../../components/WalletModal";
import { createPaymentBankQr, createPaymentQr, donateByWallet } from "../donateApi";
import { setWallet } from "../../wallet/walletSlice";
import { subscribePayment } from "../../../services/socket";

type DonateModalProps = {
    onClose: () => void;
};

type TabType = "wallet" | "bank" | "qr";

type PaymentInfo = {
    donationId: number;
    orderCode: string;
    bankCode: string;
    accountNo: string;
    accountName: string;
    amount: number;
    addInfo: string;
    qrUrl: string;
    status: string;
};

type PaymentSuccessPopupProps = {
    open: boolean;
    amount?: number;
    streamerName?: string;
    onClose: () => void;
};


function PaymentSuccessPopup({
    open,
    amount,
    streamerName,
    onClose
}: PaymentSuccessPopupProps) {
    if (!open) return null;

    return (
        <div className="payment-success-overlay">
            <div className="payment-success-popup" role="alertdialog" aria-modal="true">
                <div className="payment-success-icon">✓</div>
                <h3>Donate thành công</h3>
                <p>
                    {amount ? `${amount.toLocaleString("vi-VN")}d` : "Khoan donate"} đã được gửi
                    {streamerName ? ` tới ${streamerName}` : ""}.
                </p>
                <button type="button" onClick={onClose}>
                    Đóng
                </button>
            </div>
        </div>
    );
}

export default function DonateModal({ onClose }: DonateModalProps) {
    const [tab, setTab] = useState<TabType>("wallet");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Donate</h2>
                    <button onClick={onClose}>X</button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={tab === "wallet" ? "active" : ""}
                        onClick={() => setTab("wallet")}
                    >
                        Vi
                    </button>
                    <button
                        className={tab === "bank" ? "active" : ""}
                        onClick={() => setTab("bank")}
                    >
                        Ngan hang
                    </button>
                    <button
                        className={tab === "qr" ? "active" : ""}
                        onClick={() => setTab("qr")}
                    >
                        QR
                    </button>
                </div>

                <div className="modal-content">
                    {tab === "wallet" && <WalletTab onClose={onClose} />}
                    {tab === "bank" && <BankTab onClose={onClose} />}
                    {tab === "qr" && <QrDonateTab onClose={onClose} />}
                </div>
            </div>
        </div>
    );
}

function WalletTab({ onClose }: { onClose: () => void }) {
    const user = useSelector((state: RootState) => state.auth.user);
    const streamer = useSelector((state: RootState) => state.streamer.streamerDetail);
    const { wallet } = useSelector((state: RootState) => state.wallet);
    const [amount, setAmount] = useState<number>(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [walletOpen, setWalletOpen] = useState(false);

    const dispatch = useDispatch<AppDispatch>();

    const handleCreateDonationByWallet = async () => {
        try {
            setError("");

            if (!streamer?.streamerId) {
                setError("Khong tim thay streamer.");
                return;
            }

            if (!amount || amount <= 0) {
                setError("Vui long nhap so tien hop le.");
                return;
            }

            setLoading(true);

            const res = await donateByWallet({
                streamerId: streamer.streamerId,
                donorId: user?.userId ?? null,
                donorName: user?.fullName || user?.username || "Anonymous",
                amount: Number(amount),
                message
            });

            dispatch(setWallet(res?.data?.walletResponse));
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Khong tao duoc lenh thanh toan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div>
                <p>So du</p>
                <h3>{wallet?.balance}</h3>
                <button onClick={() => setWalletOpen(true)}>Nap</button>
            </div>

            <div>
                <input
                    type="number"
                    placeholder="So tien"
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />

                <input
                    placeholder="Loi nhan"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button onClick={handleCreateDonationByWallet} disabled={loading}>
                    {loading ? "Dang tao..." : "Tao donate"}
                </button>
            </div>

            <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
        </div>
    );
}

function BankTab({ onClose }: { onClose: () => void }) {
    const user = useSelector((state: RootState) => state.auth.user);
    const streamer = useSelector((state: RootState) => state.streamer.streamerDetail);
    const [amount, setAmount] = useState<number>(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string>("");
    const [error, setError] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const closeTimerRef = useRef<number | null>(null);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };


    const handlePaymentSuccess = useCallback((status?: string) => {
        setPaymentStatus(status || "SUCCESS");
        setShowSuccessPopup(true);
        clearCloseTimer();
        closeTimerRef.current = window.setTimeout(() => {
            setShowSuccessPopup(false);
            onClose();
        }, 2200);
    }, [onClose]);

    useEffect(() => {
        return () => {
            clearCloseTimer();
        };
    }, []);

    useEffect(() => {
        if (!paymentInfo?.donationId) return;

        const unsubscribe = subscribePayment(paymentInfo.donationId, (data) => {
            handlePaymentSuccess(data.status);
        });

        return () => {
            unsubscribe();
        };
    }, [handlePaymentSuccess, paymentInfo?.donationId]);

    const handleCreatePayment = async () => {
        try {
            setError("");

            if (!streamer?.streamerId) {
                setError("Khong tim thay streamer.");
                return;
            }

            if (!amount || amount <= 0) {
                setError("Vui long nhap so tien hop le.");
                return;
            }

            setLoading(true);

            const res = await createPaymentBankQr({
                streamerId: streamer.streamerId,
                donorId: user?.userId ?? null,
                donorName: user?.fullName || user?.username || "Anonymous",
                amount: Number(amount),
                message
            });

            setPaymentInfo(res.data);
            setPaymentStatus(res.data.status);
        } catch (err: any) {
            console.error("Loi tao payment:", err);
            setError(err?.response?.data?.message || "Khong tao duoc lenh thanh toan.");
        } finally {
            setLoading(false);
        }
    };

    const handleSandboxPay = async () => {
        if (!paymentInfo) {
            setError("Khong tim thay thong tin thanh toan.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await transactionSyncTest({
                content: paymentInfo.addInfo,
                amount: paymentInfo.amount
            });

            const res = await getPaymentStatus(paymentInfo.orderCode);
            setPaymentStatus(res.data.status);

            if (res.data.status === "PAID" && res.data.donationCreated) {
                handlePaymentSuccess(res.data.status);
                return;
            }

            setError("Da goi test thanh toan nhung trang thai chua doi.");
        } catch (err: any) {
            console.error("Loi test thanh toan:", err);
            setError(err?.response?.data?.message || "Khong the gia lap thanh toan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                {!streamer?.qrUrl ? (
                    <div>
                        <p>Streamer chua cau hinh tai khoan ngan hang de tao QR code.</p>
                    </div>
                ) : !paymentInfo ? (
                    <div>
                        <input
                            type="number"
                            placeholder="So tien"
                            value={amount || ""}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />

                        <input
                            placeholder="Loi nhan"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        {error && <p style={{ color: "red" }}>{error}</p>}

                        <button onClick={handleCreatePayment} disabled={loading}>
                            {loading ? "Dang tao..." : "Tao thanh toan ngan hang"}
                        </button>
                    </div>
                ) : (
                    <div>
                        {paymentInfo.qrUrl && streamer?.token ? (
                            <QRWidget qrUrl={paymentInfo.qrUrl} token={streamer.token} />
                        ) : (
                            <div>
                                <p>Chua co anh QR that. Dung thong tin duoi de test.</p>
                            </div>
                        )}

                        <div>
                            {paymentStatus && <p>Trang thai: {paymentStatus}</p>}
                            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                                <button onClick={handleSandboxPay} disabled={loading}>
                                    {loading ? "Dang xu ly..." : "Test thanh toan"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <PaymentSuccessPopup
                open={showSuccessPopup}
                amount={paymentInfo?.amount}
                streamerName={streamer?.displayName}
                onClose={() => {
                    clearCloseTimer();
                    setShowSuccessPopup(false);
                    onClose();
                }}
            />
        </>
    );
}

function QrDonateTab({ onClose }: { onClose: () => void }) {
    const user = useSelector((state: RootState) => state.auth.user);
    const streamer = useSelector((state: RootState) => state.streamer.streamerDetail);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const closeTimerRef = useRef<number | null>(null);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const handlePaymentSuccess = useCallback((status?: string) => {
        setPaymentStatus(status || "SUCCESS");
        setShowSuccessPopup(true);
        clearCloseTimer();

    }, [onClose]);

    useEffect(() => {
        return () => {
            clearCloseTimer();
        };
    }, []);

    useEffect(() => {
        if (!paymentInfo?.donationId) return;

        const unsubscribe = subscribePayment(paymentInfo.donationId, (data) => {
            handlePaymentSuccess(data.status);
        });

        return () => {
            unsubscribe();
        };
    }, [handlePaymentSuccess, paymentInfo?.donationId]);

    const handleCreateQrDonate = async () => {
        try {
            setError("");

            if (!streamer?.streamerId) {
                setError("Khong tim thay streamer.");
                return;
            }

            if (!amount || amount <= 0) {
                setError("Vui long nhap so tien hop le.");
                return;
            }

            setLoading(true);

            const res = await createPaymentQr({
                streamerId: streamer.streamerId,
                donorId: user?.userId ?? null,
                donorName: user?.fullName || user?.username || "An danh",
                amount: Number(amount),
                message,
                methodId: 1
            });

            setPaymentInfo(res.data);
            setPaymentStatus(res.data.status);
        } catch (err: any) {
            console.error("Loi tao QR donate:", err);
            setError(err?.response?.data?.message || "Khong tao duoc ma QR donate.");
        } finally {
            setLoading(false);
        }
    };

    const handleSandboxPay = async () => {
        if (!paymentInfo) {
            setError("Khong tim thay thong tin thanh toan.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await transactionSyncTest({
                content: paymentInfo.addInfo,
                amount: paymentInfo.amount
            });

            const res = await getPaymentStatus(paymentInfo.orderCode);
            setPaymentStatus(res.data.status);

            if (res.data.status === "PAID" && res.data.donationCreated) {
                handlePaymentSuccess(res.data.status);
                return;
            }

            setError("Da goi test thanh toan nhung trang thai chua doi.");
        } catch (err: any) {
            console.error("Loi test thanh toan:", err);
            setError(err?.response?.data?.message || "Khong the gia lap thanh toan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="qr-donate-simple">
                {!paymentInfo ? (
                    <div className="qr-donate-simple-form">
                        <p className="qr-donate-simple-note">
                            Donate qua QR se chuyen truc tiep toi vi cua tai khoan{" "}
                            <strong>{streamer?.displayName || "streamer"}</strong>.
                        </p>

                        <input
                            type="number"
                            placeholder="So tien"
                            value={amount || ""}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />

                        <input
                            placeholder="Loi nhan"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        {error && <p style={{ color: "red" }}>{error}</p>}

                        <button onClick={handleCreateQrDonate} disabled={loading}>
                            {loading ? "Dang tao..." : "Tao QR donate"}
                        </button>
                    </div>
                ) : (
                    <div className="qr-donate-simple-result">
                        {paymentInfo.qrUrl && streamer?.token ? (
                            <QRWidget qrUrl={paymentInfo.qrUrl} token={streamer.token} />
                        ) : (
                            <div>
                                <p>Chua co anh QR that. Dung thong tin duoi de test.</p>
                            </div>
                        )}

                        <div className="qr-donate-simple-meta">
                            <p>Streamer nhan: {streamer?.displayName || "Streamer"}</p>
                            <p>So tien: {paymentInfo.amount?.toLocaleString("vi-VN")}d</p>
                            <p>Trang thai: {paymentStatus || paymentInfo.status}</p>
                            {paymentInfo.addInfo && <p>Noi dung: {paymentInfo.addInfo}</p>}
                        </div>

                        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                            <button onClick={handleSandboxPay} disabled={loading}>
                                {loading ? "Dang xu ly..." : "Test thanh toan"}
                            </button>
                            <button
                                type="button"
                                className="qr-donate-reset-btn"
                                onClick={() => {
                                    setPaymentInfo(null);
                                    setPaymentStatus("");
                                    setError("");
                                }}
                            >
                                Tao lai
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <PaymentSuccessPopup
                open={showSuccessPopup}
                amount={paymentInfo?.amount}
                streamerName={streamer?.displayName}
                onClose={() => {
                    clearCloseTimer();
                    setShowSuccessPopup(false);
                    onClose();
                }}
            />
        </>
    );
}
