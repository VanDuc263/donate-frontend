import axiosClient from "../../services/exiosClient";

export const donate = (data: any) => {
    return axiosClient.post("/api/donate", data);
};
export const getTopDonor = (token: string) => {
    return axiosClient.get(`/api/donate/${token}`);
};