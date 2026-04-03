import axiosClient from "../../services/exiosClient";

export const donate = (data: any) => {
    return axiosClient.post("/api/donate", data);
};