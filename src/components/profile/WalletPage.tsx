import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import QRWidget from "../../components/QRWidget";
import { generateQr } from "../../features/payment/paymentApi";
import { createWithdrawal, getWalletTransactions } from "../../features/wallet/walletApi";
import { getMyWalletThunk } from "../../features/wallet/walletSlice";

type WalletAction = "deposit" | "withdraw";

type WalletHistoryItem = {
    id: number;
    type: WalletAction;
    title: string;
    amount: number;
    note: string;
    time: string;
};

type WalletTransactionType =
    | "DEPOSIT"
    | "WITHDRAW"
    | "DONATION_IN"
    | "DONATION_OUT"
    | "REFUND"
    | string;

type WalletTransactionResponseItem = {
    id: number;
    type: WalletTransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    fee: number;
    netAmount: number;
    referenceType: string | null;
    referenceId: number | null;
    status: string;
    createdAt: string;
    transactionCode: string | null;
    referenceCode: string | null;
};

type WalletTransactionsResponse = {
    content?: WalletTransactionResponseItem[];
};

type WalletQrPayment = {
    qrUrl?: string;
    amount?: number;
    [key: string]: any;
};

type WithdrawResponse = {
    transactionCode: string;
    amount: number;
    balance: number;
    frozenBalance: number;
    status: string;
    createdAt: string;
};

const quickWalletAmounts = [50000, 100000, 200000, 300000, 400000];
const walletPaymentMethods = [
    "Chuyển khoản ngân hàng",
    "Ví Momo",
    "QR Pay",
];

const formatMoney = (value?: number) => {
    if (value == null) return "0đ";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatNumberDisplay = (value?: number) => {
    if (value == null) return "0";

    return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));

const getWalletTransactionMeta = (type: WalletTransactionType) => {
    switch (type) {
        case "DEPOSIT":
            return {
                label: "Nạp ví",
                historyType: "deposit" as const,
            };
        case "DONATION_IN":
            return {
                label: "Nhận donate",
                historyType: "deposit" as const,
            };
        case "REFUND":
            return {
                label: "Hoàn tiền",
                historyType: "deposit" as const,
            };
        case "WITHDRAW":
            return {
                label: "Rút ví",
                historyType: "withdraw" as const,
            };
        case "DONATION_OUT":
            return {
                label: "Gửi donate",
                historyType: "withdraw" as const,
            };
        default:
            return {
                label: type,
                historyType: "deposit" as const,
            };
    }
};

const buildWalletTransactionNote = (item: WalletTransactionResponseItem) => {
    if (item.referenceCode) {
        return `Mã tham chiếu: ${item.referenceCode}`;
    }

    if (item.transactionCode) {
        return `Mã giao dịch: ${item.transactionCode}`;
    }

    if (item.status) {
        return `Trạng thái: ${item.status}`;
    }

    return "Giao dịch ví";
};

const WalletPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const wallet = useSelector((state: RootState) => state.wallet.wallet);
    const walletLoading = useSelector((state: RootState) => state.wallet.loading);

    const [walletTab, setWalletTab] = useState<WalletAction>("deposit");
    const [walletAmount, setWalletAmount] = useState("");
    const [walletNote, setWalletNote] = useState("");
    const [walletMessage, setWalletMessage] = useState("");
    const [walletHistory, setWalletHistory] = useState<WalletHistoryItem[]>([]);
    const [walletHistoryLoading, setWalletHistoryLoading] = useState(false);
    const [walletHistoryError, setWalletHistoryError] = useState("");
    const [depositMethod, setDepositMethod] = useState(walletPaymentMethods[0]);
    const [depositBusy, setDepositBusy] = useState(false);
    const [depositError, setDepositError] = useState("");
    const [depositPayment, setDepositPayment] = useState<WalletQrPayment | null>(null);
    const [withdrawBusy, setWithdrawBusy] = useState(false);

    const fetchWalletHistory = async () => {
        try {
            setWalletHistoryLoading(true);
            setWalletHistoryError("");

            const response = await getWalletTransactions();
            const data = response.data as WalletTransactionsResponse;
            const items = Array.isArray(data?.content) ? data.content : [];

            setWalletHistory(
                items.map((item) => {
                    const meta = getWalletTransactionMeta(item.type);

                    return {
                        id: item.id,
                        type: meta.historyType,
                        title: meta.label,
                        amount: item.netAmount ?? item.amount ?? 0,
                        note: buildWalletTransactionNote(item),
                        time: item.createdAt,
                    };
                })
            );
        } catch (error) {
            console.error(error);
            setWalletHistoryError("Không tải được lịch sử giao dịch.");
        } finally {
            setWalletHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (!wallet) {
            dispatch(getMyWalletThunk());
        }
    }, [dispatch, wallet]);

    useEffect(() => {
        void fetchWalletHistory();
    }, []);

    const balance = wallet?.balance ?? 0;
    const frozenBalance = wallet?.frozenBalance ?? 0;
    const amountValue = Number(walletAmount);
    const depositFee = walletTab === "deposit" && amountValue > 0 ? Math.round(amountValue * 0.01) : 0;
    const depositTotal = walletTab === "deposit" && amountValue > 0 ? amountValue + depositFee : 0;

    const historySummary = useMemo(() => {
        return walletHistory.map((item) => ({
            ...item,
            sign: item.type === "deposit" ? "+" : "-",
        }));
    }, [walletHistory]);

    const handleCreateDepositQr = async () => {
        if (!amountValue || amountValue <= 0) {
            setDepositError("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        try {
            setDepositBusy(true);
            setDepositError("");

            const res = await generateQr({
                methodId: 1,
                amount: amountValue,
            });

            setDepositPayment(res.data);
            setWalletMessage("Đã tạo mã QR nạp ví.");
        } catch (error: any) {
            console.error(error);
            setDepositError(error?.response?.data?.message || "Không tạo được mã QR.");
        } finally {
            setDepositBusy(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = Number(walletAmount);

        if (!wallet) {
            setWalletMessage("Chưa tải được thông tin ví.");
            return;
        }

        if (!amount || amount <= 0) {
            setWalletMessage("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        if (amount > balance) {
            setWalletMessage("Số dư không đủ để rút.");
            return;
        }

        try {
            setWithdrawBusy(true);
            setWalletMessage("");

            const response = await createWithdrawal({ amount });
            const data = response.data as WithdrawResponse;

            await dispatch(getMyWalletThunk());
            await fetchWalletHistory();

            setWalletMessage(
                data.transactionCode
                    ? `Đã tạo yêu cầu rút ${data.transactionCode}.`
                    : "Đã tạo yêu cầu rút."
            );
            setWalletAmount("");
            setWalletNote("");
        } catch (error: any) {
            console.error(error);
            setWalletMessage(error?.response?.data?.message || "Không tạo được yêu cầu rút.");
        } finally {
            setWithdrawBusy(false);
        }
    };

    const handleTabChange = (tab: WalletAction) => {
        setWalletTab(tab);
        setWalletAmount("");
        setWalletNote("");
        setWalletMessage("");
        setDepositError("");

        if (tab === "withdraw") {
            setDepositPayment(null);
        }
    };

    return (
        <div className="profile-content">
            <div className="profile-card wallet-page-card">
                <div className="profile-wallet-head">
                    <div>
                        <h2>Ví</h2>
                    </div>
                </div>

                <div className="profile-wallet-summary">
                    <div className="wallet-summary-card primary">
                        <span>Khả dụng</span>
                        <strong>{walletLoading ? "Đang tải..." : formatNumberDisplay(balance)}</strong>
                    </div>

                    <div className="wallet-summary-card">
                        <span>Tạm giữ</span>
                        <strong>{walletLoading ? "Đang tải..." : formatNumberDisplay(frozenBalance)}</strong>
                    </div>
                </div>

                <div className="profile-wallet-grid">
                    <div className="wallet-action-card">
                        <div className="wallet-card-title">
                            <h3>{walletTab === "deposit" ? "Nạp ví" : "Rút ví"}</h3>
                        </div>

                        <div className="wallet-action-tabs">
                            <button
                                type="button"
                                className={walletTab === "deposit" ? "active" : ""}
                                onClick={() => handleTabChange("deposit")}
                            >
                                Nạp
                            </button>
                            <button
                                type="button"
                                className={walletTab === "withdraw" ? "active" : ""}
                                onClick={() => handleTabChange("withdraw")}
                            >
                                Rút
                            </button>
                        </div>

                        {walletTab === "deposit" ? (
                            <div className="wallet-deposit-flow">
                                <div className="wallet-modal-section wallet-page-section">
                                    <span>Phương thức thanh toán</span>
                                    <select
                                        value={depositMethod}
                                        onChange={(e) => {
                                            setDepositMethod(e.target.value);
                                            setDepositPayment(null);
                                            setWalletMessage("");
                                            setDepositError("");
                                        }}
                                    >
                                        {walletPaymentMethods.map((method) => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="wallet-modal-section wallet-page-section">
                                    <span>Số tiền nạp</span>
                                    <input
                                        type="number"
                                        min="1000"
                                        value={walletAmount}
                                        onChange={(e) => {
                                            setWalletAmount(e.target.value);
                                            setWalletMessage("");
                                            setDepositError("");
                                            setDepositPayment(null);
                                        }}
                                        placeholder="Nhập số tiền bạn muốn nạp"
                                    />

                                    <div className="wallet-quick-amounts">
                                        {quickWalletAmounts.map((amount) => (
                                            <button
                                                key={amount}
                                                type="button"
                                                onClick={() => {
                                                    setWalletAmount(amount.toString());
                                                    setWalletMessage("");
                                                    setDepositError("");
                                                    setDepositPayment(null);
                                                }}
                                            >
                                                {amount / 1000}K
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="wallet-modal-summary wallet-page-summary">
                                    <div>
                                        <span>Tiền nạp</span>
                                        <strong>{formatMoney(amountValue || 0)}</strong>
                                    </div>

                                    <div>
                                        <span>Phí giao dịch</span>
                                        <strong>{formatMoney(depositFee)}</strong>
                                    </div>

                                    <div className="wallet-modal-total">
                                        <span>Thành tiền</span>
                                        <strong>{formatMoney(depositTotal)}</strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="wallet-action-btn"
                                    onClick={handleCreateDepositQr}
                                    disabled={depositBusy}
                                >
                                    {depositBusy ? "ĐANG TẠO QR..." : "TIẾP TỤC"}
                                </button>

                                {(walletMessage || depositError) && (
                                    <p className="wallet-inline-message wallet-inline-message--stacked">
                                        {depositError || walletMessage}
                                    </p>
                                )}

                                {depositPayment?.qrUrl && (
                                    <div className="wallet-inline-qr">
                                        <div className="wallet-inline-qr-head">
                                            <strong>Mã QR nạp ví</strong>
                                            <span>Hiển thị ngay bên dưới để bạn quét và thanh toán.</span>
                                        </div>

                                        <div className="wallet-inline-qr-box">
                                            <QRWidget qrUrl={depositPayment.qrUrl} token="" />
                                        </div>

                                        <div className="wallet-inline-note">
                                            <p>Mã thanh toán sẽ hết hạn sau khi hệ thống xử lý xong phiên hiện tại.</p>
                                            <ol>
                                                <li>Đăng nhập ứng dụng Mobile Banking hoặc ví điện tử.</li>
                                                <li>Chọn chức năng QR Pay và quét mã QR.</li>
                                                <li>Xác nhận thanh toán để hoàn tất nạp ví.</li>
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Số tiền</label>
                                    <input
                                        value={walletAmount}
                                        onChange={(e) => {
                                            setWalletAmount(e.target.value);
                                            setWalletMessage("");
                                        }}
                                        placeholder="Nhập số tiền"
                                    />
                                </div>

                                <div className="wallet-quick-amounts">
                                    {quickWalletAmounts.map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => {
                                                setWalletAmount(String(amount));
                                                setWalletMessage("");
                                            }}
                                        >
                                            {formatMoney(amount)}
                                        </button>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <input
                                        value={walletNote}
                                        onChange={(e) => {
                                            setWalletNote(e.target.value);
                                            setWalletMessage("");
                                        }}
                                        placeholder="Tùy chọn"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="wallet-action-btn"
                                    onClick={() => void handleWithdraw()}
                                    disabled={withdrawBusy}
                                >
                                    {withdrawBusy ? "ĐANG TẠO YÊU CẦU..." : "XÁC NHẬN RÚT"}
                                </button>

                                {walletMessage && <p className="wallet-inline-message">{walletMessage}</p>}
                            </>
                        )}
                    </div>

                    <div className="wallet-history-card">
                        <div className="wallet-history-head">
                            <div>
                                <h4>Giao dịch gần đây</h4>
                            </div>
                            <span>{historySummary.length}</span>
                        </div>

                        <div className="wallet-history-list">
                            {walletHistoryLoading && <p className="wallet-inline-message">Đang tải giao dịch...</p>}
                            {!walletHistoryLoading && walletHistoryError && <p className="wallet-inline-message">{walletHistoryError}</p>}
                            {!walletHistoryLoading && !walletHistoryError && historySummary.length === 0 && (
                                <p className="wallet-inline-message">Chưa có giao dịch nào.</p>
                            )}
                            {!walletHistoryLoading && !walletHistoryError && historySummary.map((item) => (
                                <div className="wallet-history-item" key={item.id}>
                                    <div className="wallet-history-main">
                                        <strong>{item.title}</strong>
                                        <p>{item.note}</p>
                                    </div>

                                    <div className={`wallet-history-amount ${item.type}`}>
                                        <span>{item.sign}{formatMoney(item.amount).replace("₫", "đ")}</span>
                                        <small>{formatDateTime(item.time)}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
