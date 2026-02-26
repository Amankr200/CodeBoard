import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BRANCHES } from '../utils/constants';
import toast from 'react-hot-toast';
import { FiSave, FiCamera } from 'react-icons/fi';

export default function EditProfile() {
    const { user, refreshUser, setUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        branch: 'CSE',
        year: 1,
        collegeName: '',
        location: '',
        isPublic: true,
        profilePicture: '',
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            portfolio: ''
        }
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                bio: user.bio || '',
                branch: user.branch || 'CSE',
                year: user.year || 1,
                collegeName: user.collegeName || '',
                location: user.location || '',
                isPublic: user.isPublic !== false,
                profilePicture: user.profilePicture || '',
                socialLinks: {
                    github: user.socialLinks?.github || '',
                    linkedin: user.socialLinks?.linkedin || '',
                    twitter: user.socialLinks?.twitter || '',
                    portfolio: user.socialLinks?.portfolio || ''
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('social_')) {
            const key = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, [key]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/user/profile', formData);
            setUser(res.data);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormData(prev => ({ ...prev, profilePicture: ev.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <>
            <div className="header">
                <h1 className="header-title">Edit Profile</h1>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="page-container animate-fade-in">
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    {/* Avatar Section */}
                    <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <div className="profile-avatar-large" style={{ width: '120px', height: '120px', fontSize: '40px' }}>
                                {formData.profilePicture ? (
                                    <img src={formData.profilePicture} alt="" />
                                ) : (
                                    getInitials(formData.fullName)
                                )}
                            </div>
                            <label className="camera-upload-label" style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: 'var(--brand-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)',
                                border: '3px solid white',
                                transition: 'all 0.3s ease',
                                zIndex: 2
                            }}>
                                <FiCamera size={20} style={{ display: 'block' }} />
                                <input
                                    type="file"
                                    id="profile-pic-input"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                            Click the camera icon to upload a profile picture (max 2MB)
                        </p>
                    </div>

                    {/* Basic Info */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div className="card-title" style={{ marginBottom: '20px' }}>Basic Information</div>
                        <form>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        className="form-input"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">College Name</label>
                                    <input
                                        className="form-input"
                                        name="collegeName"
                                        value={formData.collegeName}
                                        onChange={handleChange}
                                        placeholder="e.g., BPIT, DTU..."
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Branch</label>
                                    <select
                                        className="form-select"
                                        name="branch"
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
                                        className="form-select"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                    >
                                        {[1, 2, 3, 4].map(y => (
                                            <option key={y} value={y}>Year {y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    className="form-input"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., New Delhi, India"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea
                                    className="form-input"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself — your coding journey, interests, goals..."
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <label className="form-label" style={{ margin: 0 }}>Public Profile</label>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </form>
                    </div>

                    {/* Social Links */}
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: '20px' }}>Social Links</div>
                        <div className="form-group">
                            <label className="form-label">🐙 GitHub URL</label>
                            <input
                                className="form-input"
                                name="social_github"
                                value={formData.socialLinks.github}
                                onChange={handleChange}
                                placeholder="https://github.com/yourusername"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">💼 LinkedIn URL</label>
                            <input
                                className="form-input"
                                name="social_linkedin"
                                value={formData.socialLinks.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/yourusername"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🐦 Twitter URL</label>
                            <input
                                className="form-input"
                                name="social_twitter"
                                value={formData.socialLinks.twitter}
                                onChange={handleChange}
                                placeholder="https://twitter.com/yourusername"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🌐 Portfolio/Website</label>
                            <input
                                className="form-input"
                                name="social_portfolio"
                                value={formData.socialLinks.portfolio}
                                onChange={handleChange}
                                placeholder="https://yourportfolio.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .camera-upload-label:hover {
                    transform: scale(1.1);
                    background: var(--brand-primary-dark) !important;
                }
            `}</style>
        </>
    );
}
