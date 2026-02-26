import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCode, FiBarChart2, FiAward, FiUsers, FiTrendingUp, FiShare2 } from 'react-icons/fi';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-logo">
                    <div className="sidebar-logo-icon">CB</div>
                    <div className="sidebar-logo-text">Code<span>Board</span></div>
                </div>
                <div className="landing-nav-actions">
                    {user ? (
                        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Log In</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                <div className="landing-hero-text animate-fade-in-up">
                    <h1>
                        Track Your Coding Journey.<br />
                        <span>Rise on the Leaderboard.</span>
                    </h1>
                    <p>
                        Link your LeetCode, CodeChef, Codeforces, GFG & HackerRank profiles.
                        Get a unified portfolio dashboard, track your progress, and compete
                        with peers on the college leaderboard.
                    </p>
                    <div className="landing-hero-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">Create Your Portfolio</Link>
                        <Link to="/leaderboard" className="btn btn-outline btn-lg">View Leaderboard</Link>
                    </div>
                </div>
                <div className="landing-hero-visual animate-fade-in-up delay-2">
                    <div className="landing-hero-mockup">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div className="card stat-card" style={{ padding: '16px' }}>
                                <div className="stat-label">Total Questions</div>
                                <div className="stat-value" style={{ fontSize: '28px' }}>477</div>
                            </div>
                            <div className="card stat-card" style={{ padding: '16px' }}>
                                <div className="stat-label">Active Days</div>
                                <div className="stat-value" style={{ fontSize: '28px' }}>259</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {['LeetCode', 'CodeChef', 'Codeforces', 'GFG'].map(p => (
                                <span key={p} className="badge badge-brand" style={{ padding: '6px 12px' }}>
                                    ✅ {p}
                                </span>
                            ))}
                        </div>
                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>C Score</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--brand-primary)' }}>709.85</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>College Rank #21</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="landing-features">
                <h2>Everything You Need to <span style={{ color: 'var(--brand-primary)' }}>Stand Out</span></h2>
                <div className="landing-features-grid">
                    {[
                        { icon: <FiCode />, title: 'Multi-Platform Stats', desc: 'Connect LeetCode, CodeChef, Codeforces, GFG, and HackerRank. View all your stats in one beautiful dashboard.' },
                        { icon: <FiBarChart2 />, title: 'DSA Topic Analysis', desc: 'See topic-wise problem breakdown with bar charts. Identify your strengths and areas for improvement.' },
                        { icon: <FiAward />, title: 'College Leaderboard', desc: 'Compete with peers using the C Score algorithm. Filter by branch and year. Aim for the podium!' },
                        { icon: <FiTrendingUp />, title: 'Contest Ratings', desc: 'Track your LeetCode, CodeChef, and Codeforces contest ratings and see your growth over time.' },
                        { icon: <FiShare2 />, title: 'Public Profile', desc: 'Get a shareable profile URL showcasing all your coding achievements. Perfect for resumes and portfolios.' },
                        { icon: <FiUsers />, title: 'Community Driven', desc: 'See how you rank among your classmates. Motivate each other to solve more problems and grow together.' }
                    ].map((feature, i) => (
                        <div className={`feature-card animate-fade-in-up delay-${i + 1}`} key={i}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div className="sidebar-logo-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>CB</div>
                    <span style={{ fontSize: '18px', fontWeight: '700' }}>CodeBoard</span>
                </div>
                <p>© 2026 CodeBoard — Built for coding enthusiasts by coding enthusiasts.</p>
            </footer>
        </div>
    );
}
