import { useState } from "react";
import "../../../styles/donate_form.css"


type DonateModalProps = {
    onClose: () => void;
};

type TabType = "wallet" | "qr" ;

export default function DonateModal({ onClose }: DonateModalProps) {
    const [tab, setTab] = useState<TabType>("wallet");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="modal-header">
                    <h2>Donate</h2>
                    <button onClick={onClose}>X</button>
                </div>

                {/* TABS */}
                <div className="modal-tabs">
                    <button
                        className={tab === "wallet" ? "active" : ""}
                        onClick={() => setTab("wallet")}
                    >
                        Ví
                    </button>
                    <button
                        className={tab === "qr" ? "active" : ""}
                        onClick={() => setTab("qr")}
                    >
                        QR
                    </button>

                </div>

                {/* CONTENT */}
                <div className="modal-content">
                    {tab === "wallet" && <WalletTab />}
                    {tab === "qr" && <QRTab />}
                </div>

            </div>
        </div>
    );
}

function WalletTab() {
    const [amount, setAmount] = useState<number>(0);
    const [message, setMessage] = useState("");

    return (
        <div>
            <div>
                <p>Số dư</p>
                <h3>0đ</h3>
                <button>Nạp</button>
            </div>

            <div>
                <input
                    type="number"
                    placeholder="Số tiền"
                    onChange={(e) => setAmount(Number(e.target.value))}
                />

                <input
                    placeholder="Lời nhắn"
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button>Donate</button>
            </div>
        </div>
    );
}

function QRTab() {
    return (
        <div>
            <img src="/images/pay1.png" alt="QR" />

            <div>
                <p>Hướng dẫn:</p>
                <ul>
                    <li>Mở app ngân hàng</li>
                    <li>Quét QR</li>
                    <li>Nhập tiền</li>
                    <li>Xác nhận</li>
                </ul>
            </div>
        </div>
    );
}