type Props = {
    qrUrl: string;
    token : string;
};
export default function QRWidget(props : Props) {

    return (
        <div
            style={{
                width: "fit-content",
                margin: "0 auto",
                background: "#fff",
                padding: 16,
                borderRadius: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: 280,
                    height: 280
                }}
            >
                <img
                    src={props.qrUrl}
                    alt="QR"
                    width={280}
                    height={280}
                    style={{
                        borderRadius: 12
                    }}
                />

            </div>

            <div
                style={{
                    marginTop: 12,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#4f46e5"
                }}
            >
                { props.token.length > 0 ? (
                    `TAZIU.COM/${props.token}`

                    ) : null

                }
            </div>
        </div>
    );
}