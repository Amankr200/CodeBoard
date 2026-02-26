import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { FiChevronLeft, FiChevronRight, FiExternalLink, FiCalendar, FiClock } from 'react-icons/fi';
import { SiLeetcode, SiCodechef, SiCodeforces, SiGeeksforgeeks, SiHackerrank } from 'react-icons/si';
import toast from 'react-hot-toast';

const PLATFORM_META = {
    codeforces: { name: 'Codeforces', icon: SiCodeforces, color: '#1890FF', dot: '#1890FF' },
    leetcode: { name: 'LeetCode', icon: SiLeetcode, color: '#F59E0B', dot: '#F59E0B' },
    codechef: { name: 'CodeChef', icon: SiCodechef, color: '#5B4638', dot: '#5B4638' },
    atcoder: { name: 'AtCoder', icon: null, color: '#222', dot: '#222' },
    hackerrank: { name: 'HackerRank', icon: SiHackerrank, color: '#00EA64', dot: '#00EA64' },
    hackerearth: { name: 'HackerEarth', icon: null, color: '#323754', dot: '#323754' },
    gfg: { name: 'GeeksForGeeks', icon: SiGeeksforgeeks, color: '#2F8D46', dot: '#2F8D46' },
    topcoder: { name: 'TopCoder', icon: null, color: '#29AAE1', dot: '#29AAE1' },
    google: { name: 'Google', icon: null, color: '#4285F4', dot: '#4285F4' },
    other: { name: 'Other', icon: null, color: '#94A3B8', dot: '#94A3B8' }
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Contests() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contests');
            setContests(res.data);
        } catch (err) {
            console.error('Contests fetch error:', err);
            toast.error('Failed to fetch contests');
        } finally {
            setLoading(false);
        }
    };

    // Filter by platform
    const filteredContests = useMemo(() => {
        if (selectedPlatform === 'all') return contests;
        return contests.filter(c => c.platform === selectedPlatform);
    }, [contests, selectedPlatform]);

    // Upcoming list (sorted by date, only future)
    const upcomingList = useMemo(() => {
        const now = new Date();
        return filteredContests
            .filter(c => new Date(c.startTime) >= now)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }, [filteredContests]);

    // Group upcoming by date for list view
    const groupedUpcoming = useMemo(() => {
        const groups = {};
        upcomingList.forEach(c => {
            const dateKey = new Date(c.startTime).toLocaleDateString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(c);
        });
        return groups;
    }, [upcomingList]);

    // Calendar grid data
    const calendarData = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startOffset = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Map contests to dates in this month
        const contestsByDate = {};
        filteredContests.forEach(c => {
            const d = new Date(c.startTime);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                const day = d.getDate();
                if (!contestsByDate[day]) contestsByDate[day] = [];
                contestsByDate[day].push(c);
            }
        });

        // Build grid rows
        const cells = [];
        // Empty cells before first day
        for (let i = 0; i < startOffset; i++) {
            cells.push({ day: null, contests: [] });
        }
        // Days of the month
        for (let d = 1; d <= totalDays; d++) {
            cells.push({ day: d, contests: contestsByDate[d] || [] });
        }
        // Pad to complete last row
        while (cells.length % 7 !== 0) {
            cells.push({ day: null, contests: [] });
        }

        return cells;
    }, [currentMonth, currentYear, filteredContests]);

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    const formatTime = (iso) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    };

    const formatTimeRange = (iso, durationSec) => {
        const start = new Date(iso);
        const end = new Date(start.getTime() + (durationSec || 0) * 1000);
        const startStr = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        const endStr = end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        return `${startStr} – ${endStr}`;
    };

    const isToday = (day) => {
        const now = new Date();
        return day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
    };

    const generateGoogleCalUrl = (contest) => {
        const start = new Date(contest.startTime);
        const end = new Date(start.getTime() + (contest.duration || 7200) * 1000);
        const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.name)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent('Contest on ' + (PLATFORM_META[contest.platform]?.name || contest.platform) + '\n' + contest.url)}&location=${encodeURIComponent(contest.url)}`;
    };

    const PlatformIcon = ({ platform, size = 14 }) => {
        const meta = PLATFORM_META[platform];
        if (!meta) return null;
        if (meta.icon) {
            const Icon = meta.icon;
            return <Icon size={size} style={{ color: meta.color }} />;
        }
        // Fallback dot for platforms without icons
        return (
            <span style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: meta.color,
                display: 'inline-block',
                flexShrink: 0
            }} />
        );
    };

    const platformFilters = ['all', 'codeforces', 'leetcode', 'codechef', 'atcoder', 'hackerrank', 'gfg'];

    const MAX_CALENDAR_CONTESTS = 3;

    return (
        <>
            <div className="header">
                <h1 className="header-title">Contests</h1>
            </div>

            <div className="page-container animate-fade-in">
                {/* Platform filter tabs */}
                <div style={{ marginBottom: '24px' }}>
                    <div className="tabs" style={{ flexWrap: 'wrap' }}>
                        {platformFilters.map(p => (
                            <button
                                key={p}
                                className={`tab ${selectedPlatform === p ? 'active' : ''}`}
                                onClick={() => setSelectedPlatform(p)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {p !== 'all' && <PlatformIcon platform={p} size={13} />}
                                {p === 'all' ? 'All Platforms' : PLATFORM_META[p]?.name || p}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" />
                        <p>Fetching upcoming contests...</p>
                    </div>
                ) : (
                    <div className="contests-layout">
                        {/* Left: Upcoming List */}
                        <div className="contests-list-panel">
                            <div className="contests-list-header">
                                <h2>Upcoming Contests</h2>
                                <p>Don't miss scheduled events</p>
                            </div>

                            <div className="contests-list-scroll">
                                {Object.keys(groupedUpcoming).length === 0 ? (
                                    <div className="empty-state" style={{ padding: '40px 20px' }}>
                                        <div className="empty-icon">📅</div>
                                        <h3>No upcoming contests</h3>
                                        <p>Check back later for new contests!</p>
                                    </div>
                                ) : (
                                    Object.entries(groupedUpcoming).map(([dateStr, dateContests]) => (
                                        <div key={dateStr} className="contest-date-group">
                                            <div className="contest-date-label">{dateStr}</div>
                                            {dateContests.map(contest => {
                                                const meta = PLATFORM_META[contest.platform] || PLATFORM_META.other;
                                                return (
                                                    <div className="contest-list-card" key={contest.id}>
                                                        <div className="contest-card-dot" style={{ background: meta.dot }} />
                                                        <div className="contest-card-body">
                                                            <div className="contest-card-time">
                                                                {formatDate(contest.startTime)} &nbsp; {formatTimeRange(contest.startTime, contest.duration)}
                                                            </div>
                                                            <div className="contest-card-name">
                                                                <PlatformIcon platform={contest.platform} size={16} />
                                                                <span>{contest.name}</span>
                                                            </div>
                                                            <div className="contest-card-actions">
                                                                <a
                                                                    href={generateGoogleCalUrl(contest)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="contest-add-cal"
                                                                >
                                                                    <FiCalendar size={13} /> Add to Calendar
                                                                </a>
                                                                <a href={contest.url} target="_blank" rel="noreferrer" className="contest-ext-link">
                                                                    <FiExternalLink size={13} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right: Calendar View */}
                        <div className="contests-calendar-panel">
                            {/* Calendar Header */}
                            <div className="calendar-header">
                                <h2 className="calendar-month-title">
                                    {MONTH_NAMES[currentMonth]} {currentYear}
                                </h2>
                                <div className="calendar-nav">
                                    <button className="btn btn-ghost btn-icon" onClick={prevMonth} aria-label="Previous month">
                                        <FiChevronLeft size={20} />
                                    </button>
                                    <button className="btn btn-ghost btn-icon" onClick={nextMonth} aria-label="Next month">
                                        <FiChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Day Names */}
                            <div className="calendar-grid calendar-day-names">
                                {DAY_NAMES.map(d => (
                                    <div className="calendar-day-name" key={d}>{d}</div>
                                ))}
                            </div>

                            {/* Calendar Cells */}
                            <div className="calendar-grid calendar-cells">
                                {calendarData.map((cell, index) => (
                                    <div
                                        className={`calendar-cell ${cell.day === null ? 'calendar-cell-empty' : ''} ${cell.day && isToday(cell.day) ? 'calendar-cell-today' : ''}`}
                                        key={index}
                                    >
                                        {cell.day !== null && (
                                            <>
                                                <div className={`calendar-cell-day ${isToday(cell.day) ? 'today-badge' : ''}`}>
                                                    {cell.day}
                                                </div>
                                                <div className="calendar-cell-contests">
                                                    {cell.contests.slice(0, MAX_CALENDAR_CONTESTS).map((c, i) => {
                                                        const meta = PLATFORM_META[c.platform] || PLATFORM_META.other;
                                                        return (
                                                            <a
                                                                href={c.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="calendar-contest-chip"
                                                                style={{ borderLeftColor: meta.dot }}
                                                                key={i}
                                                                title={`${c.name}\n${formatTime(c.startTime)}`}
                                                            >
                                                                <PlatformIcon platform={c.platform} size={11} />
                                                                <span className="calendar-contest-text">{c.name}</span>
                                                            </a>
                                                        );
                                                    })}
                                                    {cell.contests.length > MAX_CALENDAR_CONTESTS && (
                                                        <div className="calendar-more-badge">
                                                            +{cell.contests.length - MAX_CALENDAR_CONTESTS} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
