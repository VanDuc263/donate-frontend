import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminApi } from "./adminApi";

export type AdminRole = "USER" | "STREAMER" | "ADMIN";
export type TxStatus = "SUCCESS" | "PENDING" | "FAILED" | "CANCELLED" | string;

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    fullName?: string | null;
    avatar?: string | null;
    role: AdminRole;
    createdAt?: string | null;
    streamerId?: number | null;
    streamerDisplayName?: string | null;
    walletBalance?: number | null;
}

export interface AdminStreamer {
    id: number;
    userId: number;
    username?: string | null;
    email?: string | null;
    displayName: string;
    token: string;
    avatar?: string | null;
    thumb?: string | null;
    bio?: string | null;
    followers: number;
    createdAt?: string | null;
    totalReceived?: number | null;
    donationCount?: number | null;
}

export interface AdminDonation {
    id: number;
    streamerId?: number | null;
    streamerName?: string | null;
    streamerToken?: string | null;
    donorId?: number | null;
    donorName?: string | null;
    amount: number;
    message?: string | null;
    content?: string | null;
    referenceCode?: string | null;
    status: TxStatus;
    createdAt?: string | null;
}

export interface AdminWalletTransaction {
    id: number;
    walletId?: number | null;
    userId?: number | null;
    username?: string | null;
    type: string;
    amount: number;
    fee?: number | null;
    netAmount?: number | null;
    balanceBefore?: number | null;
    balanceAfter?: number | null;
    referenceType?: string | null;
    referenceId?: number | null;
    status: TxStatus;
    transactionCode?: string | null;
    referenceCode?: string | null;
    createdAt?: string | null;
}

export interface AdminPayment {
    id: number;
    donationId?: number | null;
    provider?: string | null;
    transactionCode?: string | null;
    status: TxStatus;
    createdAt?: string | null;
    streamerId?: number | null;
    donorId?: number | null;
    donorName?: string | null;
    amount?: number | null;
    message?: string | null;
    bankCode?: string | null;
    bankAccountNo?: string | null;
    bankAccountName?: string | null;
    addInfo?: string | null;
    qrUrl?: string | null;
    paidAt?: string | null;
    donationCreated?: boolean | null;
}

export interface AdminPaymentMethod {
    id: number;
    providerType: string;
    bankCode?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    qrTemplate?: string | null;
    qrImageUrl?: string | null;
    active: boolean;
    createdAt?: string | null;
}

export interface AdminStats {
    totalUsers: number;
    totalStreamers: number;
    totalDonations: number;
    successDonations: number;
    pendingDonations: number;
    totalRevenue: number;
    totalWalletBalance?: number | null;
    totalSystemFee?: number | null;
    pendingWalletTransactions: number;
    activePaymentMethods: number;
    successRate: number;
    revenueChart: { month: string; amount: number; count?: number }[];
    userGrowth: { month: string; amount?: number; count: number }[];
    latestDonations: AdminDonation[];
}

interface AdminState {
    stats: AdminStats | null;
    users: AdminUser[];
    streamers: AdminStreamer[];
    donations: AdminDonation[];
    walletTransactions: AdminWalletTransaction[];
    payments: AdminPayment[];
    paymentMethods: AdminPaymentMethod[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    userSearch: string;
    txSearch: string;
    userFilter: "all" | AdminRole;
    txFilter: "all" | string;
}

const errMsg = (err: any, fallback: string) =>
    err?.response?.data?.message || err?.response?.data?.error || fallback;

export const fetchAdminStats = createAsyncThunk("admin/fetchStats", async (_, thunkAPI) => {
    try {
        const res = await adminApi.getStats();
        return res.data as AdminStats;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi tải tổng quan admin"));
    }
});

export const fetchAdminUsers = createAsyncThunk("admin/fetchUsers", async (_, thunkAPI) => {
    try {
        const res = await adminApi.getUsers();
        return res.data as AdminUser[];
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi tải danh sách user"));
    }
});

export const createAdminUser = createAsyncThunk("admin/createUser", async (data: Partial<AdminUser> & { password: string }, thunkAPI) => {
    try {
        const res = await adminApi.createUser(data);
        return res.data as AdminUser;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi tạo user"));
    }
});

export const updateAdminUser = createAsyncThunk("admin/updateUser", async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
        const res = await adminApi.updateUser(id, data);
        return res.data as AdminUser;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi cập nhật user"));
    }
});

