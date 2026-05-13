import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMyWallet } from "./walletApi";

export interface Wallet {
    id: number;
    userId: number;
    balance: number;
    frozenBalance: number;
    currency: string;
    createdAt: string;
}

interface WalletState {
    wallet: Wallet | null;
    loading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    wallet: null,
    loading: false,
    error: null,
};

export const getMyWalletThunk = createAsyncThunk(
    "wallet/getMyWallet",
    async (_, thunkAPI) => {
        try {
            const response = await getMyWallet();

            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Get wallet failed"
            );
        }
    }
);

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
            setWallet: (state, action) => {
                state.wallet = action.payload;
        },

    },

    extraReducers: (builder) => {
        builder

            // pending
            .addCase(getMyWalletThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            // fulfilled
            .addCase(getMyWalletThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.wallet = action.payload;
            })

            // rejected
            .addCase(getMyWalletThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setWallet } = walletSlice.actions;
export default walletSlice.reducer;