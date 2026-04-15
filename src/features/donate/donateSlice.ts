import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { donate } from "./donateApi";

interface Donation {
    userName: string;
    amount: number;
    streamerId: number;
}

interface DonateState {
    donations: Donation[];
    loading: boolean;
    error: string | null;
}

const initialState: DonateState = {
    donations: [],
    loading: false,
    error: null
};

export const donateThunk = createAsyncThunk(
    "donate/create",
    async (data: any, thunkAPI) => {
        try {
            const res = await donate(data);
            return res.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue("donate không thành công");
        }
    }
);

const donateSlice = createSlice({
    name: "donate",
    initialState,
    reducers: {
        addDonateRealtime: (state, action: PayloadAction<Donation>) => {
            state.donations.unshift(action.payload);

            if (state.donations.length > 20) {
                state.donations.pop();
            }
        },

        setDonations: (state, action: PayloadAction<Donation[]>) => {
            state.donations = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(donateThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(donateThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(donateThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { addDonateRealtime,setDonations } = donateSlice.actions;
export default donateSlice.reducer;