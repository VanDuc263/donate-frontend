import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, loginWithGoogle, getMe } from "./authApi";
import { uploadAvatar, updateProfile } from "../user/userApi";
import { CreateStreamerThunk } from "../streamer/streamerSlice";

/* =======================
   TYPES
======================= */
interface User {
    userId?: number;
    username: string;
    fullName?: string;
    role?: string;
    email?: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    streamer: any | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

/* =======================
   INIT STATE
======================= */
const initialState: AuthState = {
    user: null,
    streamer: null,
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
                user: res.data.user,
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
                user: res.data.user,
                streamer: res.data.streamer,
            };
        } catch (err) {
            return thunkAPI.rejectWithValue("Google login thất bại");
        }
    }
);

export const meThunk = createAsyncThunk(
    "auth/me",
    async (_, thunkAPI) => {
        try {
            const res = await getMe();
            return {
                user: res.data.user,
                streamer: res.data.streamer,
            };
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
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Upload avatar thất bại");
        }
    }
);

/* =======================
   UPDATE PROFILE
======================= */
export const updateProfileThunk = createAsyncThunk(
    "auth/updateProfile",
    async (data: { fullName: string; email: string }, thunkAPI) => {
        try {
            const res = await updateProfile(data);

            return {
                userId: res.data.id,
                username: res.data.username,
                fullName: res.data.fullName,
                email: res.data.email,
                role: res.data.role,
                avatar: res.data.avatar,
            };
        } catch (err: any) {
            return thunkAPI.rejectWithValue("Cập nhật thông tin thất bại");
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

        builder.addCase(loginGoogleThunk.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.streamer = action.payload.streamer;

            localStorage.setItem("token", action.payload.token);
        });

        builder
            .addCase(meThunk.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.streamer = action.payload.streamer;
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

        builder
            .addCase(updateProfileThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfileThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(updateProfileThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder.addCase(CreateStreamerThunk.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.userResponse;

            localStorage.setItem("token", action.payload.token);
        });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;