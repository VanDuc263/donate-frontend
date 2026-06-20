import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://c2da-2402-800-6f61-ec4-bd24-b7bb-97d3-927e.ngrok-free.app",
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;