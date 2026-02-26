import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PLATFORMS } from '../utils/constants';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts';
import {
    FiRefreshCw, FiExternalLink, FiPlus, FiTrash2, FiMapPin,
    FiBook, FiAward, FiEye, FiClock, FiBarChart2, FiMenu
} from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from 'react-icons/fa';

export default function Dashboard() {
    const { user, refreshUser, setUser } = useAuth();
    const [rank, setRank] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddPlatform, setShowAddPlatform] = useState(false);
    const [platformToAdd, setPlatformToAdd] = useState('');
    const [platformUsername, setPlatformUsername] = useState('');
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/user/dashboard');
            setRank(res.data.rank);
            setTotalUsers(res.data.totalUsers);
            // Also update the user state in context to ensure everything is in sync
            if (res.data.user) {
                setUser(res.data.user);
            }
        } catch (err) {
            console.error('Dashboard error:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.post('/user/refresh');
            // Re-fetch the full user from /auth/me to ensure fresh data
            await refreshUser();
            await fetchDashboardData();
            toast.success('Stats refreshed!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Refresh failed');
        } finally {
            setRefreshing(false);
        }
    };

    const handleLinkPlatform = async (e) => {
        e.preventDefault();
        if (!platformToAdd || !platformUsername) {
            toast.error('Please select a platform and enter username');
            return;
        }
        setLinking(true);
        try {
            const res = await api.post('/user/platform', {
                platform: platformToAdd,
                username: platformUsername
            });
            setUser(res.data);
            await fetchDashboardData();
            toast.success(`${PLATFORMS[platformToAdd]?.name} linked successfully!`);
            setShowAddPlatform(false);
            setPlatformToAdd('');
            setPlatformUsername('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to link platform');
        } finally {
            setLinking(false);
        }
    };

    const handleRemovePlatform = async (platform) => {
        try {
            const res = await api.delete(`/user/platform/${platform}`);
            setUser(res.data);
            toast.success(`${PLATFORMS[platform]?.name} removed`);
        } catch (err) {
            toast.error('Failed to remove platform');
        }
    };

    const handleTogglePublic = async () => {
        try {
            const res = await api.put('/user/profile', {
                isPublic: !user.isPublic
            });
            setUser(res.data);
            toast.success(`Profile is now ${!user.isPublic ? 'public' : 'private'}`);
        } catch (err) {
            toast.error('Failed to update visibility');
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Calculate aggregated stats
    const totalProblems = user?.totalProblemsSolved || 0;
    const linkedPlatforms = Object.entries(user?.platforms || {}).filter(([, p]) => p.username);
    const unlinkedPlatforms = Object.keys(PLATFORMS).filter(p => !user?.platforms?.[p]?.username);

    // Topic-wise data for bar chart
    const topicData = useMemo(() => {
        const stats = user?.platforms?.leetcode?.stats;
        if (!stats || !stats.topicWise) return [];

        let rawData = stats.topicWise;
        // If it's a Mongoose Map, it has a .get() method or we can use .toObject() or just entries()
        if (typeof rawData.entries === 'function') {
            rawData = Object.fromEntries(rawData.entries());
        } else if (typeof rawData.get === 'function') {
            rawData = Object.fromEntries(rawData);
        }

        const entries = Object.entries(rawData || {});
        return entries
            .filter(([, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }));
    }, [user]);

    // DSA difficulty data for donut chart
    const difficultyData = useMemo(() => {
        const lc = user?.platforms?.leetcode?.stats;
        if (!lc) return [];
        return [
            { name: 'Easy', value: lc.easySolved || 0, color: '#22C55E' },
            { name: 'Medium', value: lc.mediumSolved || 0, color: '#F59E0B' },
            { name: 'Hard', value: lc.hardSolved || 0, color: '#EF4444' }
        ].filter(d => d.value > 0);
    }, [user]);

    const lcTotal = (user?.platforms?.leetcode?.stats?.easySolved || 0) +
        (user?.platforms?.leetcode?.stats?.mediumSolved || 0) +
        (user?.platforms?.leetcode?.stats?.hardSolved || 0);

    const timeSinceRefresh = user?.lastRefreshed
        ? Math.floor((Date.now() - new Date(user.lastRefreshed).getTime()) / 1000)
        : null;

    const formatTimeSince = (seconds) => {
        if (!seconds) return 'Never';
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const barColors = ['#F97316', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1'];

    return (
        <>
            <div className="header glass">
                <div className="header-left">
                    <button className="mobile-menu-btn" onClick={() => document.getElementById('sidebar').classList.add('open')}>
                        <FiMenu />
                    </button>
                    <h1 className="header-title" style={{ fontFamily: 'Outfit, sans-serif' }}>My Portfolio</h1>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{ borderRadius: '12px' }}
                    >
                        <FiRefreshCw className={refreshing ? 'spinning' : ''} />
                        <span className="hide-mobile">{refreshing ? 'Refreshing...' : 'Refresh Now'}</span>
                    </button>
                </div>
            </div>

            <div className="page-container">
                <div className="dashboard-grid animate-fade-in">
                    {/* Left Sidebar */}
                    <div className="dashboard-sidebar">
                        {/* Profile Card */}
                        <div className="card profile-card" style={{ boxShadow: 'var(--shadow-lg)' }}>
                            <div className="profile-card-header"></div>
                            <div className="profile-toggle">
                                <label>Public</label>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={user?.isPublic || false}
                                        onChange={handleTogglePublic}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="profile-avatar-large">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="" />
                                ) : (
                                    getInitials(user?.fullName)
                                )}
                            </div>

                            <div className="profile-name">{user?.fullName}</div>
                            <div className="profile-handle">@{user?.username}</div>

                            {user?.bio && <div className="profile-bio">{user.bio}</div>}

                            <div style={{ padding: '0 24px 20px' }}>
                                <Link to="/leaderboard" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>
                                    View Leaderboard
                                </Link>
                            </div>

                            <div className="profile-meta">
                                {user?.location && (
                                    <div className="profile-meta-item">
                                        <FiMapPin className="icon" /> {user.location}
                                    </div>
                                )}
                                {user?.collegeName && (
                                    <div className="profile-meta-item">
                                        <FiBook className="icon" /> {user.collegeName}
                                    </div>
                                )}
                                <div className="profile-meta-item">
                                    <FiEye className="icon" /> Profile Views: {user?.profileViews || 0}
                                </div>
                                <div className="profile-meta-item">
                                    <FiClock className="icon" /> Last Refresh: {formatTimeSince(timeSinceRefresh)}
                                </div>
                            </div>

                            {(user?.socialLinks?.github || user?.socialLinks?.linkedin || user?.socialLinks?.twitter || user?.socialLinks?.portfolio) && (
                                <div className="profile-social-links" style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                    {user.socialLinks.github && <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="social-icon-btn"><FaGithub /></a>}
                                    {user.socialLinks.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="social-icon-btn"><FaLinkedin /></a>}
                                    {user.socialLinks.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer" className="social-icon-btn"><FaTwitter /></a>}
                                    {user.socialLinks.portfolio && <a href={user.socialLinks.portfolio} target="_blank" rel="noreferrer" className="social-icon-btn"><FaGlobe /></a>}
                                </div>
                            )}
                        </div>

                        {/* Platforms Card */}
                        <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
                            <div className="card-header">
                                <div>
                                    <div className="card-title">Link Platforms</div>
                                    <div className="card-subtitle">{linkedPlatforms.length} platforms connected</div>
                                </div>
                            </div>
                            <div className="platform-list">
                                {linkedPlatforms.map(([key, platform]) => {
                                    const P = PLATFORMS[key];
                                    if (!P) return null;
                                    const Icon = P.icon;
                                    return (
                                        <div className="platform-list-item" key={key}>
                                            <div className="platform-info">
                                                <div className="platform-logo" style={{ background: P.color }}>
                                                    <Icon />
                                                </div>
                                                <span className="platform-name">{P.name}</span>
                                            </div>
                                            <div className="platform-actions">
                                                <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px' }}>✓</span>
                                                <button onClick={() => handleRemovePlatform(key)} style={{ color: 'var(--error)', padding: '4px', display: 'flex' }}>
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {unlinkedPlatforms.length > 0 && (
                                <button className="add-platform-btn" onClick={() => setShowAddPlatform(true)} style={{ marginTop: '16px' }}>
                                    <FiPlus /> Add Platform
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="dashboard-main">
                        {/* Stats Row */}
                        <div className="dashboard-stats-row">
                            <div className="card stat-card" style={{ borderLeft: '4px solid var(--info)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="stat-label">Total Questions</div>
                                <div className="stat-value">{totalProblems}</div>
                            </div>
                            <div className="card stat-card" style={{ borderLeft: '4px solid var(--brand-primary)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="stat-label">Total Contests</div>
                                <div className="stat-value">{user?.totalContests || 0}</div>
                            </div>
                            <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="stat-label">C Score</div>
                                <div className="stat-value">{user?.cScore?.toFixed(0) || 0}</div>
                            </div>
                            <div className="card stat-card" style={{ borderLeft: '4px solid var(--success)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="stat-label">Global Rank</div>
                                <div className="stat-value">#{rank || '—'}</div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="dashboard-charts-row">
                            <div className="card chart-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">LeetCode Stats</div>
                                        <div className="card-subtitle">Difficulty breakdown</div>
                                    </div>
                                </div>
                                <div className="chart-container" style={{ position: 'relative', height: '220px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={difficultyData}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {difficultyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-overlay" style={{
                                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>{lcTotal}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solved</div>
                                    </div>
                                </div>
                                <div className="difficulty-legend" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                                    {difficultyData.map((d, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></span>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{d.name}</span>
                                            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card chart-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="card-title">Topic Wise Strength</div>
                                        <div className="card-subtitle">Performance by tags</div>
                                    </div>
                                    <span className="badge" style={{ background: '#ffa11622', color: '#ffa116', border: '1px solid #ffa11644' }}>LeetCode</span>
                                </div>
                                <div className="chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {topicData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topicData} layout="vertical" margin={{ left: -10, right: 30, top: 10, bottom: 10 }}>
                                                <XAxis type="number" hide />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={110}
                                                    style={{ fontSize: '12px', fontWeight: '600', fill: 'var(--text-secondary)' }}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                                />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                                                    {topicData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>
                                            <FiBarChart2 style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }} />
                                            <p style={{ fontSize: '14px' }}>No topic data available yet.</p>
                                            <p style={{ fontSize: '12px' }}>Try refreshing your LeetCode stats.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contest Ratings */}
                        <div className="card-header" style={{ margin: '16px 0 8px' }}>
                            <div className="card-title" style={{ fontSize: '20px', fontFamily: 'Outfit, sans-serif' }}>Platform Rankings</div>
                        </div>
                        <div className="dashboard-ratings-row">
                            {/* LeetCode Rating */}
                            <div className="card rating-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                                <div className="rating-logo" style={{ background: '#FFF7ED', color: '#FFA116' }}>
                                    <PLATFORMS.leetcode.icon />
                                </div>
                                <div className="rating-info">
                                    <div className="rating-platform">LEETCODE</div>
                                    <div className="rating-value">{user?.platforms?.leetcode?.stats?.contestRating || 0}</div>
                                    <div className="rating-max">Contests: {user?.platforms?.leetcode?.stats?.contestsAttended || 0}</div>
                                </div>
                            </div>

                            {/* GFG Score */}
                            <div className="card rating-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                                <div className="rating-logo" style={{ background: '#F0FDF4', color: '#2F8D46' }}>
                                    <PLATFORMS.gfg.icon />
                                </div>
                                <div className="rating-info">
                                    <div className="rating-platform">GEEKSFORGEEKS</div>
                                    <div className="rating-value">{user?.platforms?.gfg?.stats?.score || 0}</div>
                                    <div className="rating-max">Rank: {user?.platforms?.gfg?.stats?.institute_rank || '—'}</div>
                                </div>
                            </div>

                            {/* HackerRank Badges */}
                            <div className="card rating-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                                <div className="rating-logo" style={{ background: '#E9E3FF', color: '#422AFB' }}>
                                    <PLATFORMS.hackerrank.icon />
                                </div>
                                <div className="rating-info">
                                    <div className="rating-platform">HACKERRANK</div>
                                    <div className="rating-value">{user?.platforms?.hackerrank?.stats?.badges || 0}</div>
                                    <div className="rating-max">Badges earned</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform-wise Problems Solved */}
            <div className="card" style={{ marginTop: '24px', boxShadow: 'var(--shadow-md)' }}>
                <div className="card-header">
                    <div className="card-title">Problems Solved by Platform</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '16px' }}>
                    {Object.entries(PLATFORMS).map(([key, platform]) => {
                        const stats = user?.platforms?.[key]?.stats;
                        const Icon = platform.icon;
                        if (!user?.platforms?.[key]?.username) return null;
                        const solved = key === 'leetcode' ? stats?.totalSolved
                            : key === 'hackerrank' ? stats?.badges
                                : stats?.totalSolved;
                        return (
                            <div key={key} style={{
                                padding: '16px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-light)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                backgroundColor: '#fff'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: platform.color + '15',
                                    color: platform.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px'
                                }}>
                                    <Icon />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{platform.name}</div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>{solved || 0}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Platform Modal */}
            {showAddPlatform && (
                <div className="modal-overlay" onClick={() => setShowAddPlatform(false)}>
                    <div className="modal animate-slide-up glass" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '24px' }}>
                        <div className="modal-title" style={{ fontFamily: 'Outfit, sans-serif' }}>Add Platform</div>
                        <form onSubmit={handleLinkPlatform}>
                            <div className="form-group">
                                <label className="form-label">Select Platform</label>
                                <select
                                    className="form-select"
                                    value={platformToAdd}
                                    onChange={(e) => setPlatformToAdd(e.target.value)}
                                    style={{ borderRadius: '12px' }}
                                >
                                    <option value="">Choose a platform...</option>
                                    {unlinkedPlatforms.map(p => (
                                        <option key={p} value={p}>{PLATFORMS[p]?.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Enter your username or profile URL"
                                    value={platformUsername}
                                    onChange={(e) => setPlatformUsername(e.target.value)}
                                    style={{ borderRadius: '12px' }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddPlatform(false)}
                                    style={{ borderRadius: '12px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={linking}
                                    style={{ borderRadius: '12px' }}
                                >
                                    {linking ? 'Linking...' : 'Link Platform'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin-anim { to { transform: rotate(360deg); } }
                .spinning { animation: spin-anim 1s linear infinite; }
                .social-icon-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    transition: all var(--transition-base);
                }
                .social-icon-btn:hover {
                    background: var(--brand-primary);
                    color: white;
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-brand);
                }
                .chart-overlay {
                    pointer-events: none;
                }
            `}</style>
        </>
    );
}
