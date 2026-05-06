import axiosClient from "./exiosClient";

export const createPaymentQr = (data: {
  streamerId: number;
  donorId?: number | null;
  donorName?: string;
  amount: number;
  message?: string;
}) => {
  return axiosClient.post("/api/payments/create-qr", data);
};

export const getPaymentStatus = (orderCode: string) => {
  return axiosClient.get(`/api/payments/${orderCode}/status`);
};

export const transactionSyncTest = (data: {
  content: string;
  amount: number;
}) => {
  return axiosClient.post("/vqr/bank/api/transaction-sync", data);
};