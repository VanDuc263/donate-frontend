import axiosClient from "../../services/exiosClient";

export interface DonationHistoryItem {
    id: number;
    streamerId: number;
    streamerName?: string;
    streamerToken?: string;
    streamerAvatar?: string;
    donorId?: number;
    donorName?: string;
    amount: number;
    message?: string;
    status?: string;
    createdAt?: string | number[] | null;
    content?: string;
    referenceCode?: string;
    blockedByStreamer?: boolean;
}
export interface donationPayload {
    streamerId: number;
    donorId?: number | null;
    donorName?: string;
    amount: number;
    message?: string;
    methodId? : number;
}


export const donate = (data: any) => {
    return axiosClient.post("/api/donate/create", data);
};

export const getTopDonor = (token: string) => {
    return axiosClient.get(`/api/donate/${token}/top`);
};

export const getLatestDonationsByStreamerId = (streamerId: number) => {
    return axiosClient.get(`/api/donate/${streamerId}/donations?limit=10`);
};

export const getLatestDonation = () => {
    return axiosClient.get("/api/donate/top");
};

// Lịch sử donate dùng cho trang /account/donations
export const getMyDonationHistory = (limit: number = 30) => {
    return axiosClient.get<DonationHistoryItem[]>(`/api/donate/history?limit=${limit}`);
};

export const getMySentDonationHistory = (limit: number = 30) => {
    return axiosClient.get<DonationHistoryItem[]>(`/api/donate/history/sent?limit=${limit}`);
};

export const getMyReceivedDonationHistory = (limit: number = 30) => {
    return axiosClient.get<DonationHistoryItem[]>(`/api/donate/history/received?limit=${limit}`);
};
export const donateByWallet = (data : donationPayload) => {
    return axiosClient.post(`/api/donate/wallet`,data);
};
export const createPaymentBankQr = (data: donationPayload) => {
    return axiosClient.post("/api/donate/bank-qr", data);
};
export const createPaymentQr = (data: donationPayload) => {
    return axiosClient.post("/api/donate/qr", data);
};
