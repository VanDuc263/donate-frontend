import React, { useEffect, useState, useCallback } from "react";
import "../../../styles/streamer_detail.css";
import DonateForm from "../../donate/components/DonateForm";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../app/store";
import { fetchStreamer } from "../streamerSlice";
import { getLatestDonations, getTopDonor } from "../../donate/donateApi";
import { connectSocket } from "../../../services/socket";
import { addDonateRealtime, setDonations } from "../../donate/donateSlice";

const StreamerDetail = () => {
    const { token } = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const { streamerDetail, loading } = useSelector(
        (state: any) => state.streamer
    );

    const donations = useSelector((state: any) => state.donate.donations);

    const [showDonate, setShowDonate] = useState(false);
    const [topDonors, setTopDonors] = useState<any[]>([]);
    const [loadingDonors, setLoadingDonors] = useState(false);

    // ================= STREAMER LOAD =================
    useEffect(() => {
        if (!token) return;

        dispatch(fetchStreamer(token));

        let ignore = false;

        const fetchTopDonors = async () => {
            setLoadingDonors(true);
            try {
                const res = await getTopDonor(token);
                if (!ignore) setTopDonors(res.data);
            } finally {
                if (!ignore) setLoadingDonors(false);
            }
        };

        fetchTopDonors();

        return () => {
            ignore = true;
        };
    }, [token, dispatch]);

    // ================= DONATION HISTORY =================
    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const fetchDonations = async () => {
            const res = await getLatestDonations(streamerDetail.streamerId);
            dispatch(setDonations(res.data));
        };

        fetchDonations();
    }, [streamerDetail?.streamerId, dispatch]);

    // ================= SOCKET (CHỈ UPDATE LIST) =================
    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const disconnect = connectSocket(
            streamerDetail.streamerId,
            (data) => {
                console.log("🔥 realtime donate:", data);

                // chỉ update list, KHÔNG show overlay
                dispatch(addDonateRealtime(data));
            }
        );

        return () => disconnect();
    }, [streamerDetail?.streamerId, dispatch]);

    // ================= UI =================
    const openDonate = useCallback(() => {
        setShowDonate(true);
    }, []);

    const closeDonate = useCallback(() => {
        setShowDonate(false);
    }, []);

    return (
        <div className="streamer-page">

            {/* HEADER */}
            <div className="cover">
                <div className="overlay">

                    <div className="profile">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <img
                                    src={
                                        streamerDetail?.avatar ||
                                        streamerDetail?.user?.avatar
                                    }
                                    alt="avatar"
                                />
                                <div>
                                    <h2>{streamerDetail?.displayName}</h2>
                                    <p>{streamerDetail?.followersCount || 0} followers</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="actions">
                        <button onClick={openDonate} className="donate-btn">
                            Donate
                        </button>
                        <button>Theo dõi</button>
                        <button>Chia sẻ</button>
                    </div>

                </div>
            </div>

            {/* CONTENT */}
            <div className="content">
                <div className="content-wrapper">

                    {/* LEFT */}
                    <div className="left">

                        <div className="qr-box">
                            <p>Quét mã để donate</p>
                            <img src="/images/pay1.png" alt="QR" />
                        </div>

                        <div className="top-donator">
                            <h3>🏆 Top Donator</h3>

                            {loadingDonors ? (
                                <p>Loading...</p>
                            ) : (
                                topDonors.map((d, i) => (
                                    <div key={i} className="donator-item">
                                        <span>#{i + 1}</span>
                                        <span>{d.donorName}</span>
                                        <span>{d.totalAmount} VND</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="right">

                        <div className="donate-banner">
                            <span>Bạn yêu thích streamer này?</span>
                            <button onClick={openDonate}>
                                DONATE NGAY
                            </button>
                        </div>

                        {showDonate && (
                            <DonateForm onClose={closeDonate} />
                        )}

                        <div className="donation-feed">
                            {donations.map((d: any, i: number) => (
                                <div key={i} className="donation-item">
                                    <div className="dot" />
                                    <div>
                                        <p>{d.donorName}</p>
                                        <p>
                                            Donate {d.amount} • vừa xong
                                        </p>
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

export default StreamerDetail;