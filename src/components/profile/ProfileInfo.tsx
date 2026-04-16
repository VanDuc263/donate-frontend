import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { uploadAvatarThunk } from "../../features/auth/authSlice";
import AvatarUpload from "./AvatarUpload";

const ProfileInfo = () => {
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

    return (
        <div className="profile-content">
            <div className="profile-card">
                <h2>Thông Tin</h2>

                <AvatarUpload
                    avatar={avatar}
                    setAvatar={setAvatar}
                    setFile={setFile}
                />

                <div className="form-group">
                    <label>Tên hiển thị</label>
                    <input value={user?.fullName || ""} readOnly />
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
    );
};

export default ProfileInfo;