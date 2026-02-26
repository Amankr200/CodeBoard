const express = require('express');
const { getAllUpcomingContests } = require('../services/contestFetcher');

const router = express.Router();

// Get all upcoming contests
router.get('/', async (req, res) => {
    try {
        const { platform, month, year } = req.query;
        let contests = await getAllUpcomingContests();

        // Filter by platform
        if (platform && platform !== 'all') {
            contests = contests.filter(c => c.platform === platform);
        }

        // Filter by month/year for calendar view
        if (month && year) {
            const m = parseInt(month);
            const y = parseInt(year);
            contests = contests.filter(c => {
                const d = new Date(c.startTime);
                return d.getMonth() === m && d.getFullYear() === y;
            });
        }

        res.json(contests);
    } catch (err) {
        console.error('Contests route error:', err);
        res.status(500).json({ message: 'Failed to fetch contests' });
    }
});

module.exports = router;
