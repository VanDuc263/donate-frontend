import "../styles/user_profile.css";
import React from "react";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileInfo from "../components/profile/ProfileInfo";

const UserProfile = () => {
    return (
        <div className="profile-page">
            <ProfileSidebar />
            <ProfileInfo />
        </div>
    );
};

export default UserProfile;