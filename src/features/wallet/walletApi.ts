import axiosClient from "../../services/exiosClient";

export const getMyWallet = () => {
    return axiosClient.get("/api/wallets/me")
}