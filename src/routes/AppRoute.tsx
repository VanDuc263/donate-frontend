import { Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useSelector } from "react-redux";

import Login from "../pages/Login";
import Home from "../pages/Home";
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
import { RootState } from "../app/store";
import DonateOverlayPage from "../components/DonateOverlayPage";
import CreateDonatePage from "../components/profile/CreateDonatePage";
import ProfileInfo from "../components/profile/ProfileInfo";
import StreamerBioInfo from "../components/profile/StreamerBioInfo";
import DonateObsSettings from "../components/profile/DonateObsSettings";
import PaymentSettings from "../components/profile/PaymentSettings";
import SePayGuidePage from "../components/profile/SePayGuidePage";
import DonationHistoryPage from "../components/profile/DonationHistoryPage";
import FollowingPage from "../components/profile/FollowingPage";
import WalletPage from "../components/profile/WalletPage";
import ProductPromotionPage from "../components/profile/ProductPromotionPage";
import BlockedUsersPage from "../components/profile/BlockedUsersPage";
import StatisticsPage from "../components/profile/StatisticsPage";

function normalizeRole(role?: string | null) {
    return String(role || "")
        .replace("ROLE_", "")
        .trim()
        .toUpperCase();
}

function getStoredUserRole() {
    try {
        const rawUser = localStorage.getItem("user");
        if (!rawUser) return "";

        const parsedUser = JSON.parse(rawUser);
        return normalizeRole(parsedUser?.role);
    } catch {
        return "";
    }
}

function getRoleFromToken(token?: string | null) {
    try {
        if (!token) return "";

        const parts = token.split(".");
        if (parts.length < 2) return "";

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");

        const payload = JSON.parse(atob(padded));
        return normalizeRole(payload?.role);
    } catch {
        return "";
    }
}

function useCurrentRole() {
    const reduxUser = useSelector((state: RootState) => state.auth.user);
    const reduxToken = useSelector((state: RootState) => state.auth.token);

    const storedToken =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    return (
        normalizeRole(reduxUser?.role) ||
        getStoredUserRole() ||
        getRoleFromToken(reduxToken || storedToken)
    );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
    const token =
        useSelector((state: RootState) => state.auth.token) ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
    const token =
        useSelector((state: RootState) => state.auth.token) ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const role = useCurrentRole();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role && role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

function NonAdminRoute({ children }: { children: ReactNode }) {
    const role = useCurrentRole();

    if (role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}

function HomeRedirect() {
    const role = useCurrentRole();

    if (role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <Home />;
}

const AppRoute = () => {
    return (
        <Routes>
            {/* Public + User routes with Header */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomeRedirect />} />

                <Route
                    path="/donate"
                    element={
                        <NonAdminRoute>
                            <DonatePage />
                        </NonAdminRoute>
                    }
                />

                <Route
                    path="/account/profile"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<ProfileInfo />} />
                    <Route path="bio" element={<StreamerBioInfo />} />
                </Route>

                <Route
                    path="/account/payment"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<PaymentSettings />} />
                    <Route path="sepay-guide" element={<SePayGuidePage />} />
                </Route>

                <Route
                    path="/account/donate-obs"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<DonateObsSettings />} />
                </Route>

                <Route
                    path="/account/product-promotion"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<ProductPromotionPage />} />
                </Route>

                <Route
                    path="/account/create-streamer"
                    element={
                        <NonAdminRoute>
                            <CreateDonatePage />
                        </NonAdminRoute>
                    }
                />

                <Route
                    path="/account/donations"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<DonationHistoryPage />} />
                </Route>

                <Route
                    path="/account/following"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<FollowingPage />} />
                </Route>

                <Route
                    path="/account/wallet"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<WalletPage />} />
                </Route>

                <Route
                    path="/account/blocked-users"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<BlockedUsersPage />} />
                </Route>

                <Route
                    path="/account/statistics"
                    element={
                        <NonAdminRoute>
                            <UserProfile />
                        </NonAdminRoute>
                    }
                >
                    <Route index element={<StatisticsPage />} />
                </Route>

                <Route path="/streamer/:token" element={<StreamerDetail />} />
                <Route path="/leaderboard" element={<Leaderboard />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/overlay/:streamerId" element={<DonateOverlayPage />} />

            {/* Admin routes */}
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="streamers" element={<AdminStreamers />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoute;
