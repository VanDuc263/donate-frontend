import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { uploadAvatarThunk,updateProfileThunk } from "../../features/auth/authSlice";
import AvatarUpload from "./AvatarUpload";

const ProfileInfo = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.auth.user);
    const loading = useSelector((state: RootState) => state.auth.loading);

    const avatarFromStore = user?.avatar ?? "";

    const [avatar, setAvatar] = useState(avatarFromStore);
    const [file, setFile] = useState<File | null>(null);
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.email || "");

    useEffect(() => {
        setAvatar(avatarFromStore);
    }, [avatarFromStore]);

    useEffect(() => {
        setFullName(user?.fullName || "");
        setEmail(user?.email || "");
    }, [user]);

    const handleSubmit = async () => {
        try {
            if (file) {
                await dispatch(uploadAvatarThunk(file)).unwrap();
            }

            await dispatch(
                updateProfileThunk({
                    fullName,
                    email,
                })
            ).unwrap();

            alert("Cập nhật thông tin thành công");
            setFile(null);
        } catch (error) {
            alert("Cập nhật thất bại");
        }
    };

    return (
        <div className="profile-content">
            <div className="profile-card">
                <h2>Thông Tin</h2>

                <AvatarUpload
                    avatar={avatar || "https://i.pravatar.cc/150?img=12"}
                    setAvatar={setAvatar}
                    setFile={setFile}
                />

                <div className="form-group">
                    <label>Tên hiển thị</label>
                    <input  
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập tên hiển thị" />
                </div>

                <div className="form-group">
                    <label>Username</label>
                    <input value={user?.username || ""} readOnly />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    {/* <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email" /> */}
                    <input value={user?.email || ""} readOnly />
                </div>

                <button
                    className="btn-save"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Đang upload..." : "Cập nhật"}
                </button>
            </div>
        </div>
    );
};

export default ProfileInfo;