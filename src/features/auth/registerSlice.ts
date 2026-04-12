import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const registerThunk = createAsyncThunk(
    "register/create",
    async (data: { username: string; email: string; password: string }, thunkAPI) => {
        try {
            // Mock registration
            await new Promise((r) => setTimeout(r, 1000));
            if (data.username === "taken") {
                throw new Error("Username đã tồn tại");
            }
            return { username: data.username, email: data.email };
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.message || "Đăng ký thất bại");
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
            })
            .addCase(registerThunk.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetRegister } = registerSlice.actions;
export default registerSlice.reducer;
