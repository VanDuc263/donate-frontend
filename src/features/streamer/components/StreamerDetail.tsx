import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    mdiAlphaTCircle,
    mdiAlphaZCircle,
    mdiFacebook,
    mdiInstagram,
    mdiStorefrontOutline,
    mdiYoutube,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch } from "../../../app/store";
import QRWidget from "../../../components/QRWidget";
import "../../../styles/streamer_detail.css";
import {
    getLatestDonationsByStreamerId,
    getTopDonor,
} from "../../donate/donateApi";
import DonateForm from "../../donate/components/DonateForm";
import {
    addDonateRealtime,
    setDonations,
} from "../../donate/donateSlice";
import { subscribeDonate } from "../../../services/socket";
import {
    followStreamer,
    unfollowStreamer,
} from "../streamerApi";
import {decreaseFollowers, fetchStreamer, increaseFollowers} from "../streamerSlice";

const socialPlatformMeta: Record<
    string,
    { label: string; icon: string; className: string }
> = {
    FACEBOOK: { label: "Facebook", icon: mdiFacebook, className: "facebook" },
    YOUTUBE: { label: "YouTube", icon: mdiYoutube, className: "youtube" },
    TIKTOK: { label: "TikTok", icon: mdiAlphaTCircle, className: "tiktok" },
    INSTAGRAM: { label: "Instagram", icon: mdiInstagram, className: "instagram" },
    ZALO: { label: "Zalo", icon: mdiAlphaZCircle, className: "zalo" },
};

const formatDonationAmount = (value?: number) => {
    if (value == null) return "0đ";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDisplayNumber = (value?: number) => {
    if (value == null) return "0";

    return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
    }).format(value);
};

