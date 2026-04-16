import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import {ReactNode} from "react";
import MainLayout from "../utils/MainLayout";
import DonatePage from "../pages/DonatePage";
import StreamerDetail from "../features/streamer/components/StreamerDetail";
import Register from "../pages/Register";
import Leaderboard from "../pages/Leaderboard";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import AdminOverview from "../admin/pages/AdminOverview";
import AdminUsers from "../admin/pages/AdminUsers";
import AdminStreamers from "../admin/pages/AdminStreamers";
import AdminTransactions from "../admin/pages/AdminTransactions";
import AdminReports from "../admin/pages/AdminReports";
import AdminSettings from "../admin/pages/AdminSettings";
import AdminLayout from "../admin/AdminLayout";
import UserProfile from "../pages/UserProfile";
import {useSelector} from "react-redux";
import {RootState} from "../app/store";
import DonateOverlayPage from "../components/DonateOverlayPage";
import CreateDonatePage from "../components/profile/CreateDonatePage";


function ProtectedRoute({ children }: { children: ReactNode }) {
    const token = useSelector((state: RootState) => state.auth.token);
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

const AppRoute = () => {
    return (
        <Routes>
            {/* ── Public + User routes (with Header) ── */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/donate" element={<DonatePage />} />

                <Route path="/account/profile" element={<UserProfile/>}/>
                <Route path="/account/create-streamer" element={<CreateDonatePage/>}/>
                <Route path="/account/donations" element={<CreateDonatePage/>}/>
                <Route path="/account/following" element={<CreateDonatePage/>}/>

                {/* Detail streamer */}
                <Route path="/streamer/:token" element={<StreamerDetail />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Route>

            {/* ── Auth routes (no layout) ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/overlay/:streamerId" element={<DonateOverlayPage />} />

            {/* ── Admin routes (AdminLayout with sidebar) ── */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="streamers" element={<AdminStreamers />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoute;