import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface DashboardStats {
    totalEarned: number;
    thisMonthEarned: number;
    totalDonors: number;
    avgDonation: number;
    topDonor: string;
    recentTransactions: Transaction[];
    chartData: { day: string; amount: number }[];
}

export interface Transaction {
    id: string;
    donorName: string;
    amount: number;
    message: string;
    timestamp: string;
    status: "completed" | "pending" | "failed";
}

const mockStats: DashboardStats = {
    totalEarned: 12500000,
    thisMonthEarned: 3200000,
    totalDonors: 438,
    avgDonation: 28538,
    topDonor: "Merlin_VIP",
    recentTransactions: [
        { id: "tx001", donorName: "Giấu tên", amount: 50000, message: "Keep it up!", timestamp: "2025-04-05 20:31", status: "completed" },
        { id: "tx002", donorName: "Merlin_VIP", amount: 200000, message: "Chill đi bro 🎮", timestamp: "2025-04-05 19:45", status: "completed" },
        { id: "tx003", donorName: "XanhXao99", amount: 10000, message: "", timestamp: "2025-04-05 18:20", status: "completed" },
        { id: "tx004", donorName: "ProGamer", amount: 30000, message: "GG ez!", timestamp: "2025-04-04 22:10", status: "completed" },
        { id: "tx005", donorName: "Giấu tên", amount: 100000, message: "Cứ stream đi anh ơi 😍", timestamp: "2025-04-04 21:00", status: "completed" },
        { id: "tx006", donorName: "Lily_fan", amount: 20000, message: "Ủng hộ", timestamp: "2025-04-04 19:30", status: "pending" },
    ],
    chartData: [
        { day: "T2", amount: 350000 },
        { day: "T3", amount: 520000 },
        { day: "T4", amount: 280000 },
        { day: "T5", amount: 640000 },
        { day: "T6", amount: 420000 },
        { day: "T7", amount: 890000 },
        { day: "CN", amount: 1100000 },
    ],
};

export const fetchDashboard = createAsyncThunk(
    "dashboard/fetch",
    async (_, thunkAPI) => {
        try {
            await new Promise((r) => setTimeout(r, 500));
            return mockStats;
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Không tải được dashboard");
        }
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        data: null as DashboardStats | null,
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => { state.loading = true; })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;
