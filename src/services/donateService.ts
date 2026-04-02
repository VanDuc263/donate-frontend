import axios  from 'axios';

const API = "http://localhost:8080"

export const donate = (data : any) => {
    return axios.post(`${API}/api/donate`, data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true // nếu backend dùng cookie / session
    })
}

