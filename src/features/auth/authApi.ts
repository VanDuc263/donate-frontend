import axiosClient from "../../services/exiosClient";

export const login = (data : any) => {
    return axiosClient.post("/api/auth/login",data)
}