const parseDonationDate = (value?: string | number[] | null) => {
    if (!value) return null;

    if (Array.isArray(value)) {
        const [
            year,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0,
            nano = 0,
        ] = value;

        const date = new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
            second,
            Math.floor(nano / 1000000)
        );

        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(String(value).trim());
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDonationDate = (value?: string | number[] | null) => {
    const date = parseDonationDate(value);

    if (!date) return "Không rõ thời gian";

    const now = Date.now();
    if (now - date.getTime() < 60_000) {
        return "Vừa tạo";
    }

    const pad = (num: number) => String(num).padStart(2, "0");

    return `${pad(date.getHours())}:${pad(date.getMinutes())},${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${String(date.getFullYear()).slice(-2)}`;
};

const StreamerDetail = () => {
    const { token } = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const { streamerDetail, loading } = useSelector(
        (state: any) => state.streamer
    );

    const donations = useSelector((state: any) => state.donate.donations);

    console.log(donations)

    const [showDonate, setShowDonate] = useState(false);
    const [topDonors, setTopDonors] = useState<any[]>([]);
    const [loadingDonors, setLoadingDonors] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const activeStreamerIdRef = useRef<number | null>(null);
    const unsubscribeDonateRef = useRef<null | (() => void)>(null);

    useEffect(() => {
        dispatch(setDonations([]));
        setTopDonors([]);
        activeStreamerIdRef.current = null;

        if (unsubscribeDonateRef.current) {
            unsubscribeDonateRef.current();
            unsubscribeDonateRef.current = null;
        }
    }, [token, dispatch]);

    useEffect(() => {
        if (!token) return;
        dispatch(fetchStreamer(token));
    }, [token, dispatch]);

    useEffect(() => {
        if (!token) return;

        let ignore = false;

        const fetchTopDonors = async () => {
            setLoadingDonors(true);

            try {
                const res = await getTopDonor(token);

                if (!ignore) {
                    setTopDonors(res.data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                if (!ignore) {
                    setLoadingDonors(false);
                }
            }
        };

        fetchTopDonors();

        return () => {
            ignore = true;
        };
    }, [token]);


    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const currentId = streamerDetail.streamerId;
        activeStreamerIdRef.current = currentId;

        const fetchDonations = async () => {
            try {
                const res = await getLatestDonationsByStreamerId(currentId);

                if (activeStreamerIdRef.current !== currentId) return;

                dispatch(setDonations(res.data));
            } catch (error) {
                console.log(error);
            }
        };

        fetchDonations();
    }, [streamerDetail?.streamerId, dispatch]);

    useEffect(() => {
        if (!streamerDetail?.streamerId) return;

        const currentId = streamerDetail.streamerId;
        activeStreamerIdRef.current = currentId;

        if (unsubscribeDonateRef.current) {
            unsubscribeDonateRef.current();
            unsubscribeDonateRef.current = null;
        }

        const unsubscribe = subscribeDonate(currentId, (data) => {
            if (activeStreamerIdRef.current !== currentId) return;

            dispatch(addDonateRealtime(data));
            setTopDonors(data.topDonors || []);
        });

        unsubscribeDonateRef.current = unsubscribe;

        return () => {
            unsubscribe();
            unsubscribeDonateRef.current = null;
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

                dispatch(decreaseFollowers())

                return;
            }

            await followStreamer(token);
            setIsFollowing(true);
            dispatch(increaseFollowers())
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

    const visibleProductPromotions = (streamerDetail?.productPromotions || [])
        .filter((item: any) => item?.imageUrl && item?.title)
        .slice(0, 5);



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
                                    <p>{streamerDetail?.followers || 0} followers</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="actions">
                        <button onClick={openDonate} className="donate-btn">
                            Donate
                        </button>

                        <button className={isFollowing ? "following-btn" : ""} onClick={handleFollowToggle} disabled={followLoading}>
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
                                    className={`streamer-social-link ${
                                        socialPlatformMeta[item.platform]?.className || ""
                                    }`}
                                    aria-label={
                                        socialPlatformMeta[item.platform]?.label || item.platform
                                    }
                                    title={
                                        socialPlatformMeta[item.platform]?.label || item.platform
                                    }
                                >
                                    <Icon
                                        path={
                                            socialPlatformMeta[item.platform]?.icon ||
                                            mdiAlphaZCircle
                                        }
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
                                        <span className="donator-rank">#{index + 1}</span>
                                        <span className="donator-name">{d.donorName}</span>
                                        <span className="donator-amount">{formatDisplayNumber(d.totalAmount)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="right">
                        {visibleProductPromotions.length > 0 && (
                            <div className="streamer-shop-panel">
                                <div className="streamer-shop-header">
                                    <div className="streamer-shop-title-wrap">
                                        <Icon
                                            path={mdiStorefrontOutline}
                                            size={0.9}
                                            className="streamer-shop-icon"
                                        />
                                        <span className="streamer-shop-title">SẢN PHẨM NỔI BẬT</span>
                                    </div>

                                    <div className="streamer-shop-dots" aria-hidden="true">
                                        {visibleProductPromotions.slice(0, 4).map((_: any, index: number) => (
                                            <span
                                                key={index}
                                                className={`streamer-shop-dot ${
                                                    index === 0 ? "active" : ""
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="streamer-promotion-list">
                                    {visibleProductPromotions.map((item: any) => (
                                        <a
                                            key={item.id || `${item.title}-${item.imageUrl}`}
                                            className="streamer-promotion-card"
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <div className="streamer-promotion-thumb">
                                                <img src={item.imageUrl} alt={item.title} />
                                            </div>
                                            <div className="streamer-promotion-title">
                                                {item.title}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="donate-banner">
                            <span>Bạn yêu thích streamer này?</span>
                            <button onClick={openDonate}>DONATE NGAY</button>
                        </div>

                        {showDonate && <DonateForm onClose={closeDonate} />}

                        <div className="donation-feed">
                            <div className="donation-feed-header">
                                <h3>Gần đây</h3>
                            </div>

                            {donations.length === 0 ? (
                                <div className="donation-feed-empty">
                                    Chưa có lượt donate nào. Hãy là người ủng hộ đầu tiên nhé.
                                </div>
                            ) : (
                                donations.map((d: any, index: number) => (
                                    <div key={index} className="donation-item">
                                        <div className="donation-avatar">
                                            {(d.donorName || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="donation-content">
                                            <div className="donation-meta">
                                                <span className="donation-name">
                                                    {d.donorName || "Ẩn danh"}
                                                </span>
                                                <span className="donation-time">
                                                    {formatDonationDate(d.createdAt)}
                                                </span>
                                            </div>
                                            <p className="donation-summary">
                                                Donate <span className="donation-amount">{formatDonationAmount(d.amount)}</span> với lời nhắn
                                            </p>
                                            <p className="donation-message">
                                                {d.message?.trim() || "Không có lời nhắn"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreamerDetail;
