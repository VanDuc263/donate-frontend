import axiosClient from "../../services/exiosClient";

export const getFollowers = () => {
    return axiosClient.get('/api/follows/followers')
}
export const getFollowing = () => {
    return axiosClient.get("/api/follows/following")
}