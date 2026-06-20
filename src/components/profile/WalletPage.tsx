import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import QRWidget from "../../components/QRWidget";
import { generateQr } from "../../features/payment/paymentApi";
import { createWithdrawal, getWalletTransactions } from "../../features/wallet/walletApi";
import { getMyWalletThunk } from "../../features/wallet/walletSlice";

type WalletAction = "deposit" | "withdraw";
type WalletHistoryFilter = "incoming" | "outgoing" | "pending";
type WalletHistoryDirection = "deposit" | "withdraw" | "pending" | "pending-withdraw";

type WalletTransactionType =
    | "DEPOSIT"
    | "WITHDRAW"
    | "DONATION_IN"
    | "DONATION_OUT"
    | "REFUND"
    | string;

type WalletHistoryItem = {
    id: number;
    type: WalletHistoryDirection;
    transactionType: WalletTransactionType;
    status: string;
    title: string;
    amount: number;
    note: string;
    time: string;
    sign: "+" | "-";
    isPendingWithdraw: boolean;
};

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
const incomingTransactionTypes = new Set<WalletTransactionType>(["DEPOSIT", "DONATION_IN", "REFUND"]);
const outgoingTransactionTypes = new Set<WalletTransactionType>(["WITHDRAW", "DONATION_OUT"]);
const walletPaymentMethods = ["Chuyển khoản ngân hàng", "Ví Momo", "QR Pay"];

const formatMoney = (value?: number) => {
    if (value == null) return "0đ";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value).replace("₫", "đ");
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

const formatDateKey = (value: string) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatSelectedDateLabel = (value: string) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));

const getRelativeDate = (offset: number) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return formatDateKey(date.toISOString());
};

const normalizeTransactionStatus = (status?: string | null) =>
    String(status || "").trim().toUpperCase();

const isIncomingTransactionType = (type?: WalletTransactionType | null) =>
    incomingTransactionTypes.has(String(type || "").trim().toUpperCase());

const isOutgoingTransactionType = (type?: WalletTransactionType | null) =>
    outgoingTransactionTypes.has(String(type || "").trim().toUpperCase());

const isPendingTransaction = (status?: string | null) => normalizeTransactionStatus(status) === "PENDING";
const isSuccessfulTransaction = (status?: string | null) => normalizeTransactionStatus(status) === "SUCCESS";

