const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', auth.optionalAuth, async (req, res) => {
    try {
        const { branch, year, sortBy, page = 1, limit = 50, search } = req.query;

        let filter = {};
        if (branch && branch !== 'all') filter.branch = branch;
        if (year && year !== 'all') filter.year = parseInt(year);
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { collegeName: { $regex: search, $options: 'i' } }
            ];
        }

        // Determine sort field
        let sortField = '-cScore';
        if (sortBy === 'problems') sortField = '-totalProblemsSolved';
        else if (sortBy === 'leetcode') sortField = '-platforms.leetcode.stats.contestRating';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(filter)
            .select('username fullName branch year collegeName profilePicture cScore totalProblemsSolved totalContests platforms.leetcode.stats.contestRating platforms.gfg.stats.score platforms.hackerrank.stats.badges isPublic')
            .sort(sortField)
            .skip(skip)
            .limit(parseInt(limit));

        const totalCount = await User.countDocuments(filter);

        // Add rank to each user and handle privacy
        const rankedUsers = users.map((u, index) => {
            const userObj = u.toObject();
            const isMe = req.userId && req.userId.toString() === userObj._id.toString();

            if (!userObj.isPublic && !isMe) {
                userObj.fullName = 'Anonymous User';
                userObj.username = 'hidden_' + (skip + index + 1);
                userObj.profilePicture = '';
                userObj.isAnonymous = true;
            }
            return {
                ...userObj,
                rank: skip + index + 1
            };
        });

        res.json({
            users: rankedUsers,
            totalCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit))
        });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get top 3 for podium
router.get('/top', auth.optionalAuth, async (req, res) => {
    try {
        const { branch, year } = req.query;

        let filter = {};
        if (branch && branch !== 'all') filter.branch = branch;
        if (year && year !== 'all') filter.year = parseInt(year);

        const topUsers = await User.find(filter)
            .select('username fullName branch year collegeName profilePicture cScore totalProblemsSolved isPublic')
            .sort('-cScore')
            .limit(3);

        const anonymizedTopUsers = topUsers.map(u => {
            const userObj = u.toObject();
            const isMe = req.userId && req.userId.toString() === userObj._id.toString();

            if (!userObj.isPublic && !isMe) {
                userObj.fullName = 'Anonymous User';
                userObj.username = 'hidden';
                userObj.profilePicture = '';
                userObj.isAnonymous = true;
            }
            return userObj;
        });

        res.json(anonymizedTopUsers);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's rank
router.get('/myrank', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const rank = await User.countDocuments({ cScore: { $gt: user.cScore } }) + 1;
        const totalUsers = await User.countDocuments();

        res.json({
            rank,
            totalUsers,
            cScore: user.cScore,
            username: user.username,
            fullName: user.fullName,
            profilePicture: user.profilePicture
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
