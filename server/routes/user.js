const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { fetchUserPlatformStats } = require('../services/platformFetcher');

const router = express.Router();

// Get user profile (public)
router.get('/profile/:username', auth.optionalAuth, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if profile is private
        if (!user.isPublic) {
            // Check if requester is the owner
            const isOwner = req.userId && req.userId.toString() === user._id.toString();
            if (!isOwner) {
                return res.status(403).json({ message: 'This profile is private', isPrivate: true });
            }
        }

        // Increment profile views
        user.profileViews += 1;
        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { fullName, bio, branch, year, collegeName, location, socialLinks, isPublic, profilePicture } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (bio !== undefined) updateData.bio = bio;
        if (branch) updateData.branch = branch;
        if (year) updateData.year = year;
        if (collegeName !== undefined) updateData.collegeName = collegeName;
        if (location !== undefined) updateData.location = location;
        if (socialLinks) updateData.socialLinks = socialLinks;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper: extract username from URL or raw input
function extractUsername(platform, input) {
    if (!input) return '';
    let cleaned = input.trim().replace(/\/+$/, ''); // remove trailing slashes

    // If it looks like a URL, extract the last path segment
    if (cleaned.includes('/')) {
        try {
            const url = new URL(cleaned);
            const parts = url.pathname.split('/').filter(Boolean);
            // LeetCode: /u/username or /username
            // CodeChef: /users/username
            // Codeforces: /profile/username
            // GFG: /user/username
            // HackerRank: /username
            return parts[parts.length - 1] || cleaned;
        } catch {
            // Not a valid URL, try splitting by /
            const parts = cleaned.split('/').filter(Boolean);
            return parts[parts.length - 1] || cleaned;
        }
    }

    return cleaned;
}

// Link/update platform username
router.post('/platform', auth, async (req, res) => {
    try {
        const { platform, username: rawUsername } = req.body;
        const validPlatforms = ['leetcode', 'gfg', 'hackerrank'];

        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({ message: 'Invalid platform' });
        }

        const username = extractUsername(platform, rawUsername);
        console.log(`🔗 Linking ${platform}: raw="${rawUsername}" → extracted="${username}"`);

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.platforms[platform].username = username;
        user.platforms[platform].verified = true;

        // Fetch stats for this platform
        try {
            console.log(`🔄 Fetching ${platform} stats for: ${username}`);
            const stats = await fetchUserPlatformStats(platform, username);
            console.log(`📊 ${platform} fetch result:`, JSON.stringify(stats));
            if (stats) {
                // Update stats fields
                Object.keys(stats).forEach(key => {
                    if (key === 'topicWise' && stats[key]) {
                        // Special handling for Mongoose Map
                        user.platforms[platform].stats.topicWise = new Map(Object.entries(stats[key]));
                    } else {
                        user.platforms[platform].stats[key] = stats[key];
                    }
                });
                console.log(`✅ ${platform} stats updated`);
                user.markModified(`platforms.${platform}.stats`);
            } else {
                console.log(`⚠️ No stats returned for ${platform}`);
            }
        } catch (fetchErr) {
            console.error(`Error fetching ${platform} stats:`, fetchErr.message);
            // Continue even if fetch fails - username is still saved
        }

        user.calculateCScore();
        user.lastRefreshed = new Date();
        await user.save();

        res.json(user);
    } catch (err) {
        console.error('Link platform error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove platform
router.delete('/platform/:platform', auth, async (req, res) => {
    try {
        const { platform } = req.params;
        const validPlatforms = ['leetcode', 'gfg', 'hackerrank'];

        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({ message: 'Invalid platform' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Reset platform data
        user.platforms[platform].username = '';
        user.platforms[platform].verified = false;

        // Reset stats based on platform
        const defaultStats = {
            leetcode: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, contestRating: 0, contestsAttended: 0, ranking: 0, topicWise: {} },
            gfg: { totalSolved: 0, score: 0, institute_rank: 0 },
            hackerrank: { badges: 0, certificates: 0 }
        };

        user.platforms[platform].stats = defaultStats[platform];
        user.calculateCScore();
        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Refresh stats
router.post('/refresh', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check cooldown (30 seconds for dev, change to 5*60*1000 for production)
        const timeSinceLastRefresh = Date.now() - new Date(user.lastRefreshed).getTime();
        if (timeSinceLastRefresh < 30 * 1000) {
            const remainingSeconds = Math.ceil((30 * 1000 - timeSinceLastRefresh) / 1000);
            return res.status(429).json({
                message: `Please wait ${remainingSeconds} seconds before refreshing again`
            });
        }

        const platforms = ['leetcode', 'gfg', 'hackerrank'];

        for (const platform of platforms) {
            if (user.platforms[platform].username) {
                try {
                    // Auto-clean stored URLs to just usernames
                    const cleanUsername = extractUsername(platform, user.platforms[platform].username);
                    if (cleanUsername !== user.platforms[platform].username) {
                        user.platforms[platform].username = cleanUsername;
                        user.markModified(`platforms.${platform}.username`);
                    }
                    console.log(`🔄 Fetching ${platform} stats for: ${cleanUsername}`);
                    const stats = await fetchUserPlatformStats(platform, cleanUsername);
                    console.log(`📊 ${platform} result:`, JSON.stringify(stats));
                    if (stats) {
                        // Explicitly set each stat field for Mongoose to detect changes
                        Object.keys(stats).forEach(key => {
                            if (key === 'topicWise' && stats[key]) {
                                user.platforms[platform].stats.topicWise = new Map(Object.entries(stats[key]));
                            } else {
                                user.platforms[platform].stats[key] = stats[key];
                            }
                        });
                        user.markModified(`platforms.${platform}.stats`);
                    }
                } catch (fetchErr) {
                    console.error(`Error refreshing ${platform}:`, fetchErr.message);
                }
            }
        }

        user.calculateCScore();
        user.lastRefreshed = new Date();
        await user.save();

        // Return without password
        const savedUser = await User.findById(req.userId).select('-password');
        res.json(savedUser);
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate rank
        const rank = await User.countDocuments({ cScore: { $gt: user.cScore } }) + 1;
        const totalUsers = await User.countDocuments();

        res.json({
            user,
            rank,
            totalUsers
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
