import React, { useEffect, useState, useCallback, useRef } from "react";
import "../../../styles/streamer_detail.css";
import DonateForm from "../../donate/components/DonateForm";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../app/store";
import { fetchStreamer } from "../streamerSlice";
import { getLatestDonationsByStreamerId, getTopDonor } from "../../donate/donateApi";
import { connectSocket } from "../../../services/socket";
import { addDonateRealtime, setDonations } from "../../donate/donateSlice";
import QRWidget from "../../../components/QRWidget";
import { followStreamer, unfollowStreamer } from "../streamerApi";
import { createViolationReport } from "../../report/reportApi";

const reportReasons = [
    "Nội dung không phù hợp",
    "Giả mạo streamer khác",
    "Lừa đảo hoặc gian lận donate",
    "Ngôn từ xúc phạm / thù ghét",
    "Spam hoặc quảng cáo trái phép",
    "Khác",
];

const StreamerDetail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { streamerDetail, loading } = useSelector(
        (state: any) => state.streamer
    );

    const donations = useSelector((state: any) => state.donate.donations);

    const [showDonate, setShowDonate] = useState(false);
    const [topDonors, setTopDonors] = useState<any[]>([]);
    const [loadingDonors, setLoadingDonors] = useState(false);

    const [showReport, setShowReport] = useState(false);
    const [reportReason, setReportReason] = useState(reportReasons[0]);
    const [reportDescription, setReportDescription] = useState("");
    const [reportEvidenceUrl, setReportEvidenceUrl] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [reportMessage, setReportMessage] = useState<string | null>(null);
    const [reportError, setReportError] = useState<string | null>(null);

    // ================= VERSION CONTROL (QUAN TRỌNG NHẤT) =================
    const activeStreamerIdRef = useRef<number | null>(null);
    const socketRef = useRef<any>(null);

    // ================= RESET ON TOKEN CHANGE =================
    useEffect(() => {
        dispatch(setDonations([]));
        setTopDonors([]);
        activeStreamerIdRef.current = null;
        setShowReport(false);
        setReportMessage(null);
        setReportError(null);

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

    const openReport = () => {
        const authToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!authToken) {
            alert("Bạn cần đăng nhập trước khi gửi báo cáo vi phạm.");
            navigate("/login");
            return;
        }

        setReportMessage(null);
        setReportError(null);
        setShowReport(true);
    };

    const submitReport = async () => {
        if (!streamerDetail?.streamerId) {
            setReportError("Không tìm thấy streamer để báo cáo.");
            return;
        }

        if (!reportReason.trim()) {
            setReportError("Vui lòng chọn lý do báo cáo.");
            return;
        }

        if (!reportDescription.trim() || reportDescription.trim().length < 10) {
            setReportError("Vui lòng mô tả rõ hơn, ít nhất 10 ký tự.");
            return;
        }

        try {
            setReportLoading(true);
            setReportError(null);
            setReportMessage(null);

            await createViolationReport({
                targetType: "STREAMER",
                targetId: Number(streamerDetail.streamerId),
                reason: reportReason.trim(),
                description: reportDescription.trim(),
                evidenceUrl: reportEvidenceUrl.trim() || undefined,
            });

            setReportMessage("Đã gửi báo cáo. Admin sẽ kiểm tra và xử lý nếu có vi phạm.");
            setReportDescription("");
            setReportEvidenceUrl("");
        } catch (err: any) {
            setReportError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Gửi báo cáo thất bại. Có thể bạn đã gửi báo cáo cho streamer này rồi."
            );
        } finally {
            setReportLoading(false);
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

                        {!streamerDetail?.following ? (
                            <button onClick={handleFollowToggle} disabled={followLoading}>
                                Theo dõi
                            </button>
                        ) : (
                            <button onClick={handleFollowToggle} disabled={followLoading}>
                                Đang theo dõi
                            </button>
                        )}

                        <button onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                            Chia sẻ
                        </button>

                        <button onClick={openReport} className="report-streamer-btn">
                            🚩 Báo cáo
                        </button>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="content-wrapper">
                    <div className="left">
                        <div className="qr-box">
                            <p style={{ marginBottom: "10px", fontSize: "16px" }}>Quét mã để donate</p>

                            {streamerDetail?.qrUrl && token && (
                                <QRWidget qrUrl={streamerDetail?.qrUrl} token={token} />
                            )}
                            {!streamerDetail?.qrUrl && (
                                <p>
                                    {"Streamer chưa cấu hình tài khoản ngân hàng để tạo QR code."}
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
                            <button onClick={openDonate}>DONATE NGAY</button>
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

            {showReport && (
                <div className="streamer-report-backdrop" onClick={() => setShowReport(false)}>
                    <div className="streamer-report-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="streamer-report-close" onClick={() => setShowReport(false)}>
                            ✕
                        </button>

                        <h3>🚩 Báo cáo vi phạm</h3>
                        <p className="streamer-report-subtitle">
                            Báo cáo streamer: <strong>{streamerDetail?.displayName}</strong>
                        </p>

                        <label>
                            Lý do báo cáo
                            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                                {reportReasons.map((reason) => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Mô tả chi tiết
                            <textarea
                                rows={5}
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                                placeholder="Bạn hãy mô tả rõ nội dung vi phạm. Báo cáo sai sự thật nhiều lần có thể bị hạn chế quyền báo cáo."
                            />
                        </label>

                        <label>
                            Link bằng chứng, nếu có
                            <input
                                value={reportEvidenceUrl}
                                onChange={(e) => setReportEvidenceUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </label>

                        {reportError && <div className="streamer-report-error">{reportError}</div>}
                        {reportMessage && <div className="streamer-report-success">{reportMessage}</div>}

                        <div className="streamer-report-actions">
                            <button onClick={() => setShowReport(false)} className="report-cancel-btn">
                                Hủy
                            </button>
                            <button onClick={submitReport} disabled={reportLoading} className="report-submit-btn">
                                {reportLoading ? "Đang gửi..." : "Gửi báo cáo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreamerDetail;
