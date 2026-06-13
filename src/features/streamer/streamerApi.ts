import axiosClient from "../../services/exiosClient";
import {StreamerInfo} from "./streamerSlice";
import exiosClient from "../../services/exiosClient";

export interface SearchStreamerResponse {
    streamerId: number;
    displayName: string;
    token: string;
    avatar: string;
    thumb: string;
    followers: number;
}

export interface TopStreamerResponse {
    streamerId: number;
    displayName: string;
    totalAmount: number;
    avatar: string;
    token: string;
}

export const getStreamer = async (token : String) => {
    return axiosClient.get(`/api/streamers/${token}`)
}

export const getTopStreamer =  async () => {
    return axiosClient.get("/api/streamers/top")
}
export const searchStreamers = async (keyword: string) => {
    return axiosClient.get<SearchStreamerResponse[]>("/api/streamers/search", {
        params: { q: keyword },
    });
};
export const createStreamer = (data : StreamerInfo) => {
    const formData = new FormData()

    formData.append("displayName", data.displayName);
    formData.append("token", data.token);
    formData.append("type", data.type);
    formData.append("file", data.file);


    return exiosClient.post("/api/streamers/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}
export const getObsSetting = async () => {
    return  axiosClient.get('api/settings/me')

}
export const updateObsSetting = async (config : any) => {
    return axiosClient.post('api/settings/update', config)

}
export const savePaymentAccount = async (payload : any) => {
    return axiosClient.post('api/payment-account/save', payload)

}
export const getBankAccount = async () => {
    return axiosClient.get('api/payment-account/bank-account')

}
export const getQrUrl = async () => {
    return axiosClient.get('api/payment-account/qr')
}
export const followStreamer = (token: string) => {
    return axiosClient.post(`/api/follows/${token}`);
};

export const unfollowStreamer = (token: string) => {
    return axiosClient.delete(`/api/follows/${token}`);
};
export const convertTextToSpeech = (payload : any) => {
    return axiosClient.post(`/api/tts/fpt`,payload);

}
export type SocialPlatform =
    | "FACEBOOK"
    | "YOUTUBE"
    | "TIKTOK"
    | "INSTAGRAM"
    | "ZALO";

export interface StreamerSocialLinkResponse {
    platform: SocialPlatform;
    url: string;
    visible: boolean;
}

export interface StreamerBioResponse {
    streamerId: number;
    displayName: string;
    avatar: string;
    thumb: string;
    bio: string | null;
    token: string;
    followers: number;
    qrUrl: string | null;
    socialLinks: StreamerSocialLinkResponse[];
}

export interface UpdateStreamerBioRequest {
    displayName: string;
    bio: string;
    avatar?: File | null;
    thumb?: File | null;

    socialLinks: {
        platform: SocialPlatform;
        url: string;
        visible: boolean;
    }[];
}

export const updateBio = (payload: UpdateStreamerBioRequest) => {
    const formData = new FormData();

    formData.append("displayName", payload.displayName);
    formData.append("bio", payload.bio);

    if (payload.avatar) {
        formData.append("avatar", payload.avatar);
    }

    if (payload.thumb) {
        formData.append("thumb", payload.thumb);
    }

    formData.append(
        "socialLinks",
        JSON.stringify(payload.socialLinks)
    );

    return axiosClient.put(
        "/api/streamers/me/bio",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const getBio = () => {
    return axiosClient.get<StreamerBioResponse>("/api/streamers/me/bio");
};


