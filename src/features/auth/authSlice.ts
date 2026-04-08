import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {getMe, login, loginWithGoogle} from './authApi'


export const loginThunk = createAsyncThunk(
    "auth/login",
    async (data: { username: string; password: string }, thunkAPI) => {
        try {
            const res = await login(data)
            return {
                token: res.data.token,
                username: data.username
            };
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Sai tài khoản hoặc mật khẩu");
        }
    }
);
export const loginGoogleThunk = createAsyncThunk(
    "auth/googleLogin",
    async (credential: string, thunkAPI) => {
        try {
            const res = await loginWithGoogle(credential);
            console.log(res.data)
            return {
                token: res.data.token,
                username: res.data.username || "GoogleUser",
            };
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Google login thất bại");
        }
    }
);
export const meThunk = createAsyncThunk(
    "auth/me",
    async (_:void, thunkAPI) => {
        try {
            const res = await getMe();
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Token không hợp lệ");
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
            })
            .addCase(meThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(meThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(meThunk.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem("token");
            })
            .addCase(loginGoogleThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginGoogleThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = { username: action.payload.username };
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginGoogleThunk.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;