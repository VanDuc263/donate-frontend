import React, { ChangeEvent, useEffect, useState } from "react";

type PromotionItem = {
    id: string;
    imageUrl: string;
    title: string;
    link: string;
};

const STORAGE_KEY = "streamer-product-promotions";

const createEmptyItem = (): PromotionItem => ({
    id: `promotion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageUrl: "",
    title: "",
    link: "",
});

const ProductPromotionPage = () => {
    const [items, setItems] = useState<PromotionItem[]>([createEmptyItem()]);
    const [savedMessage, setSavedMessage] = useState("");

    useEffect(() => {
        try {
            const rawValue = localStorage.getItem(STORAGE_KEY);
            if (!rawValue) return;

            const parsedValue = JSON.parse(rawValue);
            if (!Array.isArray(parsedValue) || parsedValue.length === 0) return;

            setItems(
                parsedValue.map((item: Partial<PromotionItem>, index: number) => ({
                    id: item.id || `promotion-${index}`,
                    imageUrl: item.imageUrl || "",
                    title: item.title || "",
                    link: item.link || "",
                }))
            );
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            setSavedMessage("Đã lưu thay đổi");
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [items]);

    useEffect(() => {
        if (!savedMessage) return;

        const timeoutId = window.setTimeout(() => {
            setSavedMessage("");
        }, 1500);

        return () => window.clearTimeout(timeoutId);
    }, [savedMessage]);

    const updateItem = (id: string, field: keyof PromotionItem, value: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };

    const handleImageChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                updateItem(id, "imageUrl", reader.result);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleAdd = () => {
        setItems((prev) => [...prev, createEmptyItem()]);
    };

    const handleRemove = (id: string) => {
        setItems((prev) => {
            const nextItems = prev.filter((item) => item.id !== id);
            return nextItems.length > 0 ? nextItems : [createEmptyItem()];
        });
    };

    return (
        <div className="profile-content">
            <div className="profile-card promo-card">
                <div className="promo-header">
                    <div>
                        <h2>Quảng cáo</h2>
                        <p>Thêm các liên kết quảng cáo vào trang chủ của bạn</p>
                    </div>

                    <button type="button" className="promo-add-btn" onClick={handleAdd}>
                        + Thêm dịch vụ
                    </button>
                </div>

                {savedMessage && <div className="promo-saved-badge">{savedMessage}</div>}

                <div className="promo-list">
                    {items.map((item) => (
                        <div key={item.id} className="promo-row">
                            <label className="promo-image-box">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title || "promotion"} />
                                ) : (
                                    <span>+</span>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => handleImageChange(item.id, event)}
                                />
                            </label>

                            <input
                                className="promo-input"
                                value={item.title}
                                onChange={(event) =>
                                    updateItem(item.id, "title", event.target.value)
                                }
                                placeholder="iPhone 17"
                            />

                            <input
                                className="promo-input"
                                value={item.link}
                                onChange={(event) =>
                                    updateItem(item.id, "link", event.target.value)
                                }
                                placeholder="https://zypage.com/shop/promotion"
                            />

                            <button
                                type="button"
                                className="promo-delete-btn"
                                onClick={() => handleRemove(item.id)}
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductPromotionPage;
