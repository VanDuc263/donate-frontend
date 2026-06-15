import React, { ChangeEvent, useEffect, useState } from "react";
import {
    getMyProductPromotions,
    ProductPromotionResponse,
    saveMyProductPromotions,
    uploadProductPromotionImage,
} from "../../features/streamer/streamerApi";

type PromotionItem = {
    clientId: string;
    id?: number;
    imageUrl: string;
    title: string;
    link: string;
    uploading: boolean;
};

const createClientId = () =>
    `promotion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyItem = (): PromotionItem => ({
    clientId: createClientId(),
    imageUrl: "",
    title: "",
    link: "",
    uploading: false,
});

const mapResponseToItem = (item: ProductPromotionResponse): PromotionItem => ({
    clientId: createClientId(),
    id: item.id,
    imageUrl: item.imageUrl || "",
    title: item.title || "",
    link: item.url || "",
    uploading: false,
});

const ProductPromotionPage = () => {
    const [items, setItems] = useState<PromotionItem[]>([createEmptyItem()]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState<"success" | "error">("success");

    useEffect(() => {
        let ignore = false;

        const fetchPromotions = async () => {
            try {
                const res = await getMyProductPromotions();
                if (ignore) {
                    return;
                }

                setItems(
                    res.data.length > 0
                        ? res.data.map(mapResponseToItem)
                        : [createEmptyItem()]
                );
            } catch (error) {
                console.error(error);
                if (!ignore) {
                    setStatusType("error");
                    setStatusMessage("Không tải được danh sách quảng bá.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchPromotions();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (!statusMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setStatusMessage("");
        }, 2500);

        return () => window.clearTimeout(timeoutId);
    }, [statusMessage]);

    const updateItem = (
        clientId: string,
        field: "title" | "link" | "imageUrl",
        value: string
    ) => {
        setItems((prev) =>
            prev.map((item) =>
                item.clientId === clientId
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };

    const setUploading = (clientId: string, uploading: boolean) => {
        setItems((prev) =>
            prev.map((item) =>
                item.clientId === clientId
                    ? {
                          ...item,
                          uploading,
                      }
                    : item
            )
        );
    };

    const handleImageChange = async (
        clientId: string,
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file || !file.type.startsWith("image/")) {
            return;
        }

        try {
            setUploading(clientId, true);
            const res = await uploadProductPromotionImage(file);
            updateItem(clientId, "imageUrl", res.data);
            setStatusType("success");
            setStatusMessage("Tải ảnh lên thành công.");
        } catch (error) {
            console.error(error);
            setStatusType("error");
            setStatusMessage("Tải ảnh lên thất bại.");
        } finally {
            setUploading(clientId, false);
        }
    };

    const handleAdd = () => {
        setItems((prev) => [...prev, createEmptyItem()]);
    };

    const handleRemove = (clientId: string) => {
        setItems((prev) => {
            const nextItems = prev.filter((item) => item.clientId !== clientId);
            return nextItems.length > 0 ? nextItems : [createEmptyItem()];
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = items.map((item) => ({
                id: item.id,
                title: item.title,
                url: item.link,
                imageUrl: item.imageUrl,
            }));

            const res = await saveMyProductPromotions(payload);
            setItems(
                res.data.length > 0
                    ? res.data.map(mapResponseToItem)
                    : [createEmptyItem()]
            );
            setStatusType("success");
            setStatusMessage("Đã lưu thay đổi.");
        } catch (error) {
            console.error(error);
            setStatusType("error");
            setStatusMessage("Lưu danh sách quảng bá thất bại.");
        } finally {
            setSaving(false);
        }
    };

    const isUploading = items.some((item) => item.uploading);

    return (
        <div className="profile-content">
            <div className="profile-card promo-card">
                <div className="promo-header">
                    <div>
                        <h2>Quảng bá sản phẩm</h2>
                        <p>Thêm ảnh, tiêu đề và liên kết quảng bá vào trang của bạn.</p>
                    </div>

                    <div className="promo-actions">
                        <button type="button" className="promo-add-btn" onClick={handleAdd}>
                            + Thêm mục
                        </button>
                        <button
                            type="button"
                            className="promo-save-btn"
                            onClick={handleSave}
                            disabled={saving || isUploading || loading}
                        >
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>

                {statusMessage && (
                    <div
                        className={`promo-saved-badge ${
                            statusType === "error" ? "promo-saved-badge-error" : ""
                        }`}
                    >
                        {statusMessage}
                    </div>
                )}

                {loading ? (
                    <div className="promo-empty-state">Đang tải dữ liệu quảng bá...</div>
                ) : (
                    <div className="promo-list">
                        {items.map((item) => (
                            <div key={item.clientId} className="promo-row">
                                <label className="promo-image-box">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title || "product promotion"}
                                        />
                                    ) : (
                                        <span>{item.uploading ? "..." : "+"}</span>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) =>
                                            handleImageChange(item.clientId, event)
                                        }
                                        disabled={item.uploading}
                                    />
                                </label>

                                <input
                                    className="promo-input"
                                    value={item.title}
                                    onChange={(event) =>
                                        updateItem(item.clientId, "title", event.target.value)
                                    }
                                    placeholder="iPhone 17"
                                />

                                <input
                                    className="promo-input"
                                    value={item.link}
                                    onChange={(event) =>
                                        updateItem(item.clientId, "link", event.target.value)
                                    }
                                    placeholder="https://zypage.com/shop/promotion"
                                />

                                <button
                                    type="button"
                                    className="promo-delete-btn"
                                    onClick={() => handleRemove(item.clientId)}
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPromotionPage;
