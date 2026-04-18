const TopDonors = () => {
    const donors = [
        { name: "Ngô Văn Đức", amount: 5000000 },
        { name: "Anh A", amount: 2000000 },
        { name: "User B", amount: 1500000 },
    ];

    return (
        <div className="top-donors">
            <h3>🏆 Top Donors</h3>

            {donors.map((d, i) => (
                <div key={i} className="donor-item">
                    <span className="rank">#{i + 1}</span>
                    <span className="name">{d.name}</span>
                    <span className="money">
                        {d.amount.toLocaleString("vi-VN")}đ
                    </span>
                </div>
            ))}
        </div>
    );
};

export default TopDonors;