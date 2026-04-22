import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationItem,
} from "./notificationApi";

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotificationsThunk = createAsyncThunk(
  "notification/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await getNotifications();
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Không lấy được danh sách thông báo");
    }
  }
);

export const fetchUnreadCountThunk = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, thunkAPI) => {
    try {
      const res = await getUnreadCount();
      return res.data.count;
    } catch {
      return thunkAPI.rejectWithValue("Không lấy được số thông báo chưa đọc");
    }
  }
);

export const markNotificationReadThunk = createAsyncThunk(
  "notification/markRead",
  async (id: number, thunkAPI) => {
    try {
      await markNotificationRead(id);
      return id;
    } catch {
      return thunkAPI.rejectWithValue("Không đánh dấu đã đọc được");
    }
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  "notification/markAllRead",
  async (_, thunkAPI) => {
    try {
      await markAllNotificationsRead();
      return true;
    } catch {
      return thunkAPI.rejectWithValue("Không đọc hết được");
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.items.find((n) => n.id === id);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.items = state.items.map((item) => ({
          ...item,
          isRead: true,
        }));
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;