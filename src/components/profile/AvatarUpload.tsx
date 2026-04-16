import React from "react";

type Props = {
    avatar: string;
    setAvatar: (val: string) => void;
    setFile: (file: File) => void;
};

const AvatarUpload = ({ avatar, setAvatar, setFile }: Props) => {
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
    );
};

export default AvatarUpload;