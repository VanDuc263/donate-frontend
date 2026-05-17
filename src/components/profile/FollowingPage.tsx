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
                    <h2>Danh sach theo doi</h2>
                    <p>
                        Quan ly nhung streamer ban dang theo doi va xem ai dang
                        theo doi tai khoan cua ban.
                    </p>
                </div>

                <div className="following-stats">
                    <div className="following-stat-box">
                        <span>Dang theo doi</span>
                        <strong>{following.length}</strong>
                        <p>Danh sach streamer ban da chon de cap nhat.</p>
                    </div>

                    <div className="following-stat-box">
                        <span>Nguoi theo doi</span>
                        <strong>{followers.length}</strong>
                        <p>Nhung tai khoan dang quan tam den trang cua ban.</p>
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
                        Dang theo doi
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
                        Nguoi theo doi
                    </button>
                </div>

                {loading && (
                    <p className="following-status">Dang tai du lieu...</p>
                )}

                <div className="following-section-head">
                    <div>
                        <h3>
                            {isFollowingView
                                ? "Danh sach dang theo doi"
                                : "Danh sach nguoi theo doi"}
                        </h3>
                        <p>
                            {isFollowingView
                                ? "Mo trang streamer de xem thong tin moi nhat va ung ho nhanh hon."
                                : "Nhung tai khoan da bam theo doi de nhan cap nhat tu ban."}
                        </p>
                    </div>

                    <span className="following-badge">
                        {currentCount} ket qua
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

                                    <p>{item.bio || "Chua co mo ta"}</p>

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
                        <h3>Ban chua theo doi ai</h3>
                        <p>
                            Khi ban theo doi streamer, danh sach se hien thi o
                            day de ban truy cap nhanh hon.
                        </p>
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
                                        <span>ID: {item.followerId}</span>
                                    </div>
                                </div>

                                <div className="following-meta">
                                    <span className="following-type follower-type">
                                        Follower
                                    </span>
                                    <p>Da theo doi ban</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isFollowingView && !loading && followers.length === 0 && (
                    <div className="following-empty-state">
                        <h3>Chua co nguoi theo doi</h3>
                        <p>
                            Khi co nguoi quan tam va theo doi tai khoan cua ban,
                            thong tin se xuat hien tai day.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowingPage;
