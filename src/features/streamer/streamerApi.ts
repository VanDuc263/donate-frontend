import axiosClient from "../../services/exiosClient";
import {StreamerInfo} from "./streamerSlice";
import exiosClient from "../../services/exiosClient";

export const getStreamer = async (token : String) => {
    return axiosClient.get(`/api/streamers/${token}`)
}

export const getTopStreamer =  async () => {
    return axiosClient.get("/api/streamers/top")
}
export const createStreamer = (data : StreamerInfo) => {
    const formData = new FormData()

    formData.append("displayName", data.displayName);
    formData.append("token", data.token);
    formData.append("type", data.type);
    formData.append("file", data.file);


    return exiosClient.post("/api/streamers/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });}
