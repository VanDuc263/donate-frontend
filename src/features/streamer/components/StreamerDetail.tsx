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
import QRWidget from "../../../components/QRWidget";
import {followStreamer, unfollowStreamer} from "../streamerApi";

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
            if (activeStreamerIdRef.current !== id) return;

            dispatch(addDonateRealtime(data));
            setTopDonors(data.topDonors || []);
        });

        socketRef.current = disconnect;

        return () => {
            disconnect();
        };
    }, [streamerDetail?.streamerId, dispatch]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    useEffect(() => {
        setIsFollowing(!!streamerDetail?.following);
    }, [streamerDetail?.following]);
    const handleFollowToggle = async () => {
        if (!token || followLoading) return;

        try {
            setFollowLoading(true);

            if (isFollowing) {
                await unfollowStreamer(token);
                setIsFollowing(false);
            } else {
                await followStreamer(token);
                setIsFollowing(true);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setFollowLoading(false);
        }
    };
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
                        {!streamerDetail?.following
                         ? (
                            <button onClick={handleFollowToggle}>Theo dõi</button>

                            ):(
                                <button> Đang theo dõi</button>
                            )
                        }
                        <button onClick={handleFollowToggle}>Chia sẻ</button>
                    </div>

                </div>
            </div>

            <div className="content">
                <div className="content-wrapper">

                    <div className="left">
                        <div className="qr-box">
                            <p style={{marginBottom: "10px",fontSize:"16px"}}>Quét mã để donate</p>

                            {streamerDetail?.qrUrl && token &&(
                                <QRWidget qrUrl={streamerDetail?.qrUrl} token={token}/>
                            )}
                            {!streamerDetail?.qrUrl &&(
                                <p>
                                    {"Streamer ch\u01b0a c\u1ea5u h\u00ecnh t\u00e0i kho\u1ea3n ng\u00e2n h\u00e0ng \u0111\u1ec3 t\u1ea1o QR code."}
                                </p>
                            )}
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