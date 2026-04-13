import React, {useEffect, useState} from "react";
import "../../../styles/streamer_detail.css";
import DonateForm from "../../donate/components/DonateForm";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../../app/store";
import {fetchStreamer} from "../streamerSlice";

const donations = [
    { name: "Giấu tên", amount: "10.000 VND", time: "3 ngày trước" },
    { name: "Merlin", amount: "5.000 VND", time: "4 ngày trước" },
    { name: "Zeno", amount: "10.000 VND", time: "4 ngày trước" },
    { name: "Zeno", amount: "10.000 VND", time: "4 ngày trước" },
    { name: "Zeno", amount: "10.000 VND", time: "4 ngày trước" },
    { name: "Zeno", amount: "10.000 VND", time: "4 ngày trước" },
    { name: "Zeno", amount: "10.000 VND", time: "4 ngày trước" },
];

const StreamerDetail = () => {
    const [showDonate,setShowDonate] = useState(false);
    const {token} = useParams();
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if(token){
            dispatch(fetchStreamer(token))
        }
    }, [token]);

    const { data, loading } = useSelector((state: any) => state.streamer);

    console.log(data)

    return (
        <div className="streamer-page">
            {/* Cover */}
            <div className="cover">
                <div className="overlay">

                    {/* Profile */}
                    <div className="profile">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <img src={data?.avatar || data?.user?.avatar} alt="avatar" />
                                <div>
                                    <h2>{data?.displayName}</h2>
                                    <p>{data?.followersCount || 0} followers</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="actions">
                        <button onClick={() => setShowDonate(true)} className="donate-btn">Donate</button>
                        <button>Theo dõi</button>
                        <button>Chia sẻ</button>
                    </div>

                </div>
            </div>

            {/* Main */}
            <div className="content">
                <div className="content-wrapper">

                    <div className="left">
                        {/* QR */}
                        <div className="qr-box">
                            <p>Quét mã để donate</p>
                            <img src="/images/pay1.png" alt="QR" />
                        </div>

                        {/* TOP DONATOR */}
                        <div className="top-donator">
                            <h3>🏆 Top Donator</h3>

                            <div className="donator-list">
                                {donations.map((d, i) => (
                                    <div key={i} className="donator-item">
                                        <span className="donator-rank">#{i + 1}</span>
                                        <span className="name">{d.name}</span>
                                        <span className="amount">{d.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* RIGHT */}
                    <div className="right">
                        {/* Donate CTA */}
                        <div className="donate-banner">
                            <span>Bạn yêu thích streamer này?</span>
                            <button onClick={() => setShowDonate(true)}>
                                DONATE NGAY
                            </button>
                        </div>

                        {/* FORM */}
                        {showDonate && (
                            <DonateForm onClose={() => setShowDonate(false)} />
                        )}

                        {/* Feed */}
                        <div className="donation-feed">
                            {donations.map((d, i) => (
                                <div key={i} className="donation-item">
                                    <div className="dot"></div>
                                    <div>
                                        <p className="name">{d.name}</p>
                                        <p className="info">
                                            Donate {d.amount} • {d.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>        </div>
    );
};

export default StreamerDetail;