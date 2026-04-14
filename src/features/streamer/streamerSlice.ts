import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {getStreamer, getTopStreamer} from "./streamerApi";

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

export const fetchTopStreamer = createAsyncThunk(
    "streamer/fetchTopStreamer",
    async (_,{rejectWithValue}) => {
        try {
            const res = await getTopStreamer();
            return res.data;
        }catch (err : any){
            return rejectWithValue(err.response?.data || "Error");
        }
    }
)
interface StreamerState {
    streamerDetail: any;
    topStreamers: any[];
    loading: boolean;
    error: any;
}


const initialState: StreamerState = {
    streamerDetail: null,
    topStreamers: [],
    loading: false,
    error: null,
};

const streamerSlice = createSlice({
    name: "streamer",
    initialState,
    reducers: {
        increaseFollowers: (state) => {
            if (state.streamerDetail) state.streamerDetail.followersCount += 1;
        },
        decreaseFollowers: (state) => {
            if (state.streamerDetail) state.streamerDetail.followersCount -= 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStreamer.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.streamerDetail = null;
            })
            .addCase(fetchStreamer.fulfilled, (state, action) => {
                state.loading = false;
                state.streamerDetail = action.payload;
            })
            .addCase(fetchStreamer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        builder
            .addCase(fetchTopStreamer.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopStreamer.fulfilled, (state, action) => {
                state.loading = false;
                state.topStreamers = action.payload;
            })
            .addCase(fetchTopStreamer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { increaseFollowers, decreaseFollowers } = streamerSlice.actions;

export default streamerSlice.reducer;