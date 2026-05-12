import axiosClient from "../../services/exiosClient";


export const generateQr = (payload: {
    methodId: number;
    amount: number;
}) => {
    return axiosClient.post("/api/payments/generate-qr", payload);
};