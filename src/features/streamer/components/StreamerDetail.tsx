import React, { useEffect, useState, useCallback, useRef } from "react";
import "../../../styles/streamer_detail.css";
import DonateForm from "../../donate/components/DonateForm";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../app/store";
import { fetchStreamer } from "../streamerSlice";
import { getLatestDonationsByStreamerId, getTopDonor } from "../../donate/donateApi";
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

    // ================= VERSION CONTROL (QUAN TRỌNG NHẤT) =================
    const activeStreamerIdRef = useRef<number | null>(null);
    const socketRef = useRef<any>(null);

    // ================= RESET ON TOKEN CHANGE =================
    useEffect(() => {
        dispatch(setDonations([]));
        setTopDonors([]);
        activeStreamerIdRef.current = null;

        // disconnect socket cũ ngay lập tức
        if (socketRef.current) {
            socketRef.current();
            socketRef.current = null;
        }
    }, [token, dispatch]);

    // ================= LOAD STREAMER =================
    useEffect(() => {
        if (!token) return;
        dispatch(fetchStreamer(token));
    }, [token, dispatch]);

    // ================= LOAD TOP DONORS (ANTI RACE) =================
    useEffect(() => {
        if (!token) return;

        let ignore = false;

        (async () => {
            setLoadingDonors(true);
            try {
                const res = await getTopDonor(token);
                if (!ignore) setTopDonors(res.data);
            } finally {
                if (!ignore) setLoadingDonors(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [token]);

    // ================= LOAD DONATIONS (ANTI OLD RESPONSE) =================
    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const currentId = streamerDetail.streamerId;
        activeStreamerIdRef.current = currentId;

        const fetchDonations = async () => {
            const res = await getLatestDonationsByStreamerId(currentId);

            // ❗ CHẶN DATA CŨ
            if (activeStreamerIdRef.current !== currentId) return;

            dispatch(setDonations(res.data));
        };

        fetchDonations();
    }, [streamerDetail?.streamerId, dispatch]);

    // ================= SOCKET (ANTI OLD CALLBACK) =================
    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const id = streamerDetail.streamerId;
        activeStreamerIdRef.current = id;

        const disconnect = connectSocket(id, (data) => {
            // ❗ CHẶN SOCKET CŨ
            if (activeStreamerIdRef.current !== id) return;

            dispatch(addDonateRealtime(data));
            setTopDonors(data.topDonors || []);
        });

        socketRef.current = disconnect;

        return () => {
            disconnect();
        };
    }, [streamerDetail?.streamerId, dispatch]);

    const convertAmount = (amount : number ) => {
        
    }

    // ================= UI =================
    const openDonate = useCallback(() => setShowDonate(true), []);
    const closeDonate = useCallback(() => setShowDonate(false), []);

    return (
        <div className="streamer-page">

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

            <div className="content">
                <div className="content-wrapper">

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
                                        <p>Donate {d.amount} • vừa xong</p>
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