import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import registerReducer from "../features/auth/registerSlice";
import profileReducer from "../features/profile/profileSlice";
import leaderboardReducer from "../features/leaderboard/leaderboardSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import adminReducer from "../features/admin/adminSlice";
import streamerReducer from "../features/streamer/streamerSlice"
import donateReducer from "../features/donate/donateSlice"
import notificationReducer from "../features/notification/notificationSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        streamer : streamerReducer,
        donate: donateReducer,
        profile: profileReducer,
        register: registerReducer,
        leaderboard: leaderboardReducer,
        dashboard: dashboardReducer,
        admin: adminReducer,
        notification: notificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;