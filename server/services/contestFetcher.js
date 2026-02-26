const axios = require('axios');

/**
 * Fetch upcoming contests from multiple platforms
 */

// Codeforces contests
async function fetchCodeforcesContests() {
    try {
        const res = await axios.get('https://codeforces.com/api/contest.list?gym=false', { timeout: 10000 });
        const contests = res.data?.result || [];

        return contests
            .filter(c => c.phase === 'BEFORE')
            .map(c => ({
                id: `cf-${c.id}`,
                platform: 'codeforces',
                name: c.name,
                startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
                duration: c.durationSeconds,
                url: `https://codeforces.com/contest/${c.id}`,
                type: c.type
            }))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } catch (err) {
        console.error('Codeforces contests error:', err.message);
        return [];
    }
}

// LeetCode contests (weekly & biweekly pattern)
async function fetchLeetCodeContests() {
    try {
        const query = `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;
        const res = await axios.post('https://leetcode.com/graphql', { query }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        const contests = res.data?.data?.allContests || [];
        const now = Date.now() / 1000;

        return contests
            .filter(c => c.startTime > now)
            .slice(0, 20)
            .map(c => ({
                id: `lc-${c.titleSlug}`,
                platform: 'leetcode',
                name: c.title,
                startTime: new Date(c.startTime * 1000).toISOString(),
                duration: c.duration,
                url: `https://leetcode.com/contest/${c.titleSlug}/`,
                type: 'Contest'
            }))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } catch (err) {
        console.error('LeetCode contests error:', err.message);
        return [];
    }
}

// CodeChef contests
async function fetchCodeChefContests() {
    try {
        const res = await axios.get('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all', {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const upcoming = res.data?.future_contests || [];

        return upcoming.map(c => ({
            id: `cc-${c.contest_code}`,
            platform: 'codechef',
            name: c.contest_name,
            startTime: new Date(c.contest_start_date_iso).toISOString(),
            duration: c.contest_duration ? parseInt(c.contest_duration) * 60 : 0, // minutes to seconds
            url: `https://www.codechef.com/${c.contest_code}`,
            type: 'Contest'
        })).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } catch (err) {
        console.error('CodeChef contests error:', err.message);
        return [];
    }
}

// Kontests.net API (aggregator — backup for AtCoder, HackerRank, etc.)
async function fetchKontestsContests() {
    try {
        const res = await axios.get('https://kontests.net/api/v1/all', { timeout: 10000 });
        const contests = res.data || [];
        const now = new Date();

        return contests
            .filter(c => new Date(c.start_time) > now)
            .slice(0, 60)
            .map(c => {
                let platform = 'other';
                const site = (c.site || '').toLowerCase();
                if (site.includes('codeforces')) platform = 'codeforces';
                else if (site.includes('leetcode')) platform = 'leetcode';
                else if (site.includes('codechef')) platform = 'codechef';
                else if (site.includes('atcoder')) platform = 'atcoder';
                else if (site.includes('hackerrank')) platform = 'hackerrank';
                else if (site.includes('hackerearth')) platform = 'hackerearth';
                else if (site.includes('geeksforgeeks') || site.includes('gfg')) platform = 'gfg';
                else if (site.includes('topcoder')) platform = 'topcoder';
                else if (site.includes('kick') || site.includes('google')) platform = 'google';

                const durationSec = c.duration ? parseFloat(c.duration) : 0;

                return {
                    id: `kn-${Buffer.from(c.name + c.start_time).toString('base64').slice(0, 12)}`,
                    platform,
                    name: c.name,
                    startTime: new Date(c.start_time).toISOString(),
                    duration: durationSec,
                    url: c.url || '#',
                    type: c.site || 'Contest'
                };
            })
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } catch (err) {
        console.error('Kontests.net error:', err.message);
        return [];
    }
}

// Cache
let contestCache = { data: null, lastFetched: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function getAllUpcomingContests() {
    const now = Date.now();
    if (contestCache.data && (now - contestCache.lastFetched) < CACHE_TTL) {
        return contestCache.data;
    }

    // Use Kontests.net as main aggregator, supplement with direct APIs
    const [kontests, cfDirect, lcDirect] = await Promise.all([
        fetchKontestsContests(),
        fetchCodeforcesContests(),
        fetchLeetCodeContests()
    ]);

    // Merge and deduplicate — prefer direct API data
    const contestMap = new Map();

    // Add kontests data first (lower priority)
    kontests.forEach(c => {
        const key = c.name.toLowerCase().replace(/\s+/g, '');
        contestMap.set(key, c);
    });

    // Override with direct API data (higher priority, more accurate)
    cfDirect.forEach(c => {
        const key = c.name.toLowerCase().replace(/\s+/g, '');
        contestMap.set(key, c);
    });

    lcDirect.forEach(c => {
        const key = c.name.toLowerCase().replace(/\s+/g, '');
        contestMap.set(key, c);
    });

    const all = Array.from(contestMap.values())
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    contestCache = { data: all, lastFetched: now };
    return all;
}

module.exports = { getAllUpcomingContests };
