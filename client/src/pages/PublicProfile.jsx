import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { PLATFORMS } from '../utils/constants';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts';
import { FiMapPin, FiBook, FiExternalLink, FiShare2 } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function PublicProfile() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        setLoading(true);
        setIsPrivate(false);
        try {
            const res = await api.get(`/user/profile/${username}`);
            setProfile(res.data);
        } catch (err) {
            console.error('Profile error:', err);
            if (err.response?.status === 403 && err.response?.data?.isPrivate) {
                setIsPrivate(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Profile URL copied!');
    };

    const topicData = useMemo(() => {
        const topicWise = profile?.platforms?.leetcode?.stats?.topicWise;
        if (!topicWise) return [];
        const entries = Object.entries(topicWise instanceof Map ? Object.fromEntries(topicWise) : topicWise);
        return entries.sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
    }, [profile]);

    const difficultyData = useMemo(() => {
        const lc = profile?.platforms?.leetcode?.stats;
        if (!lc) return [];
        return [
            { name: 'Easy', value: lc.easySolved || 0, color: '#22C55E' },
            { name: 'Medium', value: lc.mediumSolved || 0, color: '#F59E0B' },
            { name: 'Hard', value: lc.hardSolved || 0, color: '#EF4444' }
        ].filter(d => d.value > 0);
    }, [profile]);

    const lcTotal = (profile?.platforms?.leetcode?.stats?.easySolved || 0) +
        (profile?.platforms?.leetcode?.stats?.mediumSolved || 0) +
        (profile?.platforms?.leetcode?.stats?.hardSolved || 0);

    const linkedPlatforms = Object.entries(profile?.platforms || {}).filter(([, p]) => p.username);
    const barColors = ['#F97316', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1'];

    if (loading) {
        return (
            <>
                <div className="header">
                    <h1 className="header-title">Profile</h1>
                </div>
                <div className="loading-container">
                    <div className="spinner" />
                    <p>Loading profile...</p>
                </div>
            </>
        );
    }

    if (isPrivate) {
        return (
            <>
                <div className="header">
                    <h1 className="header-title">Private Profile</h1>
                </div>
                <div className="page-container">
                    <div className="empty-state">
                        <div className="empty-icon">🔒</div>
                        <h3>This profile is private</h3>
                        <p>User has chosen to keep their profile anonymous.</p>
                    </div>
                </div>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <div className="header">
                    <h1 className="header-title">Profile</h1>
                </div>
                <div className="page-container">
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h3>User not found</h3>
                        <p>The profile you're looking for doesn't exist.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="header">
                <h1 className="header-title">Profile — @{profile.username}</h1>
                <button className="btn btn-secondary btn-sm" onClick={handleShare}>
                    <FiShare2 /> Share Profile
                </button>
            </div>

            <div className="page-container animate-fade-in">
                <div className="dashboard-grid">
                    {/* Left Sidebar */}
                    <div className="dashboard-sidebar">
                        <div className="card profile-card">
                            <div className="profile-avatar-large">
                                {profile.profilePicture ? (
                                    <img src={profile.profilePicture} alt="" />
                                ) : (
                                    getInitials(profile.fullName)
                                )}
                            </div>
                            <div className="profile-name">{profile.fullName}</div>
                            <div className="profile-handle">@{profile.username}</div>
                            {profile.bio && <div className="profile-bio">{profile.bio}</div>}

                            <div className="profile-meta">
                                {profile.location && (
                                    <div className="profile-meta-item"><FiMapPin className="icon" /> {profile.location}</div>
                                )}
                                {profile.collegeName && (
                                    <div className="profile-meta-item"><FiBook className="icon" /> {profile.collegeName}</div>
                                )}
                                <div className="profile-meta-item">
                                    <span className="badge badge-brand">{profile.branch} — Year {profile.year}</span>
                                </div>
                            </div>

                            {(profile.socialLinks?.github || profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.socialLinks?.portfolio) && (
                                <div className="profile-social-links">
                                    {profile.socialLinks.github && <a href={profile.socialLinks.github} target="_blank" rel="noreferrer"><FaGithub /></a>}
                                    {profile.socialLinks.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer"><FaLinkedin /></a>}
                                    {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer"><FaTwitter /></a>}
                                    {profile.socialLinks.portfolio && <a href={profile.socialLinks.portfolio} target="_blank" rel="noreferrer"><FaGlobe /></a>}
                                </div>
                            )}
                        </div>

                        {/* Platforms */}
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: '12px' }}>Problem Solving Stats</div>
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
                                                <span className="badge badge-success">✓</span>
                                                <a href={`${P.url}${platform.username}`} target="_blank" rel="noreferrer">
                                                    <FiExternalLink style={{ color: 'var(--text-tertiary)' }} />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Score */}
                        <div className="card" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFFFFF)', borderColor: 'var(--brand-primary)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>C Score</div>
                                <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--brand-primary)' }}>
                                    {profile.cScore?.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                    {profile.totalProblemsSolved} problems · {profile.totalContests} contests
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="dashboard-main">
                        {/* Stats Row */}
                        <div className="dashboard-stats-row">
                            <div className="card stat-card">
                                <div className="stat-label">Total Questions</div>
                                <div className="stat-value">{profile.totalProblemsSolved || 0}</div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-label">Total Contests</div>
                                <div className="stat-value">{profile.totalContests || 0}</div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-label">Profile Views</div>
                                <div className="stat-value">{profile.profileViews || 0}</div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="dashboard-charts-row">
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">DSA Topic Analysis</div>
                                </div>
                                {topicData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={topicData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                                                {topicData.map((entry, index) => (
                                                    <Cell key={index} fill={barColors[index % barColors.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state" style={{ padding: '40px' }}>
                                        <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>📉</div>
                                        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No topic data available</p>
                                        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '200px', margin: '8px auto' }}>
                                            Join coding contests or solve more tag-specific problems to see analytics.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">DSA</div>
                                </div>
                                {difficultyData.length > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
                                        <div className="donut-chart">
                                            <ResponsiveContainer width={160} height={160}>
                                                <PieChart>
                                                    <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                                        {difficultyData.map((entry, index) => (
                                                            <Cell key={index} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="donut-center">
                                                <div className="donut-value">{lcTotal}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {difficultyData.map(d => (
                                                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }} />
                                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', minWidth: '60px' }}>{d.name}</span>
                                                    <span style={{ fontSize: '16px', fontWeight: '700' }}>{d.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-state" style={{ padding: '40px' }}>
                                        <p>No difficulty data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contest Ratings */}
                        <div className="dashboard-ratings-row">
                            <div className="card rating-card">
                                <div className="rating-platform">LEETCODE</div>
                                <div className="rating-value">{profile.platforms?.leetcode?.stats?.contestRating || 0}</div>
                                <div className="rating-max">Contests: {profile.platforms?.leetcode?.stats?.contestsAttended || 0}</div>
                            </div>
                            <div className="card rating-card">
                                <div className="rating-platform">CODECHEF</div>
                                <div className="rating-value">{profile.platforms?.codechef?.stats?.rating || 0}</div>
                                <div className="rating-max">Max: {profile.platforms?.codechef?.stats?.maxRating || 0}</div>
                            </div>
                            <div className="card rating-card">
                                <div className="rating-platform">CODEFORCES</div>
                                <div className="rating-rank-title" style={{ color: '#1890FF' }}>
                                    {profile.platforms?.codeforces?.stats?.rank || 'Unrated'}
                                </div>
                                <div className="rating-value">{profile.platforms?.codeforces?.stats?.rating || 0}</div>
                                <div className="rating-max">Max: {profile.platforms?.codeforces?.stats?.maxRating || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
