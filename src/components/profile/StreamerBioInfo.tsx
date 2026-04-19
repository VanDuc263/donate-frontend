import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

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

    const handleSubmit = () => {
        alert("\u0110\u00e3 c\u1eadp nh\u1eadt th\u00f4ng tin bio (demo UI)");
    };

    return (
        <div className="profile-content">
            <div className="profile-card streamer-bio-card">
                <h2>{"Th\u00f4ng Tin Bio"}</h2>

                <div className="streamer-bio-grid">
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
                            <label>{"T\u00ean trang"}</label>
                            <input
                                value={pageName}
                                onChange={(e) => setPageName(e.target.value)}
                                placeholder="vd: vduc"
                            />
                        </div>

                        <div className="form-group">
                            <label>{"Li\u00ean k\u1ebft"}</label>
                            <input value={donateLink} readOnly />
                        </div>

                        <div className="form-group">
                            <label>{"Gi\u1edbi thi\u1ec7u"}</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder={"Vi\u1ebft gi\u1edbi thi\u1ec7u ng\u1eafn v\u1ec1 b\u1ea1n"}
                            />
                        </div>

                        <div className="form-group">
                            <label>{"Ph\u00e2n lo\u1ea1i"}</label>
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
                                placeholder={"D\u00e1n link zalo t\u1ea1i \u0111\u00e2y"}
                            />
                        </div>

                        <div className="form-group">
                            <label>Facebook</label>
                            <input
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                placeholder={"D\u00e1n link facebook t\u1ea1i \u0111\u00e2y"}
                            />
                        </div>

                        <div className="form-group">
                            <label>Youtube</label>
                            <input
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                                placeholder={"D\u00e1n link youtube t\u1ea1i \u0111\u00e2y"}
                            />
                        </div>

                        <div className="form-group">
                            <label>Tiktok</label>
                            <input
                                value={tiktok}
                                onChange={(e) => setTiktok(e.target.value)}
                                placeholder={"D\u00e1n link tiktok t\u1ea1i \u0111\u00e2y"}
                            />
                        </div>

                        <div className="form-group">
                            <label>Instagram</label>
                            <input
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder={"D\u00e1n link instagram t\u1ea1i \u0111\u00e2y"}
                            />
                        </div>

                        <div className="bio-qr-box">
                            <h3>{"QR Donate Nhanh (Qu\u00e9t b\u1eb1ng app ng\u00e2n h\u00e0ng)"}</h3>
                            <p>
                                {"Streamer ch\u01b0a c\u1ea5u h\u00ecnh t\u00e0i kho\u1ea3n ng\u00e2n h\u00e0ng \u0111\u1ec3 t\u1ea1o QR code."}
                            </p>
                        </div>
                    </div>
                </div>

                <button className="btn-save bio-submit-btn" onClick={handleSubmit}>
                    {"C\u1eadp nh\u1eadt"}
                </button>
            </div>
        </div>
    );
};

export default StreamerBioInfo;
