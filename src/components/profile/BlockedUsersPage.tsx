import React from "react";

type BlockedUserItem = {
    id: number;
    name: string;
    username: string;
    avatar?: string;
};

const blockedUsers: BlockedUserItem[] = [
    {
        id: 1,
        name: "Nguyen Minh Khoa",
        username: "minhkhoa99",
        avatar: "https://i.pravatar.cc/120?img=12",
    },
    {
        id: 2,
        name: "Tran Bao Han",
        username: "baohaan.live",
        avatar: "https://i.pravatar.cc/120?img=32",
    },
    {
        id: 3,
        name: "Le Quoc Anh",
        username: "quocanh.donate",
        avatar: "https://i.pravatar.cc/120?img=15",
    },
    {
        id: 4,
        name: "Pham Gia Linh",
        username: "gialinh.ne",
        avatar: "https://i.pravatar.cc/120?img=47",
    },
];

const BlockedUsersPage = () => {
    return (
        <div className="profile-content">
            <div className="profile-card blocked-users-card">
                <div className="blocked-users-head">
                    <h2>Danh sách chặn</h2>
                </div>

                <div className="blocked-users-table">
                    <div className="blocked-users-table-head">
                        <span>Người dùng</span>
                        <span>Thao tác</span>
                    </div>

                    {blockedUsers.length === 0 ? (
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
                                                alt={user.name}
                                            />
                                        ) : (
                                            <div className="blocked-users-avatar blocked-users-avatar--fallback">
                                                {user.name.slice(0, 1).toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <strong>{user.name}</strong>
                                            <span>@{user.username}</span>
                                        </div>
                                    </div>

                                    <div className="blocked-users-actions">
                                        <button type="button">Bỏ chặn</button>
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
