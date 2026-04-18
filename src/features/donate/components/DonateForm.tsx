import { useState } from "react";
import "../../../styles/donate_form.css"
import {donateThunk} from "../donateSlice";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../app/store";


type DonateModalProps = {
    onClose: () => void;
};

type TabType = "wallet" | "qr" ;

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
                        className={tab === "qr" ? "active" : ""}
                        onClick={() => setTab("qr")}
                    >
                        QR
                    </button>

                </div>

                <div className="modal-content">
                    {tab === "wallet" && <WalletTab />}
                    {tab === "qr" && <QRTab />}
                </div>

            </div>
        </div>
    );
}

function WalletTab() {

    const dispatch = useDispatch<AppDispatch>();

    const [amount, setAmount] = useState<number>(0);
    const [message, setMessage] = useState("");

    const user = useSelector((state : RootState) => state.auth.user)
    const streamer =  useSelector((state : RootState) => state.streamer.streamerDetail)

    console.log(user)

    const handleDonate = () => {
        dispatch(   donateThunk({
            donorName : user?.fullName,
            donorId : user?.userId,
            amount,
            message,
            streamerId: streamer.streamerId
        }));
    };

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

                <button onClick={handleDonate}>Donate</button>
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