import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStreamer } from "./streamerApi";

export const fetchStreamer = createAsyncThunk(
    "streamer/fetchStreamer",
    async (token: string, { rejectWithValue }) => {
        try {
            const res = await getStreamer(token);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Error");
        }
    }
);

interface StreamerState {
    data: any;
    loading: boolean;
    error: any;
}

const initialState: StreamerState = {
    data: null,
    loading: false,
    error: null,
};

const streamerSlice = createSlice({
    name: "streamer",
    initialState,
    reducers: {
        increaseFollowers: (state) => {
            if (state.data) state.data.followersCount += 1;
        },
        decreaseFollowers: (state) => {
            if (state.data) state.data.followersCount -= 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStreamer.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.data = null;
            })
            .addCase(fetchStreamer.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchStreamer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { increaseFollowers, decreaseFollowers } = streamerSlice.actions;

export default streamerSlice.reducer;