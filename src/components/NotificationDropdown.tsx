import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../app/store";
import {
  fetchNotificationsThunk,
  fetchUnreadCountThunk,
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
} from "../features/notification/notificationSlice";

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationDropdown = ({ open, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { items, loading } = useSelector((state: RootState) => state.notification);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (open && token) {
      dispatch(fetchNotificationsThunk());
      dispatch(fetchUnreadCountThunk());
    }
  }, [open, token, dispatch]);

  const handleClickItem = async (id: number, redirectUrl?: string | null) => {
    await dispatch(markNotificationReadThunk(id));
    onClose();

    if (redirectUrl) {
      navigate(redirectUrl);
    }
  };

  const handleReadAll = async () => {
    await dispatch(markAllNotificationsReadThunk());
  };

  if (!open) return null;

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <strong>Thông báo</strong>
        <button onClick={handleReadAll}>Đọc hết</button>
      </div>

      <div className="notification-body">
        {loading && <div className="notification-empty">Đang tải...</div>}

        {!loading && items.length === 0 && (
          <div className="notification-empty">Chưa có thông báo nào</div>
        )}

        {!loading &&
          items.map((item) => (
            <div
              key={item.id}
              className={`notification-item ${item.isRead ? "read" : "unread"}`}
              onClick={() => handleClickItem(item.id, item.redirectUrl)}
            >
              <div className="notification-title">{item.title}</div>
              <div className="notification-content">{item.content}</div>
              <div className="notification-time">
                {new Date(item.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;