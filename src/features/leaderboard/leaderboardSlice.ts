import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface LeaderboardEntry {
    rank: number;
    streamerName: string;
    avatar: string;
    totalDonated: number;
    donorCount: number;
    badge: "gold" | "silver" | "bronze" | "none";
    game: string;
    change: "up" | "down" | "same";
}

const mockData: LeaderboardEntry[] = [
    { rank: 1, streamerName: "MixiGaming", avatar: "https://i.pravatar.cc/150?img=1", totalDonated: 246000000, donorCount: 4821, badge: "gold", game: "Free Fire", change: "same" },
    { rank: 2, streamerName: "Tabi", avatar: "https://i.pravatar.cc/150?img=2", totalDonated: 51000000, donorCount: 1203, badge: "silver", game: "PUBG Mobile", change: "up" },
    { rank: 3, streamerName: "Hướng Mêu", avatar: "https://i.pravatar.cc/150?img=3", totalDonated: 38000000, donorCount: 980, badge: "bronze", game: "Liên Quân", change: "up" },
    { rank: 4, streamerName: "Độ Mixi", avatar: "https://i.pravatar.cc/150?img=4", totalDonated: 20000000, donorCount: 654, badge: "none", game: "Minecraft", change: "down" },
    { rank: 5, streamerName: "ProPlayer99", avatar: "https://i.pravatar.cc/150?img=5", totalDonated: 15500000, donorCount: 512, badge: "none", game: "Valorant", change: "up" },
    { rank: 6, streamerName: "StreamQueen", avatar: "https://i.pravatar.cc/150?img=6", totalDonated: 12000000, donorCount: 430, badge: "none", game: "Among Us", change: "same" },
    { rank: 7, streamerName: "GG_Boy", avatar: "https://i.pravatar.cc/150?img=7", totalDonated: 9800000, donorCount: 310, badge: "none", game: "CS2", change: "down" },
    { rank: 8, streamerName: "KhổngLồ", avatar: "https://i.pravatar.cc/150?img=8", totalDonated: 7500000, donorCount: 275, badge: "none", game: "Liên Minh", change: "up" },
    { rank: 9, streamerName: "NightOwl", avatar: "https://i.pravatar.cc/150?img=9", totalDonated: 5200000, donorCount: 198, badge: "none", game: "Genshin", change: "same" },
    { rank: 10, streamerName: "CoderStream", avatar: "https://i.pravatar.cc/150?img=10", totalDonated: 3100000, donorCount: 142, badge: "none", game: "Just Chatting", change: "up" },
];

export const fetchLeaderboard = createAsyncThunk(
    "leaderboard/fetch",
    async (_, thunkAPI) => {
        try {
            // Mock API call
            await new Promise((r) => setTimeout(r, 600));
            return mockData;
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Không tải được bảng xếp hạng");
        }
    }
);

const leaderboardSlice = createSlice({
    name: "leaderboard",
    initialState: {
        data: [] as LeaderboardEntry[],
        loading: false,
        error: null as string | null,
        period: "month" as "week" | "month" | "alltime",
    },
    reducers: {
        setPeriod: (state, action) => {
            state.period = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaderboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchLeaderboard.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setPeriod } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
