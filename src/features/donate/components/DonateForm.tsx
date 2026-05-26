import React, { useEffect, useState } from "react";
import "../../../styles/donate_form.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { getPaymentStatus, transactionSyncTest } from "../../../services/paymentApi";
import QRWidget from "../../../components/QRWidget";
import WalletModal from "../../../components/WalletModal";
import { createPaymentQr, donateByWallet } from "../donateApi";
import { setWallet } from "../../wallet/walletSlice";

type DonateModalProps = {
    onClose: () => void;
};

type TabType = "wallet" | "bank" | "qr";

type PaymentInfo = {
    orderCode: string;
    bankCode: string;
    accountNo: string;
    accountName: string;
    amount: number;
    addInfo: string;
    qrUrl: string;
    status: string;
};

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
                        Ví
                    </button>
                    <button
                        className={tab === "bank" ? "active" : ""}
                        onClick={() => setTab("bank")}
                    >
                        Ngân hàng
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
                setError("Không tìm thấy streamer.");
                return;
            }

            if (!amount || amount <= 0) {
                setError("Vui lòng nhập số tiền hợp lệ.");
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
            setError(err?.response?.data?.message || "Không tạo được lệnh thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div>
                <p>Số dư</p>
                <h3>{wallet?.balance}</h3>
                <button onClick={() => setWalletOpen(true)}>Nạp</button>
            </div>

            <div>
                <input
                    type="number"
                    placeholder="Số tiền"
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />

                <input
                    placeholder="Lời nhắn"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button onClick={handleCreateDonationByWallet} disabled={loading}>
                    {loading ? "Đang tạo..." : "Tạo donate"}
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

    useEffect(() => {
        if (!paymentInfo?.orderCode) return;

        const interval = setInterval(async () => {
            try {
                const res = await getPaymentStatus(paymentInfo.orderCode);
                const data = res.data;

                setPaymentStatus(data.status);

                if (data.status === "PAID" && data.donationCreated) {
                    clearInterval(interval);
                    alert("Thanh toán thành công!");
                    onClose();
                }
            } catch (err) {
                console.error("Lỗi check payment status:", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [paymentInfo, onClose]);

    const handleCreatePayment = async () => {
        try {
            setError("");

            if (!streamer?.streamerId) {
                setError("Không tìm thấy streamer.");
                return;
            }

            if (!amount || amount <= 0) {
                setError("Vui lòng nhập số tiền hợp lệ.");
                return;
            }

            setLoading(true);

            const res = await createPaymentQr({
                streamerId: streamer.streamerId,
                donorId: user?.userId ?? null,
                donorName: user?.fullName || user?.username || "Anonymous",
                amount: Number(amount),
                message
            });

            setPaymentInfo(res.data);
            setPaymentStatus(res.data.status);
        } catch (err: any) {
            console.error("Lỗi tạo payment:", err);
            setError(err?.response?.data?.message || "Không tạo được lệnh thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    const handleSandboxPay = async () => {
        if (!paymentInfo) {
            setError("Không tìm thấy thông tin thanh toán.");
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
                alert("Thanh toán thành công!");
                onClose();
                return;
            }

            setError("Đã gọi test thanh toán nhưng trạng thái chưa đổi.");
        } catch (err: any) {
            console.error("Lỗi test thanh toán:", err);
            setError(err?.response?.data?.message || "Không thể giả lập thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {!streamer?.qrUrl ? (
                <div>
                    <p>Streamer chưa cấu hình tài khoản ngân hàng để tạo QR code.</p>
                </div>
            ) : !paymentInfo ? (
                <div>
                    <input
                        type="number"
                        placeholder="Số tiền"
                        value={amount || ""}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />

                    <input
                        placeholder="Lời nhắn"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={handleCreatePayment} disabled={loading}>
                        {loading ? "Đang tạo..." : "Tạo thanh toán ngân hàng"}
                    </button>
                </div>
            ) : (
                <div>
                    {paymentInfo.qrUrl && streamer?.token ? (
                        <QRWidget qrUrl={paymentInfo.qrUrl} token={streamer.token} />
                    ) : (
                        <div>
                            <p>Chưa có ảnh QR thật. Dùng thông tin dưới để test.</p>
                        </div>
                    )}

                    <div>
                        {paymentStatus && <p>Trạng thái: {paymentStatus}</p>}
                        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                            <button onClick={handleSandboxPay} disabled={loading}>
                                {loading ? "Đang xử lý..." : "Test thanh toán"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
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

    useEffect(() => {
        if (!paymentInfo?.orderCode) return;

        const interval = setInterval(async () => {
            try {
                const res = await getPaymentStatus(paymentInfo.orderCode);
                const data = res.data;

                setPaymentStatus(data.status);

                if (data.status === "PAID" && data.donationCreated) {
                    clearInterval(interval);
                    alert("Thanh toán thành công!");
                    onClose();
                }
            } catch (err) {
                console.error("Lỗi check payment status:", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [paymentInfo, onClose]);

    const handleCreateQrDonate = async () => {
        try {
            setError("");

            if (!streamer?.streamerId) {
                setError("Không tìm thấy streamer.");
                return;
            }

            if (!amount || amount <= 0) {
                setError("Vui lòng nhập số tiền hợp lệ.");
                return;
            }

            setLoading(true);

            const res = await createPaymentQr({
                streamerId: streamer.streamerId,
                donorId: user?.userId ?? null,
                donorName: user?.fullName || user?.username || "Anonymous",
                amount: Number(amount),
                message
            });

            setPaymentInfo(res.data);
            setPaymentStatus(res.data.status);
        } catch (err: any) {
            console.error("Lỗi tạo QR donate:", err);
            setError(err?.response?.data?.message || "Không tạo được mã QR donate.");
        } finally {
            setLoading(false);
        }
    };

    const handleSandboxPay = async () => {
        if (!paymentInfo) {
            setError("Không tìm thấy thông tin thanh toán.");
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
                alert("Thanh toán thành công!");
                onClose();
                return;
            }

            setError("Đã gọi test thanh toán nhưng trạng thái chưa đổi.");
        } catch (err: any) {
            console.error("Lỗi test thanh toán:", err);
            setError(err?.response?.data?.message || "Không thể giả lập thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="qr-donate-simple">
            {!paymentInfo ? (
                <div className="qr-donate-simple-form">
                    <p className="qr-donate-simple-note">
                        Donate qua QR sẽ chuyển trực tiếp tới ví của tài khoản {" "}
                        <strong>{streamer?.displayName || "streamer"}</strong>.
                    </p>

                    <input
                        type="number"
                        placeholder="Số tiền"
                        value={amount || ""}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />

                    <input
                        placeholder="Lời nhắn"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={handleCreateQrDonate} disabled={loading}>
                        {loading ? "Đang tạo..." : "Tạo QR donate"}
                    </button>
                </div>
            ) : (
                <div className="qr-donate-simple-result">
                    {paymentInfo.qrUrl && streamer?.token ? (
                        <QRWidget qrUrl={paymentInfo.qrUrl} token={streamer.token} />
                    ) : (
                        <div>
                            <p>Chưa có ảnh QR thật. Dùng thông tin dưới để test.</p>
                        </div>
                    )}

                    <div className="qr-donate-simple-meta">
                        <p>Streamer nhận: {streamer?.displayName || "Streamer"}</p>
                        <p>Số tiền: {paymentInfo.amount?.toLocaleString("vi-VN")}đ</p>
                        <p>Trạng thái: {paymentStatus || paymentInfo.status}</p>
                        {paymentInfo.addInfo && <p>Nội dung: {paymentInfo.addInfo}</p>}
                    </div>

                    {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        <button onClick={handleSandboxPay} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Test thanh toán"}
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
                            Tạo lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
