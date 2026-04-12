import "../styles/user_profile.css";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { uploadAvatarThunk } from "../features/auth/authSlice";

const UserProfile = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.auth.user);
    const loading = useSelector((state: RootState) => state.auth.loading);

    const avatarFromStore = user?.avatar ?? "";

    const [avatar, setAvatar] = useState(avatarFromStore);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        setAvatar(avatarFromStore);
    }, [avatarFromStore]);

    const handleUploadImage = () => {
        if (!file) {
            alert("Vui lòng chọn ảnh");
            return;
        }

        dispatch(uploadAvatarThunk(file));
    };

    const selectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            alert("Chỉ chọn ảnh");
            return;
        }

        if (selectedFile.size > 2 * 1024 * 1024) {
            alert("Chỉ chọn ảnh dưới 2MB");
            return;
        }

        const previewUrl = URL.createObjectURL(selectedFile);
        setAvatar(previewUrl);
        setFile(selectedFile);
    };

    return (
        <div className="profile-page">

            {/* SIDEBAR */}
            <div className="profile-sidebar">
                <div className="profile-user">
                    <img src={avatar} alt="avatar" />
                    <h3>{user?.username || "User"}</h3>
                </div>

                <div className="profile-menu">
                    <p className="menu-title">Cá Nhân</p>
                    <a className="active">Thông Tin</a>
                    <a>Lịch Sử Donate</a>
                    <a>Danh Sách Theo Dõi</a>

                    <p className="menu-title">Trang Cá Nhân</p>
                    <a>Thông Tin Bio</a>
                    <a>Cài Đặt Thanh Toán</a>
                    <a>Cài Đặt Donate OBS</a>

                    <p className="menu-title">Khác</p>
                    <a>Nâng Cao</a>
                    <a className="logout">Đăng xuất</a>
                </div>
            </div>

            {/* CONTENT */}
            <div className="profile-content">
                <div className="profile-card">
                    <h2>Thông Tin</h2>

                    <div className="avatar-box">
                        <label htmlFor="avatarInput" className="avatar-upload">
                            <img src={avatar} alt="avatar" />
                            <div className="overlay">Đổi ảnh</div>
                        </label>

                        <input
                            id="avatarInput"
                            type="file"
                            accept="image/*"
                            onChange={selectImage}
                            style={{ display: "none" }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tên hiển thị</label>
                        <input value={user?.username || ""} readOnly />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input value={user?.username || ""} readOnly />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input value={user?.email || ""} readOnly />
                    </div>

                    <button
                        className="btn-save"
                        onClick={handleUploadImage}
                        disabled={loading}
                    >
                        {loading ? "Đang upload..." : "Cập nhật"}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default UserProfile;