export const deleteAdminUser = createAsyncThunk("admin/deleteUser", async (id: number, thunkAPI) => {
    try {
        await adminApi.deleteUser(id);
        return id;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi xóa user"));
    }
});

export const fetchAdminStreamers = createAsyncThunk("admin/fetchStreamers", async (_, thunkAPI) => {
    try {
        const res = await adminApi.getStreamers();
        return res.data as AdminStreamer[];
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi tải streamer"));
    }
});

export const updateAdminStreamer = createAsyncThunk("admin/updateStreamer", async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
        const res = await adminApi.updateStreamer(id, data);
        return res.data as AdminStreamer;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi cập nhật streamer"));
    }
});

export const deleteAdminStreamer = createAsyncThunk("admin/deleteStreamer", async (id: number, thunkAPI) => {
    try {
        await adminApi.deleteStreamer(id);
        return id;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi xóa streamer"));
    }
});

export const fetchAdminTransactions = createAsyncThunk("admin/fetchTransactions", async (_, thunkAPI) => {
    try {
        const [donations, wallets, payments] = await Promise.all([
            adminApi.getDonations(150),
            adminApi.getWalletTransactions(150),
            adminApi.getPayments(150),
        ]);
        return {
            donations: donations.data as AdminDonation[],
            walletTransactions: wallets.data as AdminWalletTransaction[],
            payments: payments.data as AdminPayment[],
        };
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi tải giao dịch"));
    }
});

export const fetchAdminPaymentMethods = createAsyncThunk("admin/fetchPaymentMethods", async (_, thunkAPI) => {
    try {
        const res = await adminApi.getPaymentMethods();
        return res.data as AdminPaymentMethod[];
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi tải phương thức thanh toán"));
    }
});

export const createAdminPaymentMethod = createAsyncThunk("admin/createPaymentMethod", async (data: any, thunkAPI) => {
    try {
        const res = await adminApi.createPaymentMethod(data);
        return res.data as AdminPaymentMethod;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi tạo phương thức thanh toán"));
    }
});

export const updateAdminPaymentMethod = createAsyncThunk("admin/updatePaymentMethod", async ({ id, data }: { id: number; data: any }, thunkAPI) => {
    try {
        const res = await adminApi.updatePaymentMethod(id, data);
        return res.data as AdminPaymentMethod;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi cập nhật phương thức thanh toán"));
    }
});

export const deleteAdminPaymentMethod = createAsyncThunk("admin/deletePaymentMethod", async (id: number, thunkAPI) => {
    try {
        await adminApi.deletePaymentMethod(id);
        return id;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(errMsg(err, "Lỗi xóa phương thức thanh toán"));
    }
});

const initialState: AdminState = {
    stats: null,
    users: [],
    streamers: [],
    donations: [],
    walletTransactions: [],
    payments: [],
    paymentMethods: [],
    loading: false,
    saving: false,
    error: null,
    userSearch: "",
    txSearch: "",
    userFilter: "all",
    txFilter: "all",
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setUserSearch: (state, action: PayloadAction<string>) => { state.userSearch = action.payload; },
        setTxSearch: (state, action: PayloadAction<string>) => { state.txSearch = action.payload; },
        setUserFilter: (state, action: PayloadAction<AdminState["userFilter"]>) => { state.userFilter = action.payload; },
        setTxFilter: (state, action: PayloadAction<string>) => { state.txFilter = action.payload; },
        clearAdminError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        const pending = (state: any) => { state.loading = true; state.error = null; };
        const rejected = (state: any, action: any) => { state.loading = false; state.saving = false; state.error = action.payload || "Có lỗi xảy ra"; };
        const savePending = (state: any) => { state.saving = true; state.error = null; };

        builder.addCase(fetchAdminStats.pending, pending);
        builder.addCase(fetchAdminStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; });
        builder.addCase(fetchAdminStats.rejected, rejected);

        builder.addCase(fetchAdminUsers.pending, pending);
        builder.addCase(fetchAdminUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; });
        builder.addCase(fetchAdminUsers.rejected, rejected);

        builder.addCase(createAdminUser.pending, savePending);
        builder.addCase(createAdminUser.fulfilled, (state, action) => { state.saving = false; state.users.unshift(action.payload); });
        builder.addCase(createAdminUser.rejected, rejected);

        builder.addCase(updateAdminUser.pending, savePending);
        builder.addCase(updateAdminUser.fulfilled, (state, action) => {
            state.saving = false;
            const idx = state.users.findIndex(u => u.id === action.payload.id);
            if (idx >= 0) state.users[idx] = action.payload;
        });
        builder.addCase(updateAdminUser.rejected, rejected);

        builder.addCase(deleteAdminUser.pending, savePending);
        builder.addCase(deleteAdminUser.fulfilled, (state, action) => {
            state.saving = false;
            state.users = state.users.filter(u => u.id !== action.payload);
        });
        builder.addCase(deleteAdminUser.rejected, rejected);

        builder.addCase(fetchAdminStreamers.pending, pending);
        builder.addCase(fetchAdminStreamers.fulfilled, (state, action) => { state.loading = false; state.streamers = action.payload; });
        builder.addCase(fetchAdminStreamers.rejected, rejected);

        builder.addCase(updateAdminStreamer.pending, savePending);
        builder.addCase(updateAdminStreamer.fulfilled, (state, action) => {
            state.saving = false;
            const idx = state.streamers.findIndex(s => s.id === action.payload.id);
            if (idx >= 0) state.streamers[idx] = action.payload;
        });
        builder.addCase(updateAdminStreamer.rejected, rejected);

        builder.addCase(deleteAdminStreamer.pending, savePending);
        builder.addCase(deleteAdminStreamer.fulfilled, (state, action) => {
            state.saving = false;
            state.streamers = state.streamers.filter(s => s.id !== action.payload);
        });
        builder.addCase(deleteAdminStreamer.rejected, rejected);

        builder.addCase(fetchAdminTransactions.pending, pending);
        builder.addCase(fetchAdminTransactions.fulfilled, (state, action) => {
            state.loading = false;
            state.donations = action.payload.donations;
            state.walletTransactions = action.payload.walletTransactions;
            state.payments = action.payload.payments;
        });
        builder.addCase(fetchAdminTransactions.rejected, rejected);

        builder.addCase(fetchAdminPaymentMethods.pending, pending);
        builder.addCase(fetchAdminPaymentMethods.fulfilled, (state, action) => { state.loading = false; state.paymentMethods = action.payload; });
        builder.addCase(fetchAdminPaymentMethods.rejected, rejected);

        builder.addCase(createAdminPaymentMethod.pending, savePending);
        builder.addCase(createAdminPaymentMethod.fulfilled, (state, action) => { state.saving = false; state.paymentMethods.unshift(action.payload); });
        builder.addCase(createAdminPaymentMethod.rejected, rejected);

        builder.addCase(updateAdminPaymentMethod.pending, savePending);
        builder.addCase(updateAdminPaymentMethod.fulfilled, (state, action) => {
            state.saving = false;
            const idx = state.paymentMethods.findIndex(m => m.id === action.payload.id);
            if (idx >= 0) state.paymentMethods[idx] = action.payload;
        });
        builder.addCase(updateAdminPaymentMethod.rejected, rejected);

        builder.addCase(deleteAdminPaymentMethod.pending, savePending);
        builder.addCase(deleteAdminPaymentMethod.fulfilled, (state, action) => {
            state.saving = false;
            state.paymentMethods = state.paymentMethods.filter(m => m.id !== action.payload);
        });
        builder.addCase(deleteAdminPaymentMethod.rejected, rejected);
    },
});

export const { setUserSearch, setTxSearch, setUserFilter, setTxFilter, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
