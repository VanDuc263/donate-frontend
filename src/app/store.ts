import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import registerReducer from "../features/auth/registerSlice";
import profileReducer from "../features/profile/profileSlice";
import leaderboardReducer from "../features/leaderboard/leaderboardSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        register: registerReducer,
        leaderboard: leaderboardReducer,
        dashboard: dashboardReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;