import axiosClient from "../../services/exiosClient";

export const adminApi = {
    getStats: () => axiosClient.get("/api/admin/overview"),

    getUsers: () => axiosClient.get("/api/admin/users"),
    createUser: (data: any) => axiosClient.post("/api/admin/users", data),
    updateUser: (id: number, data: any) => axiosClient.put(`/api/admin/users/${id}`, data),
    deleteUser: (id: number) => axiosClient.delete(`/api/admin/users/${id}`),

    getStreamers: () => axiosClient.get("/api/admin/streamers"),
    getStreamer: (id: number) => axiosClient.get(`/api/admin/streamers/${id}`),
    updateStreamer: (id: number, data: any) => axiosClient.put(`/api/admin/streamers/${id}`, data),
    deleteStreamer: (id: number) => axiosClient.delete(`/api/admin/streamers/${id}`),

    getDonations: (limit = 100) => axiosClient.get(`/api/admin/transactions/donations?limit=${limit}`),
    getPayments: (limit = 100) => axiosClient.get(`/api/admin/transactions/payments?limit=${limit}`),
    getWalletTransactions: (limit = 100) => axiosClient.get(`/api/admin/transactions/wallets?limit=${limit}`),

    getPaymentMethods: () => axiosClient.get("/api/admin/payment-methods"),
    createPaymentMethod: (data: any) => axiosClient.post("/api/admin/payment-methods", data),
    updatePaymentMethod: (id: number, data: any) => axiosClient.put(`/api/admin/payment-methods/${id}`, data),
    deletePaymentMethod: (id: number) => axiosClient.delete(`/api/admin/payment-methods/${id}`),

    getReports: (params?: { status?: string; targetType?: string }) =>
        axiosClient.get("/api/admin/reports", { params }),
    getReportDetail: (id: number) => axiosClient.get(`/api/admin/reports/${id}`),
    updateReportStatus: (id: number, data: { status: string; adminNote?: string }) =>
        axiosClient.put(`/api/admin/reports/${id}/status`, data),
    deleteReport: (id: number) => axiosClient.delete(`/api/admin/reports/${id}`),
    getReportPenalty: (userId: number) => axiosClient.get(`/api/admin/reports/penalties/${userId}`),
};
