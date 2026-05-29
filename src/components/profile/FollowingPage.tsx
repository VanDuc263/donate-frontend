import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFollowers, getFollowing } from "../../features/profile/profileApi";

type FollowingResponse = {
    followId: number;
    streamerId: number;
    streamerName: string;
    token: string;
    avatar: string;
    bio: string | null;
    followedAt: string;
};

type FollowerResponse = {
    id: number;
    followerId: number;
    followerName: string;
    avatar: string;
    streamerId: number;
    streamerName: string;
    createdAt: string;
};

type FollowView = "following" | "followers";

const FollowingPage = () => {
    const [activeView, setActiveView] =
        useState<FollowView>("following");

    const [following, setFollowing] =
        useState<FollowingResponse[]>([]);

    const [followers, setFollowers] =
        useState<FollowerResponse[]>([]);

    const [loading, setLoading] = useState(false);

    const fetchFollowing = async () => {
        try {
            setLoading(true);

            const res = await getFollowing();

            setFollowing(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowers = async () => {
        try {
            setLoading(true);

            const res = await getFollowers();

            setFollowers(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowing();
    }, []);

    const handleChangeTab = async (tab: FollowView) => {
        setActiveView(tab);

        if (tab === "followers" && followers.length === 0) {
            await fetchFollowers();
        }
    };

    const isFollowingView = activeView === "following";
    const currentCount = isFollowingView
        ? following.length
        : followers.length;

    return (
        <div className="profile-content">
            <div className="profile-card following-card">
                <div className="following-head">
                    <h2>Danh sách theo dõi</h2>
                    <p>
                        Quản lý những streamer bạn đang theo dõi và xem ai đang
                        theo dõi tài khoản của bạn.
                    </p>
                </div>

                <div className="following-stats">
                    <div className="following-stat-box">
                        <span>Đang theo dõi</span>
                        <strong>{following.length}</strong>
                    </div>

                    <div className="following-stat-box">
                        <span>Người theo doi</span>
                        <strong>{followers.length}</strong>
                    </div>
                </div>

                <div className="following-view-tabs">
                    <button
                        className={
                            activeView === "following"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            handleChangeTab("following")
                        }
                    >
                        Đang theo dõi
                    </button>

                    <button
                        className={
                            activeView === "followers"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            handleChangeTab("followers")
                        }
                    >
                        Người theo dõi
                    </button>
                </div>

                {loading && (
                    <p className="following-status">Đang tải dữ liệu...</p>
                )}

                <div className="following-section-head">
                    <div>
                        <h3>
                            {isFollowingView
                                ? "Danh sách streamer đang theo dõi"
                                : "Danh sách người theo dõi"}
                        </h3>

                    </div>

                    <span className="following-badge">
                        {currentCount} kết quả
                    </span>
                </div>

                {isFollowingView && following.length > 0 && (
                    <div className="following-list">
                        {following.map((item) => (
                            <div
                                className="following-item"
                                key={item.followId}
                            >
                                <div className="following-identity">
                                    <img
                                        src={item.avatar}
                                        alt={item.streamerName}
                                        className="following-avatar"
                                    />

                                    <div>
                                        <h4>{item.streamerName}</h4>
                                        <span>@{item.token}</span>
                                    </div>
                                </div>

                                <div className="following-meta">
                                    <span className="following-type">
                                        Streamer
                                    </span>

                                    <p>{item.bio || "Chưa có mô tả"}</p>

                                    <Link
                                        className="following-link"
                                        to={`/streamer/${item.token}`}
                                    >
                                        Xem trang
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isFollowingView && !loading && following.length === 0 && (
                    <div className="following-empty-state">
                        <h3>Bạn chưa theo dõi ai</h3>

                    </div>
                )}

                {!isFollowingView && followers.length > 0 && (
                    <div className="following-list">
                        {followers.map((item) => (
                            <div
                                className="following-item"
                                key={item.id}
                            >
                                <div className="following-identity">
                                    <img
                                        src={item.avatar}
                                        alt={item.followerName}
                                        className="following-avatar"
                                    />

                                    <div>
                                        <h4>{item.followerName}</h4>
                                    </div>
                                </div>

                                <div className="following-meta">
                                    <span className="following-type follower-type">
                                        Follower
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isFollowingView && !loading && followers.length === 0 && (
                    <div className="following-empty-state">
                        <h3>Chưa có người theo dõi</h3>
                        <p>
                            Khi có người quan tâm va theo dõi tài khoản của bạn,
                            thông tin sẽ xuất hiện tại đây.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowingPage;
