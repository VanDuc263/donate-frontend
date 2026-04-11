import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import "../styles/admin.css";

const navItems = [
    { to: "/admin",           icon: "📊", label: "Tổng quan",        end: true },
    { to: "/admin/users",     icon: "👥", label: "Người dùng" },
    { to: "/admin/streamers", icon: "🎮", label: "Streamers" },
    { to: "/admin/transactions", icon: "💳", label: "Giao dịch" },
    { to: "/admin/reports",   icon: "🚨", label: "Báo cáo vi phạm" },
    { to: "/admin/settings",  icon: "⚙️", label: "Cài đặt hệ thống" },
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={`admin-shell ${collapsed ? "collapsed" : ""}`}>
            {/* ── Sidebar ── */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">⚡</span>
                    {!collapsed && <span className="brand-text">ZyScan Admin</span>}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!collapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
                        {collapsed ? "▶" : "◀"}
                    </button>
                    {!collapsed && (
                        <button
                            className="sidebar-logout"
                            onClick={() => { dispatch(logout()); navigate("/login"); }}
                        >
                            🚪 Đăng xuất
                        </button>
                    )}
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="admin-main">
                {/* Top bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="topbar-menu" onClick={() => setCollapsed(c => !c)}>☰</button>
                        <div className="topbar-breadcrumb">Admin Panel</div>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-badge" title="14 báo cáo chờ xử lý">🚨 14</div>
                        <div className="topbar-user">
                            <img src="https://i.pravatar.cc/150?img=1" alt="admin" />
                            <span>{user?.username || "Admin"}</span>
                        </div>
                        <button className="topbar-home" onClick={() => navigate("/")}>
                            🏠 Về trang chủ
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
