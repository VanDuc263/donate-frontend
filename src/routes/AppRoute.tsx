import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import {ReactNode} from "react";
import MainLayout from "../utils/MainLayout";
import DonatePage from "../pages/DonatePage";
import StreamerDetail from "../features/streamer/components/StreamerDetail";
import UserProfile from "../pages/UserProfile";


function ProtectedRoute(props: { children: ReactNode }) {
    return (
        <div>
            <DonatePage></DonatePage>
        </div>
    );
}

const AppRoute = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />

                {/* Trang list hoặc landing donate */}
                <Route path="/donate" element={<DonatePage />} />

                <Route path="/user/profile" element={<UserProfile/>}/>

                {/* Detail streamer */}
                <Route path="/streamer/:id" element={<StreamerDetail />} />
            </Route>

            <Route path="/login" element={<Login />} />
        </Routes>
    );
};

export default AppRoute;