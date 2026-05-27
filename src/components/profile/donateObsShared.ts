import previewGif from "../../assets/images/animations/anhdong.gif";
import altPreviewGif from "../../assets/images/animations/image_01.gif";

declare const require: {
    context: (
        path: string,
        deep?: boolean,
        filter?: RegExp
    ) => {
        keys: () => string[];
        <T>(id: string): T;
    };
};

export type OverlayDonationData = {
    donorName: string;
    amount: number | string;
    message?: string | null;
};

export type OverlayPreviewConfig = {
    alert?: {
        position?: string;
        content?: string;
        duration?: number;
        image?: {
            enabled?: boolean;
            asset_id?: number;
        };
        sound?: {
            volume?: number;
            enabled?: boolean;
            asset_id?: number;
            custom_name?: string;
            custom_url?: string;
        };
    };
    style?: {
        font?: {
            name_size?: number;
            message_size?: number;
        };
        colors?: {
            text?: string;
            amount?: string;
            message?: string;
            background?: string;
        };
    };
    tts?: {
        volume?: number;
        enabled?: boolean;
        min_amount?: number;
    };
};

export type ObsConfig = OverlayPreviewConfig & {
    tts: {
        volume: number;
        enabled: boolean;
        min_amount: number;
    };
    alert: {
        image: {
            enabled: boolean;
            asset_id: number;
        };
        sound: {
            volume: number;
            enabled: boolean;
            asset_id: number;
            custom_name?: string;
            custom_url?: string;
        };
        content: string;
        duration: number;
        position: string;
    };
    style: {
        font: {
            name_size: number;
            message_size: number;
        };
        colors: {
            text: string;
            amount: string;
            message: string;
            background: string;
        };
    };
    filter: {
        link: boolean;
        spam: boolean;
        keywords: string[];
    };
    leaderboard: {
        enabled: boolean;
        min_amount: number;
    };
};

export type BuiltInSoundOption = {
    id: number;
    label: string;
    url: string;
};

export type ImageOption = {
    id: number;
    url: string;
};

export const FIXED_ALERT_CONTENT_TEMPLATE = "{name}\nđã donate {amount} đồng cho bạn.\n{message}";

export const defaultPreviewDonation: OverlayDonationData = {
    donorName: "Taziu",
    amount: "100.000",
    message: "Hello streamer"
};

export const defaultObsConfig: ObsConfig = {
    tts: { volume: 80, enabled: true, min_amount: 8000 },
    alert: {
        image: { enabled: true, asset_id: 2 },
        sound: { volume: 80, enabled: true, asset_id: 1, custom_name: "", custom_url: "" },
        content: FIXED_ALERT_CONTENT_TEMPLATE,
        duration: 10,
        position: "center"
    },
    style: {
        font: { name_size: 18, message_size: 16 },
        colors: {
            text: "#7dd3fc",
            amount: "#facc15",
            message: "#e5e7eb",
            background: "#020617"
        }
    },
    filter: { link: true, spam: true, keywords: [] },
    leaderboard: { enabled: true, min_amount: 5000 }
};

const soundContext = require.context("../../assets/images/sounds", false, /\.(mp3|wav|ogg|m4a)$/);

export const builtInSoundOptions: BuiltInSoundOption[] = soundContext
    .keys()
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((filePath, index) => ({
        id: index + 1,
        label: filePath.replace("./", "").replace(/\.[^.]+$/, ""),
        url: soundContext<string>(filePath)
    }));

export const imageOptions: ImageOption[] = [
    { id: 1, url: previewGif },
    { id: 2, url: altPreviewGif }
];

export const normalizeAlertContent = (value?: string) => {
    const lines = (value || "")
        .split(/\r?\n/)
        .map((line) => line.trim());

    const normalizedLines = [
        lines[0] || "{name}",
        lines[1] || "đã donate {amount} đồng cho bạn.",
        lines[2] || "{message}"
    ];

    return normalizedLines.join("\n");
};

export const mergeObsConfig = (data: Partial<ObsConfig> = {}): ObsConfig => ({
    ...defaultObsConfig,
    ...data,
    alert: {
        ...defaultObsConfig.alert,
        ...data.alert,
        image: {
            ...defaultObsConfig.alert.image,
            ...data.alert?.image
        },
        sound: {
            ...defaultObsConfig.alert.sound,
            ...data.alert?.sound
        },
        content: normalizeAlertContent(data.alert?.content || FIXED_ALERT_CONTENT_TEMPLATE)
    },
    tts: {
        ...defaultObsConfig.tts,
        ...data.tts
    },
    style: {
        ...defaultObsConfig.style,
        ...data.style,
        font: {
            ...defaultObsConfig.style.font,
            ...data.style?.font
        },
        colors: {
            ...defaultObsConfig.style.colors,
            ...data.style?.colors
        }
    },
    filter: {
        ...defaultObsConfig.filter,
        ...data.filter
    },
    leaderboard: {
        ...defaultObsConfig.leaderboard,
        ...data.leaderboard
    }
});

export const getImageUrlByAssetId = (assetId?: number) =>
    imageOptions.find((item) => item.id === assetId)?.url || imageOptions[0].url;

export const getSoundUrlFromConfig = (config: OverlayPreviewConfig) => {
    const customSelected =
        config.alert?.sound?.asset_id === 0 && Boolean(config.alert?.sound?.custom_url);

    if (customSelected) {
        return config.alert?.sound?.custom_url;
    }

    return builtInSoundOptions.find((sound) => sound.id === config.alert?.sound?.asset_id)?.url;
};
