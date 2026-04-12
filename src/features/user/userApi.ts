import axiosClient from "../../services/exiosClient";

export const uploadAvatar = (file : File) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/api/user/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

}