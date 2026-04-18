import React, { useState } from "react";
import ProfileSidebar from "./ProfileSidebar";
import "../../styles/create_donate.css";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../app/store";
import {CreateStreamerThunk} from "../../features/streamer/streamerSlice";

interface StreamerInfo {
    displayName : string,
    token : string,
    type : string,
    file : File
}

const CreatePage = () => {
    const [avatar, setAvatar] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [type, setType] = useState("STREAMER");

    const dispatch = useDispatch<AppDispatch>();

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        setFile(f);
        setAvatar(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (!file) {
            alert("Chưa chọn file");
            return;
        }


        const data: StreamerInfo = {
            displayName: name,
            token: slug,
            type,
            file
        };

        console.log(data)

        try {
            const res = await dispatch(CreateStreamerThunk(data)).unwrap();
            alert(res ? "Tạo trang thành công" : "")
        } catch (err) {
            console.error("ERROR:", err);
        }
    };

    return (
        <div className="profile-page">
            <ProfileSidebar />

            <div className="profile-content">
                <div className="profile-card create-card">
                    <h2>Tạo Trang ZyScan</h2>

                    {/* ===== AVATAR ===== */}
                    <label className="upload-box">
                        {avatar ? (
                            <img src={avatar} alt="" />
                        ) : (
                            <div className="upload-placeholder">
                                📷
                            </div>
                        )}
                        <input type="file" hidden onChange={handleImage} />
                    </label>

                    <div className="form-group">
                        <label>Tên trang</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Đức Stream"
                        />
                    </div>

                    <div className="form-group">
                        <label>Liên kết</label>
                        <div className="input-prefix">
                            <span>taziu.com/</span>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="duc-stream"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phân loại</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}

                        >
                            <option value="STREAMER">Streamer</option>
                            <option value="CREATOR">Creator</option>
                        </select>
                    </div>

                    <button className="btn-save" onClick={handleSubmit}>
                        Tạo trang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePage;