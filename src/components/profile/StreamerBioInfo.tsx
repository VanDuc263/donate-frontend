import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import QRWidget from "../QRWidget";
import { getQrUrl } from "../../features/streamer/streamerApi";

const FALLBACK_THUMB = "/images/streamers/test.png";

const StreamerBioInfo = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const streamer = useSelector((state: RootState) => state.auth.streamer);

    const defaultPageName = streamer?.displayName || user?.username || "";
    const defaultToken = streamer?.token || user?.username || "";
    const defaultThumb = streamer?.thumb || FALLBACK_THUMB;

    const [pageName, setPageName] = useState(defaultPageName);
    const [bio, setBio] = useState(streamer?.bio || "");
    const [category, setCategory] = useState("Streamer");
    const [thumb, setThumb] = useState(defaultThumb);
    const [thumbName, setThumbName] = useState("");

    const [zalo, setZalo] = useState("");
    const [facebook, setFacebook] = useState("");
    const [youtube, setYoutube] = useState("");
    const [tiktok, setTiktok] = useState("");
    const [instagram, setInstagram] = useState("");
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    const thumbInputRef = useRef<HTMLInputElement | null>(null);
    const token = streamer?.token;

    const donateLink = useMemo(
        () => `https://zyscan.com/${defaultToken || "your-link"}`,
        [defaultToken]
    );

    useEffect(() => {
        setPageName(defaultPageName);
        setBio(streamer?.bio || "");
        setThumb(defaultThumb);
        setThumbName("");
    }, [defaultPageName, defaultThumb, streamer?.bio]);

    useEffect(() => {
        const handleGetQrUrl = async () => {
            try {
                const response = await getQrUrl();
                setQrUrl(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        handleGetQrUrl();
    }, [streamer]);

    const handleSubmit = () => {
        alert("Da cap nhat thong tin bio (demo UI)");
    };

    const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setThumb(reader.result);
                setThumbName(selectedFile.name);
            }
        };
        reader.readAsDataURL(selectedFile);
        e.target.value = "";
    };

    return (
        <div className="profile-content">
            <div className="profile-card streamer-bio-card">
                <h2>Thong Tin Bio</h2>

                <div className="streamer-bio-grid">
                    <div className="streamer-bio-left">
                        <div className="streamer-cover-wrap">
                            <img
                                className="streamer-cover-image"
                                src={thumb}
                                alt="cover"
                            />

                            <button
                                type="button"
                                className="streamer-cover-upload"
                                onClick={() => thumbInputRef.current?.click()}
                            >
                                {thumbName ? "Doi thumb khac" : "Tai thumb moi"}
                            </button>

                            <input
                                ref={thumbInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleThumbUpload}
                                hidden
                            />

                            <img
                                className="streamer-cover-avatar"
                                src={user?.avatar || "/logo192.png"}
                                alt="avatar"
                            />
                        </div>

                        {thumbName && (
                            <div className="streamer-thumb-meta">
                                Da chon: {thumbName}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Ten trang</label>

                            <input
                                value={pageName}
                                onChange={(e) => setPageName(e.target.value)}
                                placeholder="vd: vduc"
                            />
                        </div>

                        <div className="form-group">
                            <label>Lien ket</label>

                            <input
                                value={donateLink}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Gioi thieu</label>

                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Viet gioi thieu ngan ve ban"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phan loai</label>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Streamer">Streamer</option>
                                <option value="Creator">Creator</option>
                            </select>
                        </div>
                    </div>

                    <div className="streamer-bio-right">
                        <div className="form-group">
                            <label>Zalo</label>

                            <input
                                value={zalo}
                                onChange={(e) => setZalo(e.target.value)}
                                placeholder="Dan link zalo tai day"
                            />
                        </div>

                        <div className="form-group">
                            <label>Facebook</label>

                            <input
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                placeholder="Dan link facebook tai day"
                            />
                        </div>

                        <div className="form-group">
                            <label>Youtube</label>

                            <input
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                                placeholder="Dan link youtube tai day"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tiktok</label>

                            <input
                                value={tiktok}
                                onChange={(e) => setTiktok(e.target.value)}
                                placeholder="Dan link tiktok tai day"
                            />
                        </div>

                        <div className="form-group">
                            <label>Instagram</label>

                            <input
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="Dan link instagram tai day"
                            />
                        </div>

                        <div className="bio-qr-box">
                            <h3>QR Donate Nhanh</h3>
                            {token && qrUrl && (
                                <QRWidget qrUrl={qrUrl} token={token} />
                            )}
                            {token && !qrUrl && (
                                <p>
                                    Streamer chua cau hinh tai khoan ngan hang de tao QR code.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className="btn-save bio-submit-btn"
                    onClick={handleSubmit}
                >
                    Cap nhat
                </button>
            </div>
        </div>
    );
};

export default StreamerBioInfo;
