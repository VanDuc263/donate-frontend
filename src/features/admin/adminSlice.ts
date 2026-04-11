import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: "admin" | "streamer" | "viewer";
    status: "active" | "banned" | "pending";
    avatar: string;
    joinedDate: string;
    totalDonated: number;
    totalReceived: number;
    lastActive: string;
}

export interface AdminTransaction {
    id: string;
    from: string;
    to: string;
    amount: number;
    message: string;
    timestamp: string;
    status: "completed" | "pending" | "failed" | "refunded";
    method: "wallet" | "qr" | "bank";
}

export interface AdminStreamer {
    id: string;
    username: string;
    avatar: string;
    game: string;
    totalEarned: number;
    donorCount: number;
    status: "active" | "suspended" | "pending";
    verified: boolean;
    joinedDate: string;
}

export interface AdminStats {
    totalUsers: number;
    totalStreamers: number;
    totalDonations: number;
    totalRevenue: number;
    activeToday: number;
    newThisMonth: number;
    pendingReports: number;
    successRate: number;
    revenueChart: { month: string; amount: number }[];
    userGrowth: { month: string; count: number }[];
    topCategories: { name: string; percent: number }[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockStats: AdminStats = {
    totalUsers: 12847,
    totalStreamers: 438,
    totalDonations: 94201,
    totalRevenue: 1_890_500_000,
    activeToday: 2341,
    newThisMonth: 892,
    pendingReports: 14,
    successRate: 97.4,
    revenueChart: [
        { month: "T10", amount: 120_000_000 },
        { month: "T11", amount: 185_000_000 },
        { month: "T12", amount: 240_000_000 },
        { month: "T1", amount: 195_000_000 },
        { month: "T2", amount: 320_000_000 },
        { month: "T3", amount: 410_000_000 },
        { month: "T4", amount: 420_500_000 },
    ],
    userGrowth: [
        { month: "T10", count: 820 },
        { month: "T11", count: 1040 },
        { month: "T12", count: 1580 },
        { month: "T1", count: 1120 },
        { month: "T2", count: 1650 },
        { month: "T3", count: 2100 },
        { month: "T4", count: 892 },
    ],
    topCategories: [
        { name: "Free Fire", percent: 34 },
        { name: "PUBG Mobile", percent: 22 },
        { name: "Liên Quân", percent: 18 },
        { name: "Minecraft", percent: 12 },
        { name: "Khác", percent: 14 },
    ],
};

const mockUsers: AdminUser[] = Array.from({ length: 20 }, (_, i) => ({
    id: `u${i + 1}`,
    username: ["MixiGaming","Tabi","HuongMeu","ProGamer","StreamQueen","NightOwl","GGBoy","Lily","Merlin","Zeno","Alice","Bob","Carol","Dave","Eve","Frank","Grace","Hank","Ivy","Jack"][i],
    email: `user${i + 1}@example.com`,
    role: i === 0 ? "admin" : i < 5 ? "streamer" : "viewer",
    status: i === 7 ? "banned" : i === 12 ? "pending" : "active",
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    joinedDate: `2024-0${(i % 9) + 1}-${String((i * 3 + 1) % 28 + 1).padStart(2, "0")}`,
    totalDonated: Math.floor(Math.random() * 5_000_000),
    totalReceived: i < 5 ? Math.floor(Math.random() * 50_000_000) : 0,
    lastActive: `${Math.floor(Math.random() * 30) + 1} ngày trước`,
}));

const mockTransactions: AdminTransaction[] = Array.from({ length: 25 }, (_, i) => ({
    id: `tx${String(i + 1).padStart(4, "0")}`,
    from: mockUsers[Math.floor(Math.random() * 10) + 5].username,
    to: mockUsers[Math.floor(Math.random() * 5)].username,
    amount: [10000, 20000, 50000, 100000, 200000, 500000][Math.floor(Math.random() * 6)],
    message: i % 3 === 0 ? "Ủng hộ streamer!" : i % 4 === 0 ? "GG ez 😎" : "",
    timestamp: `2025-04-${String(Math.floor(Math.random() * 10) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 23)).padStart(2, "0")}:${String(Math.floor(Math.random() * 59)).padStart(2, "0")}`,
    status: i === 3 ? "failed" : i === 8 ? "refunded" : i % 7 === 0 ? "pending" : "completed",
    method: ["wallet", "qr", "bank"][i % 3] as any,
}));

const mockStreamers: AdminStreamer[] = mockUsers.filter(u => u.role === "streamer").map((u, i) => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    game: ["Free Fire", "PUBG Mobile", "Liên Quân", "Minecraft", "Valorant"][i % 5],
    totalEarned: u.totalReceived,
    donorCount: Math.floor(Math.random() * 2000) + 100,
    status: u.status === "banned" ? "suspended" : "active",
    verified: i < 3,
    joinedDate: u.joinedDate,
}));

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAdminStats = createAsyncThunk("admin/fetchStats", async (_, thunkAPI) => {
    try {
        await new Promise(r => setTimeout(r, 600));
        return mockStats;
    } catch { return thunkAPI.rejectWithValue("Lỗi tải stats"); }
});

