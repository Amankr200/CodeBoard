import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome, FiUser, FiAward, FiSettings, FiLogOut, FiBarChart2, FiCode, FiCalendar, FiX
} from 'react-icons/fi';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        document.getElementById('sidebar').classList.remove('open');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            <aside className="sidebar" id="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">CB</div>
                    <div className="sidebar-logo-text">Code<span>Board</span></div>
                    <button className="mobile-close-btn" onClick={toggleSidebar}>
                        <FiX />
                    </button>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-title">Profile Tracker</div>
                    <nav className="sidebar-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <span className="icon"><FiHome /></span>
                            Portfolio
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-title">Event Tracker</div>
                    <nav className="sidebar-nav">
                        <NavLink to="/contests" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <span className="icon"><FiCalendar /></span>
                            Contests
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-title">Community</div>
                    <nav className="sidebar-nav">
                        <NavLink to="/leaderboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <span className="icon"><FiAward /></span>
                            Leaderboard
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-title">Account</div>
                    <nav className="sidebar-nav">
                        <NavLink to="/edit-profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <span className="icon"><FiSettings /></span>
                            Edit Profile
                        </NavLink>
                        <NavLink to={`/profile/${user?.username}`} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <span className="icon"><FiUser /></span>
                            Public Profile
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="" />
                            ) : (
                                getInitials(user?.fullName)
                            )}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.fullName || 'Student'}</div>
                            <div className="sidebar-user-email">@{user?.username || 'user'}</div>
                        </div>
                    </div>
                    <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%', color: '#EF4444', marginTop: '8px' }}>
                        <span className="icon"><FiLogOut /></span>
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    );
}
