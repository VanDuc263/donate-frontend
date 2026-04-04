import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import DonateForm from "../features/donate/components/DonateForm";
import {ReactNode} from "react";
import MainLayout from "../utils/MainLayout";
import DonatePage from "../pages/DonatePage";


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
            <Route element={<MainLayout/>}>
                <Route path="/" element={<Home />} />
                <Route
                    path="/donate"
                    element={
                        <ProtectedRoute>
                            <DonateForm />
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="/login" element={<Login />} />
        </Routes>
    );
};

export default AppRoute;