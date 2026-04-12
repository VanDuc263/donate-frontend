import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface UserProfile {
    username: string;
    displayName: string;
    avatar: string;
    bio: string;
    totalDonated: number;
    totalReceived: number;
    followers: number;
    following: number;
    joinedDate: string;
    favoriteStreamers: string[];
    recentDonations: { streamer: string; amount: number; date: string; message: string }[];
}

const mockProfile: UserProfile = {
    username: "user_demo",
    displayName: "Người Dùng Demo",
    avatar: "https://i.pravatar.cc/150?img=12",
    bio: "Fan cứng của ZyScan 💙 Donate vì đam mê!",
    totalDonated: 1500000,
    totalReceived: 0,
    followers: 24,
    following: 8,
    joinedDate: "2024-01-15",
    favoriteStreamers: ["MixiGaming", "Tabi", "Hướng Mêu"],
    recentDonations: [
        { streamer: "MixiGaming", amount: 50000, date: "2025-04-01", message: "Cày game cùng anh Mixi ❤️" },
        { streamer: "Tabi", amount: 30000, date: "2025-03-28", message: "Ủng hộ chị Tabi!" },
        { streamer: "Hướng Mêu", amount: 20000, date: "2025-03-20", message: "" },
    ],
};

export const fetchProfile = createAsyncThunk(
    "profile/fetch",
    async (_, thunkAPI) => {
        try {
            await new Promise((r) => setTimeout(r, 400));
            return mockProfile;
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Không tải được profile");
        }
    }
);

export const updateProfile = createAsyncThunk(
    "profile/update",
    async (data: Partial<UserProfile>, thunkAPI) => {
        try {
            await new Promise((r) => setTimeout(r, 800));
            return data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Cập nhật thất bại");
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        data: null as UserProfile | null,
        loading: false,
        saving: false,
        error: null as string | null,
        saveSuccess: false,
    },
    reducers: {
        clearSaveStatus: (state) => {
            state.saveSuccess = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => { state.loading = true; })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateProfile.pending, (state) => { state.saving = true; state.saveSuccess = false; })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.saving = false;
                state.saveSuccess = true;
                if (state.data) {
                    state.data = { ...state.data, ...action.payload };
                }
            })
            .addCase(updateProfile.rejected, (state, action: any) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});

export const { clearSaveStatus } = profileSlice.actions;
export default profileSlice.reducer;
