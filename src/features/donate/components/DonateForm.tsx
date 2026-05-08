import { useEffect, useMemo, useState } from "react";
import "../../../styles/donate_form.css";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import {
  createPaymentQr,
  getPaymentStatus,
  transactionSyncTest,
} from "../../../services/paymentApi";

type DonateModalProps = {
  onClose: () => void;
};

type TabType = "wallet" | "qr";

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
            className={tab === "qr" ? "active" : ""}
            onClick={() => setTab("qr")}
          >
            QR
          </button>
        </div>

        <div className="modal-content">
          {tab === "wallet" && <WalletTab onClose={onClose} />}
          {tab === "qr" && <QRTab onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

function WalletTab({ onClose }: { onClose: () => void }) {
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
        message,
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
        amount: paymentInfo.amount,
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

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Đã sao chép!");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div>
      {!paymentInfo ? (
        <div>
          <div>
            <p>Số dư</p>
            <h3>0đ</h3>
            <button disabled>Nạp</button>
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

            <button onClick={handleCreatePayment} disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo thanh toán"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3>Thông tin chuyển khoản</h3>

          <p><strong>Ngân hàng:</strong> {paymentInfo.bankCode}</p>
          <p><strong>Số tài khoản:</strong> {paymentInfo.accountNo}</p>
          <p><strong>Tên tài khoản:</strong> {paymentInfo.accountName}</p>
          <p><strong>Số tiền:</strong> {paymentInfo.amount.toLocaleString("vi-VN")} đ</p>
          <p><strong>Nội dung CK:</strong> {paymentInfo.addInfo}</p>
          <p><strong>Trạng thái:</strong> {paymentStatus || paymentInfo.status}</p>

          {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button onClick={() => copyText(paymentInfo.accountNo)}>
              Copy số tài khoản
            </button>
            <button onClick={() => copyText(paymentInfo.addInfo)}>
              Copy nội dung CK
            </button>
            <button onClick={handleSandboxPay} disabled={loading}>
              {loading ? "Đang xử lý..." : "Test thanh toán"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QRTab({ onClose }: { onClose: () => void }) {
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
        message,
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
        amount: paymentInfo.amount,
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

  const paymentText = useMemo(() => {
    if (!paymentInfo) return "";
    return [
      `Ngân hàng: ${paymentInfo.bankCode}`,
      `STK: ${paymentInfo.accountNo}`,
      `Tên TK: ${paymentInfo.accountName}`,
      `Số tiền: ${paymentInfo.amount.toLocaleString("vi-VN")} đ`,
      `Nội dung: ${paymentInfo.addInfo}`,
    ].join("\n");
  }, [paymentInfo]);

  const copyPaymentText = async () => {
    if (!paymentText) return;
    try {
      await navigator.clipboard.writeText(paymentText);
      alert("Đã sao chép thông tin thanh toán!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {!paymentInfo ? (
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
            {loading ? "Đang tạo..." : "Tạo QR / thanh toán"}
          </button>
        </div>
      ) : (
        <div>
          {paymentInfo.qrUrl ? (
            <img src={paymentInfo.qrUrl} alt="QR" />
          ) : (
            <div>
              <p>Chưa có ảnh QR thật. Dùng thông tin dưới để test.</p>
            </div>
          )}

          <div>
            <p><strong>Ngân hàng:</strong> {paymentInfo.bankCode}</p>
            <p><strong>Số tài khoản:</strong> {paymentInfo.accountNo}</p>
            <p><strong>Tên tài khoản:</strong> {paymentInfo.accountName}</p>
            <p><strong>Số tiền:</strong> {paymentInfo.amount.toLocaleString("vi-VN")} đ</p>
            <p><strong>Nội dung CK:</strong> {paymentInfo.addInfo}</p>
            <p><strong>Trạng thái:</strong> {paymentStatus || paymentInfo.status}</p>

            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <button onClick={copyPaymentText}>Copy thông tin</button>
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