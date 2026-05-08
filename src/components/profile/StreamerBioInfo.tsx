import React, {useEffect, useMemo, useState} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import QRWidget from "../QRWidget";
import {getQrUrl, savePaymentAccount} from "../../features/streamer/streamerApi";

const StreamerBioInfo = () => {

    const user = useSelector((state: RootState) => state.auth.user);
    const streamer = useSelector((state: RootState) => state.auth.streamer);

    const defaultPageName = streamer?.displayName || user?.username || "";
    const defaultToken = streamer?.token || user?.username || "";

    const [pageName, setPageName] = useState(defaultPageName);
    const [bio, setBio] = useState(streamer?.bio || "");
    const [category, setCategory] = useState("Streamer");

    const [zalo, setZalo] = useState("");
    const [facebook, setFacebook] = useState("");
    const [youtube, setYoutube] = useState("");
    const [tiktok, setTiktok] = useState("");
    const [instagram, setInstagram] = useState("");

    const donateLink = useMemo(
        () => `https://zyscan.com/${defaultToken || "your-link"}`,
        [defaultToken]
    );
    const token = streamer?.token
    const [qrUrl,setQrUrl] = useState<string | null>()

    const handleSubmit = () => {
        alert("Đã cập nhật thông tin bio (demo UI)");
    };
    useEffect(() => {
        const handleGetQrUrl = async () => {

            try {
                const response = await getQrUrl();

                console.log(response);

                setQrUrl(response.data)

            } catch (error) {

                console.error(error);

            }
        };
        handleGetQrUrl()
    }, [streamer]);
    return (
        <div className="profile-content">
            <div className="profile-card streamer-bio-card">

                <h2>Thông Tin Bio</h2>

                <div className="streamer-bio-grid">

                    {/* LEFT */}
                    <div className="streamer-bio-left">

                        <div className="streamer-cover-wrap">
                            <img
                                className="streamer-cover-image"
                                src="/images/streamers/test.png"
                                alt="cover"
                            />

                            <img
                                className="streamer-cover-avatar"
                                src={user?.avatar || "/logo192.png"}
                                alt="avatar"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tên trang</label>

                            <input
                                value={pageName}
                                onChange={(e) => setPageName(e.target.value)}
                                placeholder="vd: vduc"
                            />
                        </div>

                        <div className="form-group">
                            <label>Liên kết</label>

                            <input
                                value={donateLink}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Giới thiệu</label>

                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Viết giới thiệu ngắn về bạn"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phân loại</label>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Streamer">
                                    Streamer
                                </option>

                                <option value="Creator">
                                    Creator
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="streamer-bio-right">

                        <div className="form-group">
                            <label>Zalo</label>

                            <input
                                value={zalo}
                                onChange={(e) => setZalo(e.target.value)}
                                placeholder="Dán link zalo tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Facebook</label>

                            <input
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                placeholder="Dán link facebook tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Youtube</label>

                            <input
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                                placeholder="Dán link youtube tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tiktok</label>

                            <input
                                value={tiktok}
                                onChange={(e) => setTiktok(e.target.value)}
                                placeholder="Dán link tiktok tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Instagram</label>

                            <input
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="Dán link instagram tại đây"
                            />
                        </div>

                        {/* QR BOX */}
                        <div className="bio-qr-box">

                            <h3>
                                QR Donate Nhanh
                            </h3>
                            {token && qrUrl &&(
                                <QRWidget qrUrl={qrUrl} token={token}/>
                            )}
                            {token && !qrUrl &&(
                                <p>
                                    {"Streamer ch\u01b0a c\u1ea5u h\u00ecnh t\u00e0i kho\u1ea3n ng\u00e2n h\u00e0ng \u0111\u1ec3 t\u1ea1o QR code."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className="btn-save bio-submit-btn"
                    onClick={handleSubmit}
                >
                    Cập nhật
                </button>
            </div>
        </div>
    );
};

export default StreamerBioInfo;