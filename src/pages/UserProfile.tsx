import "../styles/user_profile.css";
import React from "react";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { Outlet } from "react-router-dom";

const UserProfile = () => {
    return (
        <div className="profile-page">
            <ProfileSidebar />
            <Outlet />
        </div>
    );
};

export default UserProfile;
