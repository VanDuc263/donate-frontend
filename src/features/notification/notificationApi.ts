import axiosClient from "../../services/exiosClient";

export interface NotificationItem {
  id: number;
  type: "SYSTEM" | "ACCOUNT" | "SECURITY" | "DONATION" | "PAYMENT" | "FOLLOW" | "STREAMER";
  title: string;
  content: string;
  isRead: boolean;
  redirectUrl?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export const getNotifications = () => {
  return axiosClient.get<NotificationItem[]>("/api/notifications");
};

export const getUnreadCount = () => {
  return axiosClient.get<{ count: number }>("/api/notifications/unread-count");
};

export const markNotificationRead = (id: number) => {
  return axiosClient.put(`/api/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return axiosClient.put("/api/notifications/read-all");
};