import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { getMyWalletThunk, setWallet } from "../../features/wallet/walletSlice";

type WalletAction = "deposit" | "withdraw";

type WalletHistoryItem = {
    id: number;
    type: WalletAction;
    amount: number;
    note: string;
    time: string;
};

const initialWalletHistory: WalletHistoryItem[] = [
    {
        id: 1,
        type: "deposit",
        amount: 500000,
        note: "Nạp ví qua QR ngân hàng",
        time: "2026-05-14T10:15:00",
    },
    {
        id: 2,
        type: "withdraw",
        amount: 150000,
        note: "Rút về tài khoản chính",
        time: "2026-05-13T17:40:00",
    },
    {
        id: 3,
        type: "deposit",
        amount: 250000,
        note: "Nạp bổ sung để donate",
        time: "2026-05-12T09:05:00",
    },
];

const formatMoney = (value?: number) => {
    if (value == null) return "0đ";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
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

const WalletPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const wallet = useSelector((state: RootState) => state.wallet.wallet);
    const walletLoading = useSelector((state: RootState) => state.wallet.loading);

    const [walletTab, setWalletTab] = useState<WalletAction>("deposit");
    const [walletAmount, setWalletAmount] = useState("");
    const [walletNote, setWalletNote] = useState("");
    const [walletMessage, setWalletMessage] = useState("");
    const [walletHistory, setWalletHistory] = useState<WalletHistoryItem[]>(initialWalletHistory);

    useEffect(() => {
        if (!wallet) {
            dispatch(getMyWalletThunk());
        }
    }, [dispatch, wallet]);

    const balance = wallet?.balance ?? 0;
    const frozenBalance = wallet?.frozenBalance ?? 0;

    const historySummary = useMemo(() => {
        return walletHistory.map((item) => ({
            ...item,
            label: item.type === "deposit" ? "Nạp ví" : "Rút ví",
            sign: item.type === "deposit" ? "+" : "-",
        }));
    }, [walletHistory]);

    const handleWalletAction = () => {
        const amount = Number(walletAmount);

        if (!wallet) {
            setWalletMessage("Chưa tải được thông tin ví.");
            return;
        }

        if (!amount || amount <= 0) {
            setWalletMessage("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        if (walletTab === "withdraw" && amount > balance) {
            setWalletMessage("Số dư hiện tại không đủ để rút.");
            return;
        }

        const nextBalance = walletTab === "deposit"
            ? balance + amount
            : balance - amount;

        dispatch(
            setWallet({
                ...wallet,
                balance: nextBalance,
            })
        );

        setWalletHistory((prev) => [
            {
                id: Date.now(),
                type: walletTab,
                amount,
                note: walletNote.trim() || (walletTab === "deposit" ? "Nạp ví thủ công" : "Rút ví thủ công"),
                time: new Date().toISOString(),
            },
            ...prev,
        ]);

        setWalletMessage(walletTab === "deposit" ? "Nạp ví thành công." : "Tạo yêu cầu rút ví thành công.");
        setWalletAmount("");
        setWalletNote("");
    };

    return (
        <div className="profile-content">
            <div className="profile-card wallet-page-card">
                <div className="profile-wallet-head">
                    <div>
                        <h2>Ví của bạn</h2>
                        <p>Theo dõi số dư, nạp ví, rút ví và xem biến động ví tại một khu vực riêng.</p>
                    </div>
                </div>

                <div className="profile-wallet-summary">
                    <div className="wallet-summary-card primary">
                        <span>Số dư khả dụng</span>
                        <strong>{walletLoading ? "Đang tải..." : formatMoney(balance)}</strong>
                        <p>Dùng để donate và thanh toán nhanh trong hệ thống.</p>
                    </div>

                    <div className="wallet-summary-card">
                        <span>Số dư tạm giữ</span>
                        <strong>{walletLoading ? "Đang tải..." : formatMoney(frozenBalance)}</strong>
                        <p>Các khoản đang chờ xác nhận hoặc xử lý.</p>
                    </div>
                </div>

                <div className="profile-wallet-grid">
                    <div className="wallet-action-card">
                        <div className="wallet-action-tabs">
                            <button
                                type="button"
                                className={walletTab === "deposit" ? "active" : ""}
                                onClick={() => setWalletTab("deposit")}
                            >
                                Nạp ví
                            </button>
                            <button
                                type="button"
                                className={walletTab === "withdraw" ? "active" : ""}
                                onClick={() => setWalletTab("withdraw")}
                            >
                                Rút ví
                            </button>
                        </div>

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

                        <div className="form-group">
                            <label>Nội dung</label>
                            <input
                                value={walletNote}
                                onChange={(e) => {
                                    setWalletNote(e.target.value);
                                    setWalletMessage("");
                                }}
                                placeholder={walletTab === "deposit" ? "Ví dụ: Nạp để donate" : "Ví dụ: Rút về ngân hàng"}
                            />
                        </div>

                        <button type="button" className="wallet-action-btn" onClick={handleWalletAction}>
                            {walletTab === "deposit" ? "Xác nhận nạp ví" : "Xác nhận rút ví"}
                        </button>

                        {walletMessage && <p className="wallet-inline-message">{walletMessage}</p>}
                    </div>

                    <div className="wallet-history-card">
                        <div className="wallet-history-head">
                            <h4>Biến động ví</h4>
                            <span>{historySummary.length} giao dịch</span>
                        </div>

                        <div className="wallet-history-list">
                            {historySummary.map((item) => (
                                <div className="wallet-history-item" key={item.id}>
                                    <div>
                                        <strong>{item.label}</strong>
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
