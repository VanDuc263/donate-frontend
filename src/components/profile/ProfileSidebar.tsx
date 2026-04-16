import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import UserMenu from "./UserMenu";
import StreamerMenu from "./StreamerMenu";

const ProfileSidebar = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    const role = user?.role?.replace("ROLE_", "");

    return (
        <div className="profile-sidebar">
            <div className="profile-user">
                <img src={user?.avatar || ""} alt="avatar" />
                <h3>{user?.fullName || "User"}</h3>
            </div>

            {role === "USER" ? <UserMenu /> : <StreamerMenu />}
        </div>
    );
};

export default ProfileSidebar;