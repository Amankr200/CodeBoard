import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRANCHES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        branch: 'CSE',
        year: 1,
        collegeName: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.username.length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }

        setLoading(true);
        try {
            await register({
                fullName: formData.fullName,
                username: formData.username.toLowerCase(),
                email: formData.email,
                password: formData.password,
                branch: formData.branch,
                year: parseInt(formData.year),
                collegeName: formData.collegeName
            });
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-slide-up" style={{ maxWidth: '520px' }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">CB</div>
                    </div>
                    <h1>Create Account</h1>
                    <p>Join CodeBoard and start tracking your coding journey</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input
                                id="register-fullname"
                                type="text"
                                name="fullName"
                                className="form-input"
                                placeholder="Aman Kumar"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Username *</label>
                            <input
                                id="register-username"
                                type="text"
                                name="username"
                                className="form-input"
                                placeholder="amankr"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="you@college.edu"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">College Name</label>
                        <input
                            id="register-college"
                            type="text"
                            name="collegeName"
                            className="form-input"
                            placeholder="e.g., BPIT, DTU, NIT..."
                            value={formData.collegeName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Branch</label>
                            <select
                                id="register-branch"
                                name="branch"
                                className="form-select"
                                value={formData.branch}
                                onChange={handleChange}
                            >
                                {BRANCHES.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year</label>
                            <select
                                id="register-year"
                                name="year"
                                className="form-select"
                                value={formData.year}
                                onChange={handleChange}
                            >
                                {[1, 2, 3, 4].map(y => (
                                    <option key={y} value={y}>Year {y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <input
                                id="register-password"
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password *</label>
                            <input
                                id="register-confirm"
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        id="register-submit"
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
