import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import DonateForm from "../features/donate/components/DonateForm";
import {ReactNode} from "react";
import MainLayout from "../utils/MainLayout";
import DonatePage from "../pages/DonatePage";
import StreamerDetail from "../features/streamer/components/StreamerDetail";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Leaderboard from "../pages/Leaderboard";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";


function ProtectedRoute(props: { children: ReactNode }) {
    return (
        <div>
            {props.children}
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

                {/* Detail streamer */}
                <Route path="/streamer/:id" element={<StreamerDetail />} />
                <Route path="/leaderboard" element={<Leaderboard />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
            </Route>
             

            

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoute;