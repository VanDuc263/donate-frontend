import axiosClient from "../../services/exiosClient";

export interface CreateViolationReportRequest {
    targetType: "STREAMER" | "USER" | "DONATION";
    targetId: number;
    reason: string;
    description?: string;
    evidenceUrl?: string;
}

export const reportApi = {
    createReport: (data: CreateViolationReportRequest) =>
        axiosClient.post("/api/reports", data),

    getMyReports: () =>
        axiosClient.get("/api/reports/my"),
};

export const createViolationReport = (data: CreateViolationReportRequest) =>
    reportApi.createReport(data);
