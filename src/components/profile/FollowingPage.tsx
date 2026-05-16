import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import { fetchProfile } from "../../features/profile/profileSlice";

type StreamerFollowingEntry = {
    id: number;
    name: string;
    handle: string;
    game: string;
    note: string;
};

type FollowerEntry = {
    id: number;
    name: string;
    handle: string;
    status: string;
};

type FollowView = "following" | "followers";

const defaultFollowing: StreamerFollowingEntry[] = [
    { id: 1, name: "MixiGaming", handle: "@mixigaming", game: "Gaming", note: "Theo dõi các buổi talk và gameplay" },
    { id: 2, name: "Hướng Mêu", handle: "@huongmeu", game: "MOBA", note: "Hay donate và xem livestream tối" },
    { id: 3, name: "NightOwl", handle: "@nightowl", game: "Variety", note: "Theo dõi nội dung khuya" },
    { id: 4, name: "CoderStream", handle: "@coderstream", game: "Tech", note: "Stream code và chia sẻ công nghệ" },
];

const defaultFollowers: FollowerEntry[] = [
    { id: 1, name: "Luna", handle: "@luna", status: "Theo dõi 2 tuần trước" },
    { id: 2, name: "Minh Dev", handle: "@minhdev", status: "Tương tác thường xuyên" },
    { id: 3, name: "BaoBao", handle: "@baobao", status: "Mới theo dõi gần đây" },
    { id: 4, name: "Anh Khoa", handle: "@anhkhoa", status: "Fan trung thành" },
];

const FollowingPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const streamer = useSelector((state: RootState) => state.auth.streamer);
    const profile = useSelector((state: RootState) => state.profile.data);
    const loading = useSelector((state: RootState) => state.profile.loading);

    const [activeView, setActiveView] = useState<FollowView>("following");

    useEffect(() => {
        if (!profile) {
            dispatch(fetchProfile());
        }
    }, [dispatch, profile]);

    const isStreamer = user?.role === "ROLE_STREAMER" || !!streamer;

    const followingList = useMemo(() => {
        if (profile?.favoriteStreamers?.length) {
            return profile.favoriteStreamers.map((name, index) => ({
                id: index + 1,
                name,
                handle: `@${name.toLowerCase().replace(/\s+/g, "")}`,
                game: ["Gaming", "MOBA", "Variety", "Tech"][index % 4],
                note: "Streamer bạn đang theo dõi",
            }));
        }

        return defaultFollowing;
    }, [profile]);

    const followerList = useMemo(() => defaultFollowers, []);

    const followerCount = streamer?.followers ?? profile?.followers ?? 0;
    const followingCount = profile?.following ?? followingList.length;
    const displayName = user?.fullName || user?.username || "Bạn";

    return (
        <div className="profile-content">
            <div className="profile-card following-card">
                <div className="following-head">
                    <div>
                        <h2>Theo dõi</h2>
                        <p>
                            Quản lý danh sách streamer bạn đang theo dõi và xem nhanh lượng người theo dõi dành cho {displayName}.
                        </p>
                    </div>
                </div>

                <div className="following-stats">
                    <div className="following-stat-box">
                        <span>Người theo dõi</span>
                        <strong>{isStreamer ? followerCount : 0}</strong>
                        <p>
                            {isStreamer
                                ? "Số tài khoản đang theo dõi trang của bạn."
                                : "Mục này chỉ khả dụng sau khi bạn tạo trang streamer."}
                        </p>
                    </div>

                    <div className="following-stat-box">
                        <span>Đang theo dõi</span>
                        <strong>{followingCount}</strong>
                        <p>Danh sách streamer bạn đã theo dõi để cập nhật nội dung thường xuyên.</p>
                    </div>
                </div>

                <div className="following-view-tabs">
                    <button
                        type="button"
                        className={activeView === "following" ? "active" : ""}
                        onClick={() => setActiveView("following")}
                    >
                        Đang theo dõi
                    </button>
                    <button
                        type="button"
                        className={activeView === "followers" ? "active" : ""}
                        onClick={() => setActiveView("followers")}
                    >
                        Người theo dõi
                    </button>
                </div>

                {activeView === "following" && (
                    <>
                        <div className="following-section-head">
                            <div>
                                <h3>Danh sách đang theo dõi</h3>
                                <p>Phần này chỉ hiển thị các streamer bạn đang theo dõi.</p>
                            </div>
                            <span className="following-badge">{followingList.length} streamer</span>
                        </div>

                        {loading && !profile ? (
                            <p className="empty-msg">Đang tải danh sách theo dõi...</p>
                        ) : (
                            <div className="following-list">
                                {followingList.map((item) => (
                                    <div className="following-item" key={item.id}>
                                        <div className="following-identity">
                                            <div className="following-mark">{item.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <h4>{item.name}</h4>
                                                <span>{item.handle}</span>
                                            </div>
                                        </div>

                                        <div className="following-meta">
                                            <span className="following-type">{item.game}</span>
                                            <p>{item.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeView === "followers" && (
                    <>
                        <div className="following-section-head">
                            <div>
                                <h3>Danh sách người theo dõi</h3>
                                <p>Chỉ streamer mới có thể xem những tài khoản đang theo dõi trang của mình.</p>
                            </div>
                            {isStreamer && <span className="following-badge">{followerCount} follower</span>}
                        </div>

                        {isStreamer ? (
                            <div className="following-list">
                                {followerList.map((item) => (
                                    <div className="following-item" key={item.id}>
                                        <div className="following-identity">
                                            <div className="following-mark follower-mark">{item.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <h4>{item.name}</h4>
                                                <span>{item.handle}</span>
                                            </div>
                                        </div>

                                        <div className="following-meta">
                                            <span className="following-type follower-type">Follower</span>
                                            <p>{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="following-empty-state">
                                <h3>Bạn chưa có trang</h3>
                                <p>Tạo trang streamer để bắt đầu nhận người theo dõi và xem danh sách follower của bạn.</p>
                                <Link to="/account/create-streamer" className="following-create-btn">
                                    Tạo trang ngay
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FollowingPage;
