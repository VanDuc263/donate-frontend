import axiosClient from "../../services/exiosClient";

export const getStreamer = async (token : String) => {
    return axiosClient.get(`/api/streamers/${token}`)
}

