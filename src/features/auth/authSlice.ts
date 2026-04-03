import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {login} from './authApi'


export const loginThunk = createAsyncThunk(
    "auth/login",
    async (data: { username: string; password: string }, thunkAPI) => {
        try {
            const res = await login(data)
            alert(res.data.token)
            return {
                token: res.data.token,
                username: data.username
            };
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Sai tài khoản hoặc mật khẩu");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null as any,
        token: localStorage.getItem("token"),
        loading: false,
        error: null as string | null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = { username: action.payload.username };

                localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginThunk.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;