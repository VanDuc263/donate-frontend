import React, { useCallback, useEffect, useRef, useState } from "react";
import { mdiAlphaTCircle, mdiAlphaZCircle, mdiFacebook, mdiInstagram, mdiYoutube } from "@mdi/js";
import Icon from "@mdi/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch } from "../../../app/store";
import QRWidget from "../../../components/QRWidget";
import "../../../styles/streamer_detail.css";
import { getLatestDonationsByStreamerId, getTopDonor } from "../../donate/donateApi";
import DonateForm from "../../donate/components/DonateForm";
import { addDonateRealtime, setDonations } from "../../donate/donateSlice";
import { connectSocket } from "../../../services/socket";
import { followStreamer, unfollowStreamer } from "../streamerApi";
import { fetchStreamer } from "../streamerSlice";

const socialPlatformMeta: Record<string, { label: string; icon: string; className: string }> = {
    FACEBOOK: { label: "Facebook", icon: mdiFacebook, className: "facebook" },
    YOUTUBE: { label: "YouTube", icon: mdiYoutube, className: "youtube" },
    TIKTOK: { label: "TikTok", icon: mdiAlphaTCircle, className: "tiktok" },
    INSTAGRAM: { label: "Instagram", icon: mdiInstagram, className: "instagram" },
    ZALO: { label: "Zalo", icon: mdiAlphaZCircle, className: "zalo" },
};

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
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const activeStreamerIdRef = useRef<number | null>(null);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        dispatch(setDonations([]));
        setTopDonors([]);
        activeStreamerIdRef.current = null;

        if (socketRef.current) {
            socketRef.current();
            socketRef.current = null;
        }
    }, [token, dispatch]);

    useEffect(() => {
        if (!token) return;
        dispatch(fetchStreamer(token));
    }, [token, dispatch]);

    useEffect(() => {
        if (!token) return;

        let ignore = false;

        (async () => {
            setLoadingDonors(true);
            try {
                const res = await getTopDonor(token);
                if (!ignore) {
                    setTopDonors(res.data);
                }
            } finally {
                if (!ignore) {
                    setLoadingDonors(false);
                }
            }
        })();

        return () => {
            ignore = true;
        };
    }, [token]);

    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const currentId = streamerDetail.streamerId;
        activeStreamerIdRef.current = currentId;

        const fetchDonations = async () => {
            const res = await getLatestDonationsByStreamerId(currentId);

            if (activeStreamerIdRef.current !== currentId) return;

            dispatch(setDonations(res.data));
        };

        fetchDonations();
    }, [streamerDetail?.streamerId, dispatch]);

    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const currentId = streamerDetail.streamerId;
        activeStreamerIdRef.current = currentId;

        const disconnect = connectSocket(currentId, (data) => {
            if (activeStreamerIdRef.current !== currentId) return;

            dispatch(addDonateRealtime(data));
            setTopDonors(data.topDonors || []);
        });

        socketRef.current = disconnect;

        return () => {
            disconnect();
        };
    }, [streamerDetail?.streamerId, dispatch]);

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
                return;
            }

            await followStreamer(token);
            setIsFollowing(true);
        } catch (error) {
            console.log(error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleShare = useCallback(async () => {
        const shareUrl = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: streamerDetail?.displayName || "Streamer",
                    url: shareUrl,
                });
                return;
            }

            await navigator.clipboard.writeText(shareUrl);
        } catch (error) {
            console.log(error);
        }
    }, [streamerDetail?.displayName]);

    const openDonate = useCallback(() => setShowDonate(true), []);
    const closeDonate = useCallback(() => setShowDonate(false), []);

    const coverStyle = streamerDetail?.thumb
        ? { backgroundImage: `url(${streamerDetail.thumb})` }
        : undefined;

    const visibleSocialLinks = (streamerDetail?.socialLinks || []).filter(
        (item: any) => item?.visible && item?.url
    );

    return (
        <div className="streamer-page">
            <div className="cover" style={coverStyle}>
                <div className="overlay">
                    <div className="profile">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <img
                                    src={streamerDetail?.avatar || streamerDetail?.user?.avatar}
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
                        <button onClick={handleFollowToggle} disabled={followLoading}>
                            {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                        </button>
                        <button onClick={handleShare}>Chia sẻ</button>
                    </div>

                    {visibleSocialLinks.length > 0 && (
                        <div className="streamer-social-links">
                            {visibleSocialLinks.map((item: any) => (
                                <a
                                    key={`${item.platform}-${item.url}`}
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`streamer-social-link ${socialPlatformMeta[item.platform]?.className || ""}`}
                                    aria-label={socialPlatformMeta[item.platform]?.label || item.platform}
                                    title={socialPlatformMeta[item.platform]?.label || item.platform}
                                >
                                    <Icon
                                        path={socialPlatformMeta[item.platform]?.icon || mdiAlphaZCircle}
                                        size={0.82}
                                    />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="content">
                <div className="content-wrapper">
                    <div className="left">
                        <div className="qr-box">
                            <p style={{ marginBottom: "10px", fontSize: "16px" }}>
                                Quét mã để donate
                            </p>

                            {streamerDetail?.qrUrl && token && (
                                <QRWidget qrUrl={streamerDetail.qrUrl} token={token} />
                            )}
                            {!streamerDetail?.qrUrl && (
                                <p>
                                    Streamer chưa cấu hình tài khoản ngân hàng để tạo QR code.
                                </p>
                            )}
                        </div>

                        <div className="top-donator">
                            <h3>Top Donator</h3>

                            {loadingDonors ? (
                                <p>Loading...</p>
                            ) : (
                                topDonors.map((d, index) => (
                                    <div key={index} className="donator-item">
                                        <span>#{index + 1}</span>
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

                        {showDonate && <DonateForm onClose={closeDonate} />}

                        <div className="donation-feed">
                            {donations.map((d: any, index: number) => (
                                <div key={index} className="donation-item">
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
