type Props = {
    donation: any;
};

export default function AlertBox({ donation }: Props) {
    if (!donation) return null;

    return (
        <div style={{ border: "2px solid red", padding: 10 }}>
            <h3>🎉 Donate mới!</h3>
            <p>{donation.donorName} vừa donate {donation.amount} VNĐ</p>
            <p>{donation.message}</p>
        </div>
    );
}