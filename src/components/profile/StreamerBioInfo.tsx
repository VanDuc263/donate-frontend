import React, { useEffect, useMemo, useRef, useState } from "react";
import QRWidget from "../QRWidget";
import {
    getBio,
    updateBio,
    StreamerBioResponse,
    SocialPlatform,
} from "../../features/streamer/streamerApi";

const FALLBACK_THUMB = "/images/streamers/test.png";

const StreamerBioInfo = () => {
    const [bioData, setBioData] = useState<StreamerBioResponse | null>(null);

    const [pageName, setPageName] = useState("");
    const [bio, setBio] = useState("");
    const [category, setCategory] = useState("Streamer");
    const [thumb, setThumb] = useState(FALLBACK_THUMB);
    const [thumbName, setThumbName] = useState("");

    const [zalo, setZalo] = useState("");
    const [facebook, setFacebook] = useState("");
    const [youtube, setYoutube] = useState("");
    const [tiktok, setTiktok] = useState("");
    const [instagram, setInstagram] = useState("");

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [thumbFile, setThumbFile] = useState<File | null>(null);
    const [activeImageTarget, setActiveImageTarget] = useState<"thumb" | "avatar" | null>(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    const thumbInputRef = useRef<HTMLInputElement | null>(null);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const mediaWrapRef = useRef<HTMLDivElement | null>(null);

    const donateLink = useMemo(() => {
        return `https://zyscan.com/${bioData?.token || "your-link"}`;
    }, [bioData?.token]);

    useEffect(() => {
        const fetchBio = async () => {
            try {
                const response = await getBio();
                const data = response.data;

                setBioData(data);
                setPageName(data.displayName || "");
                setBio(data.bio || "");
                setThumb(data.thumb || FALLBACK_THUMB);

                const findUrl = (platform: SocialPlatform) => {
                    return (
                        data.socialLinks?.find(
                            (item: any) => item.platform === platform
                        )?.url || ""
                    );
                };

                setFacebook(findUrl("FACEBOOK"));
                setYoutube(findUrl("YOUTUBE"));
                setTiktok(findUrl("TIKTOK"));
                setInstagram(findUrl("INSTAGRAM"));
                setZalo(findUrl("ZALO"));
            } catch (error) {
                console.error(error);
            }
        };

        fetchBio();
    }, []);

    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreview("");
            return;
        }

        const previewUrl = URL.createObjectURL(avatarFile);
        setAvatarPreview(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [avatarFile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!mediaWrapRef.current?.contains(event.target as Node)) {
                setActiveImageTarget(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const buildSocialLinks = () => {
        const links = [
            { platform: "FACEBOOK" as SocialPlatform, url: facebook },
            { platform: "YOUTUBE" as SocialPlatform, url: youtube },
            { platform: "TIKTOK" as SocialPlatform, url: tiktok },
            { platform: "INSTAGRAM" as SocialPlatform, url: instagram },
            { platform: "ZALO" as SocialPlatform, url: zalo },
        ];

        return links
            .filter((item) => item.url.trim() !== "")
            .map((item) => ({
                platform: item.platform,
                url: item.url.trim(),
                visible: true,
            }));
    };

    const handleSubmit = async () => {
        try {
            await updateBio({
                displayName: pageName,
                bio,
                avatar: avatarFile,
                thumb: thumbFile,
                socialLinks: buildSocialLinks(),
            });

            alert("Đã cập nhật");
        } catch (error) {
            console.error(error);
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setAvatarFile(selectedFile);
        setActiveImageTarget(null);
    };

    const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setThumbFile(selectedFile);

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                setThumb(reader.result);
                setThumbName(selectedFile.name);
                setActiveImageTarget(null);
            }
        };

        reader.readAsDataURL(selectedFile);
    };

    return (
        <div className="profile-content">
            <div className="profile-card streamer-bio-card">
                <h2>Thông Tin Bio</h2>

                <div className="streamer-bio-grid">
                    <div className="streamer-bio-left">
                        <div className="streamer-cover-wrap" ref={mediaWrapRef}>
                            <button
                                type="button"
                                className={`streamer-image-trigger ${activeImageTarget === "thumb" ? "active" : ""}`}
                                onClick={() => setActiveImageTarget("thumb")}
                                aria-label="Mở cập nhật ảnh bìa"
                            >
                                <img
                                    className="streamer-cover-image"
                                    src={thumb}
                                    alt="cover"
                                />
                                <span
                                    className="streamer-image-overlay"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        thumbInputRef.current?.click();
                                    }}
                                >
                                    Đổi ảnh
                                </span>
                            </button>

                            <input
                                ref={thumbInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleThumbUpload}
                                hidden
                            />

                            <div className="streamer-avatar-wrap">
                                <button
                                    type="button"
                                    className={`streamer-avatar-trigger ${activeImageTarget === "avatar" ? "active" : ""}`}
                                    onClick={() => setActiveImageTarget("avatar")}
                                    aria-label="Mở cập nhật avatar"
                                >
                                    <img
                                        className="streamer-cover-avatar"
                                        src={avatarPreview || bioData?.avatar || "/logo192.png"}
                                        alt="avatar"
                                    />
                                    <span
                                        className="streamer-avatar-overlay"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            avatarInputRef.current?.click();
                                        }}
                                    >
                                        Đổi ảnh
                                    </span>
                                </button>

                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    hidden
                                />
                            </div>
                        </div>

                        {thumbName && (
                            <div className="streamer-thumb-meta">
                                Đã chọn: {thumbName}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Tên trang</label>
                            <input
                                value={pageName}
                                onChange={(e) => setPageName(e.target.value)}
                                placeholder="vd: Duc Gaming"
                            />
                        </div>

                        <div className="form-group">
                            <label>Liên kết</label>
                            <input value={donateLink} readOnly />
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
                                placeholder="Dán link Zalo tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Facebook</label>
                            <input
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                placeholder="Dán link Facebook tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Youtube</label>
                            <input
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                                placeholder="Dán link Youtube tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tiktok</label>
                            <input
                                value={tiktok}
                                onChange={(e) => setTiktok(e.target.value)}
                                placeholder="Dán link Tiktok tại đây"
                            />
                        </div>

                        <div className="form-group">
                            <label>Instagram</label>
                            <input
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="Dán link Instagram tại đây"
                            />
                        </div>

                        <div className="bio-qr-box">
                            <h3>QR Donate Nhanh</h3>

                            {bioData?.token && bioData?.qrUrl && (
                                <QRWidget
                                    qrUrl={bioData.qrUrl}
                                    token={bioData.token}
                                />
                            )}

                            {bioData?.token && !bioData?.qrUrl && (
                                <p>
                                    Streamer chưa cấu hình tài khoản ngân hàng
                                    để tạo QR code.
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
