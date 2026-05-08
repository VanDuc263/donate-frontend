import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/exiosClient";

export const registerThunk = createAsyncThunk(
    "register/create",
    async (
        data: { username: string; email: string; password: string },
        thunkAPI
    ) => {
        try {
            const res = await axiosClient.post("/api/auth/register", data);
            return res.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                err?.response?.data?.message || "Đăng ký thất bại"
            );
        }
    }
);

const registerSlice = createSlice({
    name: "register",
    initialState: {
        loading: false,
        success: false,
        error: null as string | null,
    },
    reducers: {
        resetRegister: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(registerThunk.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.error = null;
            })
            .addCase(registerThunk.rejected, (state, action: any) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            });
    },
});

export const { resetRegister } = registerSlice.actions;
export default registerSlice.reducer;