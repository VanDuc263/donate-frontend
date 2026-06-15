import React, { useEffect, useState } from "react";
import {
    getMyBlockedUsers,
    StreamerBlockResponse,
    unblockUserByStreamer,
} from "../../features/streamer/streamerApi";

const displayNameOf = (user: StreamerBlockResponse) =>
    user.fullName?.trim() || user.username?.trim() || "Người dùng";

const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState<StreamerBlockResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingUserId, setProcessingUserId] = useState<number | null>(null);

    useEffect(() => {
        let ignore = false;

        const fetchBlockedUsers = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await getMyBlockedUsers();

                if (!ignore) {
                    setBlockedUsers(res.data || []);
                }
            } catch (err: any) {
                if (!ignore) {
                    setError(err?.response?.data?.message || "Không lấy được danh sách chặn.");
                    setBlockedUsers([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchBlockedUsers();

        return () => {
            ignore = true;
        };
    }, []);

    const handleUnblock = async (userId: number) => {
        try {
            setProcessingUserId(userId);
            setError("");
            await unblockUserByStreamer(userId);
            setBlockedUsers((prev) => prev.filter((item) => item.userId !== userId));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Bỏ chặn người dùng thất bại.");
        } finally {
            setProcessingUserId(null);
        }
    };

    return (
        <div className="profile-content">
            <div className="profile-card blocked-users-card">
                <div className="blocked-users-head">
                    <h2>Danh sách chặn</h2>
                </div>

                {!!error && <div className="blocked-users-error">{error}</div>}

                <div className="blocked-users-table">
                    <div className="blocked-users-table-head">
                        <span>Người dùng</span>
                        <span>Thao tác</span>
                    </div>

                    {loading ? (
                        <div className="blocked-users-empty">Đang tải danh sách chặn...</div>
                    ) : blockedUsers.length === 0 ? (
                        <div className="blocked-users-empty">
                            Không có người dùng nào bị chặn
                        </div>
                    ) : (
                        <div className="blocked-users-table-body">
                            {blockedUsers.map((user) => (
                                <div className="blocked-users-row" key={user.id}>
                                    <div className="blocked-users-user">
                                        {user.avatar ? (
                                            <img
                                                className="blocked-users-avatar"
                                                src={user.avatar}
                                                alt={displayNameOf(user)}
                                            />
                                        ) : (
                                            <div className="blocked-users-avatar blocked-users-avatar--fallback">
                                                {displayNameOf(user).slice(0, 1).toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <strong>{displayNameOf(user)}</strong>
                                            <span>@{user.username || "unknown"}</span>
                                        </div>
                                    </div>

                                    <div className="blocked-users-actions">
                                        <button
                                            type="button"
                                            onClick={() => handleUnblock(user.userId)}
                                            disabled={processingUserId === user.userId}
                                        >
                                            {processingUserId === user.userId ? "Đang xử lý..." : "Bỏ chặn"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlockedUsersPage;
