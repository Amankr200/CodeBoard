const express = require('express');
const { fetchUserPlatformStats } = require('../services/platformFetcher');

const router = express.Router();

// Verify platform username (check if it exists)
router.get('/verify/:platform/:username', async (req, res) => {
    try {
        const { platform, username } = req.params;
        const stats = await fetchUserPlatformStats(platform, username);

        if (stats) {
            res.json({ exists: true, stats });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        res.json({ exists: false, error: err.message });
    }
});

module.exports = router;
