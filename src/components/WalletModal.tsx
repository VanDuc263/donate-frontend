import QrPaymentWizard from "./QrPaymentWizard";
import { generateQr } from "../features/payment/paymentApi";

interface WalletModalProps {
    open: boolean;
    onClose: () => void;
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
    if (!open) return null;

    return (
        <div className="wallet-modal-backdrop" onClick={onClose}>
            <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wallet-modal-header">
                    <div>
                        <h3>Nạp tiền vào ví</h3>
                        <p>Chọn phương thức và quét mã QR để hoàn tất nạp tiền.</p>
                    </div>

                    <button
                        type="button"
                        className="wallet-modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <QrPaymentWizard
                    amountLabel="Số tiền nạp"
                    amountPlaceholder="Nhập số tiền bạn muốn nạp"
                    submitLabel="TIẾP TỤC"
                    submittingLabel="ĐANG TẠO QR..."
                    paymentMethods={[
                        "Chuyển khoản ngân hàng",
                        "Ví Momo",
                        "QR Pay"
                    ]}
                    initialPaymentMethod="Chuyển khoản ngân hàng"
                    feeRate={0.01}
                    amountSummaryLabel="Tiền nạp"
                    onSubmit={async ({ amount }) => {
                        const res = await generateQr({
                            methodId: 1,
                            amount
                        });

                        return res.data;
                    }}
                    note={
                        <>
                            <p>
                                Mã thanh toán sẽ hết hạn sau <strong>1792 giây</strong>.
                            </p>

                            <ol>
                                <li>Đăng nhập ứng dụng Mobile Banking hoặc ví điện tử.</li>
                                <li>Chọn chức năng QR Pay và quét mã QR.</li>
                                <li>Xác nhận thanh toán và hoàn tất giao dịch.</li>
                            </ol>
                        </>
                    }
                />
            </div>
        </div>
    );
};

export default WalletModal;