const getWalletTransactionMeta = (type: WalletTransactionType) => {
    switch (type) {
        case "DEPOSIT":
            return { label: "Nạp ví", historyType: "deposit" as const };
        case "DONATION_IN":
            return { label: "Nhận donate", historyType: "deposit" as const };
        case "REFUND":
            return { label: "Hoàn tiền", historyType: "deposit" as const };
        case "WITHDRAW":
            return { label: "Rút ví", historyType: "withdraw" as const };
        case "DONATION_OUT":
            return { label: "Gửi donate", historyType: "withdraw" as const };
        default:
            return { label: type, historyType: "deposit" as const };
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

const matchesWalletHistoryFilter = (item: WalletHistoryItem, filter: WalletHistoryFilter) => {
    if (filter === "incoming") {
        return isIncomingTransactionType(item.transactionType);
    }

    if (filter === "outgoing") {
        return isOutgoingTransactionType(item.transactionType) && isSuccessfulTransaction(item.status);
    }

    return isPendingTransaction(item.status);
};

const getWalletHistoryAmountTone = (
    item: WalletHistoryItem,
    activeFilter: WalletHistoryFilter
): WalletHistoryDirection => {
    if (activeFilter === "pending") {
        return item.isPendingWithdraw ? "pending-withdraw" : "pending";
    }

    return isIncomingTransactionType(item.transactionType) ? "deposit" : "withdraw";
};

const getWalletHistorySign = (item: WalletHistoryItem, activeFilter: WalletHistoryFilter) => {
    if (activeFilter === "pending") {
        return "";
    }

    return item.sign;
};

const WalletPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const wallet = useSelector((state: RootState) => state.wallet.wallet);
    const walletLoading = useSelector((state: RootState) => state.wallet.loading);

    const [walletTab, setWalletTab] = useState<WalletAction>("deposit");
    const [walletHistoryFilter, setWalletHistoryFilter] = useState<WalletHistoryFilter>("incoming");
    const [walletAmount, setWalletAmount] = useState("");
    const [walletNote, setWalletNote] = useState("");
    const [walletMessage, setWalletMessage] = useState("");
    const [walletHistory, setWalletHistory] = useState<WalletHistoryItem[]>([]);
    const [walletHistoryLoading, setWalletHistoryLoading] = useState(false);
    const [walletHistoryError, setWalletHistoryError] = useState("");
    const [historyRangeStart, setHistoryRangeStart] = useState("");
    const [historyRangeEnd, setHistoryRangeEnd] = useState("");
    const [isHistoryRangeOpen, setIsHistoryRangeOpen] = useState(false);
    const [depositMethod, setDepositMethod] = useState(walletPaymentMethods[0]);
    const [depositBusy, setDepositBusy] = useState(false);
    const [depositError, setDepositError] = useState("");
    const [depositPayment, setDepositPayment] = useState<WalletQrPayment | null>(null);
    const [withdrawBusy, setWithdrawBusy] = useState(false);
    const historyRangePanelRef = useRef<HTMLDivElement | null>(null);

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
                    const pending = isPendingTransaction(item.status);
                    const isPendingWithdraw = pending && String(item.type).trim().toUpperCase() === "WITHDRAW";

                    return {
                        id: item.id,
                        type: isPendingWithdraw ? "pending-withdraw" : pending ? "pending" : meta.historyType,
                        transactionType: item.type,
                        status: item.status,
                        title: meta.label,
                        amount: item.netAmount ?? item.amount ?? 0,
                        note: buildWalletTransactionNote(item),
                        time: item.createdAt,
                        sign: meta.historyType === "deposit" ? "+" : "-",
                        isPendingWithdraw,
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

    useEffect(() => {
        if (!isHistoryRangeOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (!historyRangePanelRef.current?.contains(event.target as Node)) {
                setIsHistoryRangeOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isHistoryRangeOpen]);

    const balance = wallet?.balance ?? 0;
    const frozenBalance = wallet?.frozenBalance ?? 0;
    const amountValue = Number(walletAmount);
    const depositFee = walletTab === "deposit" && amountValue > 0 ? Math.round(amountValue * 0.01) : 0;
    const depositTotal = walletTab === "deposit" && amountValue > 0 ? amountValue + depositFee : 0;

    const dateFilteredHistory = useMemo(
        () =>
            walletHistory.filter((item) => {
                const itemDate = formatDateKey(item.time);

                if (historyRangeStart && itemDate < historyRangeStart) {
                    return false;
                }

                if (historyRangeEnd && itemDate > historyRangeEnd) {
                    return false;
                }

                return true;
            }),
        [historyRangeEnd, historyRangeStart, walletHistory]
    );

    const filteredHistory = useMemo(
        () => dateFilteredHistory.filter((item) => matchesWalletHistoryFilter(item, walletHistoryFilter)),
        [dateFilteredHistory, walletHistoryFilter]
    );

    const historyCounts = useMemo(
        () => ({
            incoming: dateFilteredHistory.filter((item) => matchesWalletHistoryFilter(item, "incoming")).length,
            outgoing: dateFilteredHistory.filter((item) => matchesWalletHistoryFilter(item, "outgoing")).length,
            pending: dateFilteredHistory.filter((item) => matchesWalletHistoryFilter(item, "pending")).length,
        }),
        [dateFilteredHistory]
    );

    const applyHistoryPreset = (preset: "today" | "7days" | "30days" | "all") => {
        if (preset === "today") {
            const today = getRelativeDate(0);
            setHistoryRangeStart(today);
            setHistoryRangeEnd(today);
            return;
        }

        if (preset === "7days") {
            setHistoryRangeStart(getRelativeDate(-6));
            setHistoryRangeEnd(getRelativeDate(0));
            return;
        }

        if (preset === "30days") {
            setHistoryRangeStart(getRelativeDate(-29));
            setHistoryRangeEnd(getRelativeDate(0));
            return;
        }

        setHistoryRangeStart("");
        setHistoryRangeEnd("");
    };

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

            setWalletHistoryFilter("pending");
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
                        <h2>Ví của tôi</h2>
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
                            <div className="wallet-history-head-copy">
                                <h4>Lịch sử giao dịch</h4>
                            </div>

                            <div className="wallet-history-tools" ref={historyRangePanelRef}>
                                <button
                                    type="button"
                                    className={`wallet-history-date-trigger${historyRangeStart || historyRangeEnd ? " active" : ""}`}
                                    onClick={() => setIsHistoryRangeOpen((prev) => !prev)}
                                    title={
                                        historyRangeStart || historyRangeEnd
                                            ? `${historyRangeStart ? formatSelectedDateLabel(historyRangeStart) : "..."} - ${historyRangeEnd ? formatSelectedDateLabel(historyRangeEnd) : "..."}`
                                            : "Chọn khoảng thời gian"
                                    }
                                    aria-label="Chọn khoảng thời gian"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1h-1v1a1 1 0 1 1-2 0V6H8v1a1 1 0 1 1-2 0V6H5Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </button>

                                {(historyRangeStart || historyRangeEnd) && (
                                    <button
                                        type="button"
                                        className="wallet-history-date-clear"
                                        onClick={() => {
                                            setHistoryRangeStart("");
                                            setHistoryRangeEnd("");
                                        }}
                                    >
                                        Bỏ lọc
                                    </button>
                                )}

                                <span className="wallet-history-count">{filteredHistory.length} mục</span>

                                {isHistoryRangeOpen && (
                                    <div className="wallet-history-range-panel">
                                        <div className="wallet-history-range-head">
                                            <strong>Chọn khoảng thời gian</strong>
                                            <button
                                                type="button"
                                                className="wallet-history-range-close"
                                                onClick={() => setIsHistoryRangeOpen(false)}
                                            >
                                                Đóng
                                            </button>
                                        </div>

                                        <div className="wallet-history-range-fields">
                                            <label className="wallet-history-range-field">
                                                <span>Từ ngày</span>
                                                <input
                                                    type="date"
                                                    value={historyRangeStart}
                                                    max={historyRangeEnd || undefined}
                                                    onChange={(e) => setHistoryRangeStart(e.target.value)}
                                                />
                                            </label>

                                            <label className="wallet-history-range-field">
                                                <span>Đến ngày</span>
                                                <input
                                                    type="date"
                                                    value={historyRangeEnd}
                                                    min={historyRangeStart || undefined}
                                                    onChange={(e) => setHistoryRangeEnd(e.target.value)}
                                                />
                                            </label>
                                        </div>

                                        <div className="wallet-history-range-presets">
                                            <button type="button" onClick={() => applyHistoryPreset("today")}>Hôm nay</button>
                                            <button type="button" onClick={() => applyHistoryPreset("7days")}>7 ngày</button>
                                            <button type="button" onClick={() => applyHistoryPreset("30days")}>30 ngày</button>
                                            <button type="button" onClick={() => applyHistoryPreset("all")}>Tất cả</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="wallet-history-tabs">
                            <button
                                type="button"
                                className={walletHistoryFilter === "incoming" ? "active incoming" : ""}
                                onClick={() => setWalletHistoryFilter("incoming")}
                            >
                                Tiền vào
                                <strong>{historyCounts.incoming}</strong>
                            </button>
                            <button
                                type="button"
                                className={walletHistoryFilter === "outgoing" ? "active outgoing" : ""}
                                onClick={() => setWalletHistoryFilter("outgoing")}
                            >
                                Tiền ra
                                <strong>{historyCounts.outgoing}</strong>
                            </button>
                            <button
                                type="button"
                                className={walletHistoryFilter === "pending" ? "active pending" : ""}
                                onClick={() => setWalletHistoryFilter("pending")}
                            >
                                Đang xử lý
                                <strong>{historyCounts.pending}</strong>
                            </button>
                        </div>

                        <div className="wallet-history-list">
                            {walletHistoryLoading && <p className="wallet-inline-message">Đang tải giao dịch...</p>}
                            {!walletHistoryLoading && walletHistoryError && <p className="wallet-inline-message">{walletHistoryError}</p>}
                            {!walletHistoryLoading && !walletHistoryError && filteredHistory.length === 0 && (
                                <p className="wallet-inline-message">Chưa có giao dịch nào trong nhóm này.</p>
                            )}

                            {!walletHistoryLoading && !walletHistoryError && filteredHistory.map((item) => (
                                <div
                                    className={`wallet-history-item${item.isPendingWithdraw ? " wallet-history-item--pending-withdraw" : ""}`}
                                    key={item.id}
                                >
                                    <div className="wallet-history-main">
                                        <div className="wallet-history-title-row">
                                            <strong>{item.title}</strong>
                                        </div>
                                        <p>{item.note}</p>
                                    </div>

                                    {item.isPendingWithdraw && (
                                        <span className="wallet-history-badge">Đang duyệt</span>
                                    )}

                                    <div className={`wallet-history-amount ${getWalletHistoryAmountTone(item, walletHistoryFilter)}`}>
                                        <span>{getWalletHistorySign(item, walletHistoryFilter)}{formatMoney(item.amount)}</span>
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
