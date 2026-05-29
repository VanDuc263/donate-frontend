import axiosClient from "../../services/exiosClient";

export const getMyWallet = () => {
    return axiosClient.get("/api/wallets/me")
}
export const getWalletTransactions = () => {
    return axiosClient.get("/api/wallet-transactions")
}
export const createWithdrawal = (payload: { amount: number }) => {
    return axiosClient.post("/api/withdrawals", payload)
}
