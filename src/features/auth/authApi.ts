import axiosClient from "../../services/exiosClient";

export const login = (data : any) => {
    return axiosClient.post("/api/auth/login",data)
}

export const loginWithGoogle = async (credential: string) => {
    return axiosClient.post("/api/auth/google", { credential });
}
export const getMe = async () => {
    return axiosClient.get("/api/auth/me");
}