import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS, BRANCHES, YEARS } from '../utils/constants';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';

export default function Leaderboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('cscore');
    const [branch, setBranch] = useState('all');
    const [year, setYear] = useState('all');
    const [search, setSearch] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchLeaderboard();
        if (user) fetchMyRank();
    }, [sortBy, branch, year, search]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const [listRes, topRes] = await Promise.all([
                api.get('/leaderboard', { params: { sortBy, branch, year, search, limit: 50 } }),
                api.get('/leaderboard/top', { params: { branch, year } })
            ]);
            setUsers(listRes.data.users);
            setTopUsers(topRes.data);
            setTotalCount(listRes.data.totalCount);
        } catch (err) {
            console.error('Leaderboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRank = async () => {
        try {
            const res = await api.get('/leaderboard/myrank');
            setMyRank(res.data);
        } catch (err) {
            console.error('My rank error:', err);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRankMedal = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const sortOptions = [
        { key: 'cscore', label: 'C Score', icon: '🏆' },
        { key: 'problems', label: 'Total Questions', icon: '📝' },
        { key: 'leetcode', label: 'Leetcode Rating', icon: '⚡' },
        { key: 'codeforces', label: 'Codeforces Rating', icon: '🌐' }
    ];

    return (
        <>
            <div className="header">
                <h1 className="header-title">Leaderboard</h1>
            </div>

            <div className="page-container animate-fade-in">
                {/* Sort Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                    <div className="tabs">
                        {sortOptions.map(opt => (
                            <button
                                key={opt.key}
                                className={`tab ${sortBy === opt.key ? 'active' : ''}`}
                                onClick={() => setSortBy(opt.key)}
                            >
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input
                            className="form-input"
                            style={{ paddingLeft: '36px' }}
                            placeholder="Search by name, username, or college..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: '120px' }}
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                    >
                        <option value="all">All Branches</option>
                        {BRANCHES.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: '120px' }}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        <option value="all">All Years</option>
                        {YEARS.map(y => (
                            <option key={y} value={y}>Year {y}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" />
                        <p>Loading leaderboard...</p>
                    </div>
                ) : (
                    <>
                        {/* Podium - Top 3 */}
                        {topUsers.length >= 3 && (
                            <div className="podium-container">
                                {[1, 0, 2].map((idx) => {
                                    const u = topUsers[idx];
                                    if (!u) return null;
                                    const rankNum = idx + 1;
                                    const rankClass = `rank-${idx === 0 ? 2 : idx === 1 ? 1 : 3}`;
                                    const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                                    return (
                                        <div className={`podium-card ${rankClass}`} key={u._id}>
                                            <div className="podium-medal">
                                                {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                                            </div>
                                            <div className="podium-avatar">
                                                {u.profilePicture ? (
                                                    <img src={u.profilePicture} alt="" />
                                                ) : (
                                                    getInitials(u.fullName)
                                                )}
                                            </div>
                                            <div className="podium-name">{u.fullName}</div>
                                            <div className="podium-handle">@{u.username}</div>
                                            <div className="podium-score-label">C Score</div>
                                            <div className="podium-score">{u.cScore?.toFixed(2)}</div>
                                            <div className="podium-rank-label">
                                                <span>Rank:</span>
                                                <span>#{actualRank}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* My Rank Strip */}
                        {myRank && (
                            <div className="card my-rank-personal-card animate-slide-up" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px 28px',
                                marginBottom: '28px',
                                background: 'rgba(255, 107, 0, 0.03)',
                                border: '1px solid rgba(255, 107, 0, 0.2)',
                                borderLeft: '6px solid var(--brand-primary)',
                                position: 'relative',
                                borderRadius: '16px',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="sidebar-avatar" style={{ width: '52px', height: '52px', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                                        {myRank.profilePicture ? (
                                            <img src={myRank.profilePicture} alt="" />
                                        ) : (
                                            getInitials(myRank.fullName)
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: 'var(--brand-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Your Standing</div>
                                        <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)' }}>{myRank.fullName}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>C Score</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>{myRank.cScore?.toFixed(2)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>Coll. Rank</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--brand-primary)', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>#{myRank.rank}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ranking Title */}
                        <div style={{ marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>College Ranking <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-tertiary)' }}>(Cumulative)</span></h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                Ranks coders based on their C Score (out of 900) — a balanced measure of DSA, CP, and development activity.
                            </p>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'center' }}>Rank</th>
                                        <th>User Name</th>
                                        <th>Institution</th>
                                        <th style={{ textAlign: 'center' }}>Branch</th>
                                        <th style={{ textAlign: 'right' }}>C Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const isMe = user && u._id === user._id;
                                        return (
                                            <tr key={u._id} className={isMe ? 'my-rank-row' : ''}>
                                                <td className="rank-cell">
                                                    <span className={u.rank <= 3 ? 'rank-medal' : ''}>
                                                        {getRankMedal(u.rank)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {u.isAnonymous && !isMe ? (
                                                        <div className="user-cell" style={{ cursor: 'default', opacity: 0.8 }}>
                                                            <div className="avatar">
                                                                {getInitials(u.fullName)}
                                                            </div>
                                                            <div>
                                                                <div className="user-name">{u.fullName}</div>
                                                                <div className="user-handle">{u.username}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Link to={`/profile/${u.username}`}>
                                                            <div className="user-cell">
                                                                <div className="avatar">
                                                                    {u.profilePicture ? (
                                                                        <img src={u.profilePicture} alt="" />
                                                                    ) : (
                                                                        getInitials(u.fullName)
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="user-name">{u.fullName}</div>
                                                                    <div className="user-handle">@{u.username}</div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )}
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                    {u.collegeName || '—'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className="badge badge-brand">{u.branch}</span>
                                                </td>
                                                <td className="score-cell" style={{ textAlign: 'right' }}>
                                                    {u.cScore?.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {users.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-icon">🏆</div>
                                    <h3>No students found</h3>
                                    <p>Try adjusting your filters or be the first to join!</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
