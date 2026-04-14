import axiosClient from "../../services/exiosClient";

export const getStreamer = async (token : String) => {
    return axiosClient.get(`/api/streamers/${token}`)
}

export const getTopStreamer =  async () => {
    return axiosClient.get("/api/streamers/top")
}

