const User = require('../models/User');
const { fetchUserPlatformStats } = require('./platformFetcher');

/**
 * Refresh stats for all users (called by cron job)
 */
async function refreshAllUsersStats() {
    const users = await User.find({});
    console.log(`Refreshing stats for ${users.length} users...`);

    for (const user of users) {
        const platforms = ['leetcode', 'gfg', 'hackerrank'];

        for (const platform of platforms) {
            if (user.platforms[platform].username) {
                try {
                    const stats = await fetchUserPlatformStats(platform, user.platforms[platform].username);
                    if (stats) {
                        user.platforms[platform].stats = { ...user.platforms[platform].stats, ...stats };
                    }
                } catch (err) {
                    console.error(`Error refreshing ${platform} for ${user.username}:`, err.message);
                }
            }
        }

        user.calculateCScore();
        user.lastRefreshed = new Date();
        await user.save();

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

module.exports = { refreshAllUsersStats };