export const fetchAdminUsers = createAsyncThunk("admin/fetchUsers", async (_, thunkAPI) => {
    try {
        await new Promise(r => setTimeout(r, 400));
        return mockUsers;
    } catch { return thunkAPI.rejectWithValue("Lỗi tải users"); }
});

export const fetchAdminTransactions = createAsyncThunk("admin/fetchTransactions", async (_, thunkAPI) => {
    try {
        await new Promise(r => setTimeout(r, 400));
        return mockTransactions;
    } catch { return thunkAPI.rejectWithValue("Lỗi tải transactions"); }
});

export const fetchAdminStreamers = createAsyncThunk("admin/fetchStreamers", async (_, thunkAPI) => {
    try {
        await new Promise(r => setTimeout(r, 400));
        return mockStreamers;
    } catch { return thunkAPI.rejectWithValue("Lỗi tải streamers"); }
});

export const banUser = createAsyncThunk("admin/banUser", async (userId: string, thunkAPI) => {
    await new Promise(r => setTimeout(r, 500));
    return userId;
});

export const unbanUser = createAsyncThunk("admin/unbanUser", async (userId: string, thunkAPI) => {
    await new Promise(r => setTimeout(r, 500));
    return userId;
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        stats: null as AdminStats | null,
        users: [] as AdminUser[],
        transactions: [] as AdminTransaction[],
        streamers: [] as AdminStreamer[],
        loading: false,
        error: null as string | null,
        userSearch: "",
        txSearch: "",
        userFilter: "all" as "all" | "active" | "banned" | "pending",
        txFilter: "all" as "all" | "completed" | "pending" | "failed" | "refunded",
    },
    reducers: {
        setUserSearch: (state, action) => { state.userSearch = action.payload; },
        setTxSearch: (state, action) => { state.txSearch = action.payload; },
        setUserFilter: (state, action) => { state.userFilter = action.payload; },
        setTxFilter: (state, action) => { state.txFilter = action.payload; },
    },
    extraReducers: builder => {
        // Stats
        builder.addCase(fetchAdminStats.pending, state => { state.loading = true; });
        builder.addCase(fetchAdminStats.fulfilled, (state, action) => {
            state.loading = false; state.stats = action.payload;
        });
        builder.addCase(fetchAdminStats.rejected, (state, action: any) => {
            state.loading = false; state.error = action.payload;
        });
        // Users
        builder.addCase(fetchAdminUsers.fulfilled, (state, action) => {
            state.users = action.payload;
        });
        // Transactions
        builder.addCase(fetchAdminTransactions.fulfilled, (state, action) => {
            state.transactions = action.payload;
        });
        // Streamers
        builder.addCase(fetchAdminStreamers.fulfilled, (state, action) => {
            state.streamers = action.payload;
        });
        // Ban / Unban
        builder.addCase(banUser.fulfilled, (state, action) => {
            const u = state.users.find(u => u.id === action.payload);
            if (u) u.status = "banned";
        });
        builder.addCase(unbanUser.fulfilled, (state, action) => {
            const u = state.users.find(u => u.id === action.payload);
            if (u) u.status = "active";
        });
    },
});

export const { setUserSearch, setTxSearch, setUserFilter, setTxFilter } = adminSlice.actions;
export default adminSlice.reducer;
