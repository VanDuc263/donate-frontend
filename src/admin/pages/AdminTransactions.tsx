import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchAdminTransactions, setTxSearch } from "../../features/admin/adminSlice";

const money = (n?: number | null) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;
const date = (d?: string | null) => d ? new Date(d).toLocaleString("vi-VN") : "—";
const statusClass = (s?: string | null) => (s || "").toLowerCase();

const AdminTransactions = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { donations, walletTransactions, payments, txSearch, loading, error } = useSelector((s: RootState) => s.admin);
    const [tab, setTab] = useState<"donations" | "wallets" | "payments">("donations");

    useEffect(() => { dispatch(fetchAdminTransactions()); }, [dispatch]);

    const filteredDonations = useMemo(() => donations.filter(d => {
        const q = txSearch.toLowerCase();
        return `${d.id} ${d.donorName || ""} ${d.streamerName || ""} ${d.content || ""} ${d.referenceCode || ""} ${d.status}`.toLowerCase().includes(q);
    }), [donations, txSearch]);

    const filteredWallets = useMemo(() => walletTransactions.filter(t => {
        const q = txSearch.toLowerCase();
        return `${t.id} ${t.username || ""} ${t.type || ""} ${t.transactionCode || ""} ${t.referenceCode || ""} ${t.status}`.toLowerCase().includes(q);
    }), [walletTransactions, txSearch]);

    const filteredPayments = useMemo(() => payments.filter(p => {
        const q = txSearch.toLowerCase();
        return `${p.id} ${p.provider || ""} ${p.donorName || ""} ${p.transactionCode || ""} ${p.addInfo || ""} ${p.status}`.toLowerCase().includes(q);
    }), [payments, txSearch]);

    return (
        <div className="admin-section">
            <div className="as-header">
                <div>
                    <h2>💳 Quản lý giao dịch</h2>
                    <p>Donate, nạp ví và bảng payments</p>
                </div>
                <button className="view-toggle" onClick={() => dispatch(fetchAdminTransactions())}>↻ Tải lại</button>
            </div>

            {error && <div className="admin-error small">⚠️ {error}</div>}

            <div className="as-filters">
                <input className="as-search" placeholder="🔍 Tìm mã giao dịch, donor, streamer..." value={txSearch} onChange={e => dispatch(setTxSearch(e.target.value))} />
                <div className="as-filter-tabs">
                    <button className={tab === "donations" ? "active" : ""} onClick={() => setTab("donations")}>Donate <span className="filter-count">{donations.length}</span></button>
                    <button className={tab === "wallets" ? "active" : ""} onClick={() => setTab("wallets")}>Ví <span className="filter-count">{walletTransactions.length}</span></button>
                    <button className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>Payments <span className="filter-count">{payments.length}</span></button>
                </div>
            </div>

            {loading ? <p>Đang tải...</p> : (
                <div className="as-table-wrap">
                    {tab === "donations" && <table className="as-table">
                        <thead><tr><th>ID</th><th>Người donate</th><th>Streamer</th><th>Số tiền</th><th>Nội dung CK</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
                        <tbody>{filteredDonations.map(d => <tr key={d.id} className="as-row">
                            <td>#{d.id}</td><td>{d.donorName || "Anonymous"}</td><td>{d.streamerName || d.streamerId}</td><td className="as-money">{money(d.amount)}</td><td>{d.content || "—"}</td><td><span className={`tx-status ${statusClass(d.status)}`}>{d.status}</span></td><td>{date(d.createdAt)}</td>
                        </tr>)}</tbody>
                    </table>}

                    {tab === "wallets" && <table className="as-table">
                        <thead><tr><th>ID</th><th>User</th><th>Loại</th><th>Amount</th><th>Fee</th><th>Net</th><th>Mã GD</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
                        <tbody>{filteredWallets.map(t => <tr key={t.id} className="as-row">
                            <td>#{t.id}</td><td>{t.username || t.userId}</td><td>{t.type}</td><td className="as-money">{money(t.amount)}</td><td>{money(t.fee)}</td><td>{money(t.netAmount)}</td><td>{t.transactionCode || "—"}</td><td><span className={`tx-status ${statusClass(t.status)}`}>{t.status}</span></td><td>{date(t.createdAt)}</td>
                        </tr>)}</tbody>
                    </table>}

                    {tab === "payments" && <table className="as-table">
                        <thead><tr><th>ID</th><th>Provider</th><th>Donor</th><th>Amount</th><th>Add info</th><th>Mã GD</th><th>Paid at</th><th>Trạng thái</th></tr></thead>
                        <tbody>{filteredPayments.map(p => <tr key={p.id} className="as-row">
                            <td>#{p.id}</td><td>{p.provider || "—"}</td><td>{p.donorName || p.donorId || "—"}</td><td className="as-money">{money(p.amount)}</td><td>{p.addInfo || "—"}</td><td>{p.transactionCode || "—"}</td><td>{date(p.paidAt)}</td><td><span className={`tx-status ${statusClass(p.status)}`}>{p.status}</span></td>
                        </tr>)}</tbody>
                    </table>}
                </div>
            )}
        </div>
    );
};

export default AdminTransactions;
