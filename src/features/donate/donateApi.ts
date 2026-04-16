import axiosClient from "../../services/exiosClient";

export const donate = (data: any) => {
    return axiosClient.post("/api/donate/create", data);
};
export const getTopDonor = (token: string) => {
    return axiosClient.get(`/api/donate/${token}`);
};
export const getLatestDonationsByStreamerId = (streamerId: number) => {
    return axiosClient.get(`/api/donate/${streamerId}/donations?limit=10`);
};

export const getLatestDonation = () => {
    return axiosClient.get("/api/donate/top")
}