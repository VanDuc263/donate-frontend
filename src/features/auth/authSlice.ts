import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, loginWithGoogle, getMe } from "./authApi";
import { uploadAvatar } from "../user/userApi";

/* =======================
   TYPES
======================= */
interface User {
    id?: number;
    username: string;
    fullName? : string;
    role? : string;
    email?: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

/* =======================
   INIT STATE
======================= */
const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null,
};

/* =======================
   LOGIN
======================= */
export const loginThunk = createAsyncThunk(
    "auth/login",
    async (data: { username: string; password: string }, thunkAPI) => {
        try {
            const res = await login(data);

            return {
                token: res.data.token,
                user: {
                    username: data.username,
                },
            };
        } catch (err) {
            return thunkAPI.rejectWithValue("Sai tài khoản hoặc mật khẩu");
        }
    }
);

/* =======================
   GOOGLE LOGIN
======================= */
export const loginGoogleThunk = createAsyncThunk(
    "auth/googleLogin",
    async (credential: string, thunkAPI) => {
        try {
            const res = await loginWithGoogle(credential);

            return {
                token: res.data.token,
                user: {
                    username: res.data.username || "GoogleUser",
                    email: res.data.email,
                    avatar: res.data.avatar,
                },
            };
        } catch (err) {
            return thunkAPI.rejectWithValue("Google login thất bại");
        }
    }
);

/* =======================
   GET ME
======================= */
export const meThunk = createAsyncThunk(
    "auth/me",
    async (_, thunkAPI) => {
        try {
            const res = await getMe();
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Token không hợp lệ");
        }
    }
);

/* =======================
   UPLOAD AVATAR
======================= */
export const uploadAvatarThunk = createAsyncThunk(
    "auth/uploadAvatar",
    async (file: File, thunkAPI) => {
        try {
            const res = await uploadAvatar(file);
            console.log(res.data)
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Upload avatar thất bại");
        }
    }
);

/* =======================
   SLICE
======================= */
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {

        /* ===== LOGIN ===== */
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;

                localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginThunk.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });

        /* ===== GOOGLE LOGIN ===== */
        builder
            .addCase(loginGoogleThunk.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.user = action.payload.user;

                localStorage.setItem("token", action.payload.token);
            });

        /* ===== GET ME ===== */
        builder
            .addCase(meThunk.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(meThunk.rejected, (state) => {
                state.user = null;
                state.token = null;
                localStorage.removeItem("token");
            });

        builder
            .addCase(uploadAvatarThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
                state.loading = false;
                if (state.user) {
                    state.user.avatar = action.payload;
                }
            })
            .addCase(uploadAvatarThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });


    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;