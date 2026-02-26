const axios = require('axios');

/**
 * Fetch stats from various coding platforms using their public APIs
 */

// LeetCode stats via alfa-leetcode-api proxy + direct fallback
async function fetchLeetCodeStats(username) {
    try {
        // Primary: Use alfa-leetcode-api proxy (reliable & maintained)
        const [profileRes, contestRes] = await Promise.all([
            axios.get(`https://alfa-leetcode-api.onrender.com/${username}/solved`, { timeout: 15000 }).catch(() => null),
            axios.get(`https://alfa-leetcode-api.onrender.com/${username}/contest`, { timeout: 15000 }).catch(() => null)
        ]);

        const profile = profileRes?.data;
        const contest = contestRes?.data;

        if (!profile || profile.errors) {
            // Fallback: Direct GraphQL with browser-like headers
            return await fetchLeetCodeStatsDirect(username);
        }

        // Also fetch topic-wise data
        let topicWise = {};
        try {
            // Some proxies return skillStats at /skillStats/:user, some at /user/skillStats
            const skillRes = await axios.get(`https://alfa-leetcode-api.onrender.com/skillStats/${username}`, { timeout: 15000 });

            // Handle multiple possible structures from proxies
            const skills = skillRes?.data?.matchedUser?.tagProblemCounts ||
                skillRes?.data?.data?.matchedUser?.tagProblemCounts ||
                skillRes?.data?.tagProblemCounts ||
                skillRes?.data;

            if (skills) {
                const allTags = [
                    ...(skills.fundamental || []),
                    ...(skills.intermediate || []),
                    ...(skills.advanced || [])
                ];
                allTags.forEach(tag => {
                    if (tag.problemsSolved > 0) {
                        topicWise[tag.tagName] = tag.problemsSolved;
                    }
                });
            }
        } catch (e) {
            console.log('LeetCode topic fetch error:', e.message);
        }

        return {
            totalSolved: profile.solvedProblem || 0,
            easySolved: profile.easySolved || 0,
            mediumSolved: profile.mediumSolved || 0,
            hardSolved: profile.hardSolved || 0,
            contestRating: Math.round(contest?.contestRating || 0),
            contestsAttended: contest?.contestAttend || 0,
            ranking: profile.ranking || 0,
            topicWise
        };
    } catch (err) {
        console.error('LeetCode fetch error:', err.message);
        // Try direct fallback
        return await fetchLeetCodeStatsDirect(username).catch(() => null);
    }
}

// Direct GraphQL fallback with browser-like headers
async function fetchLeetCodeStatsDirect(username) {
    try {
        const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
          profile { ranking }
          userContestRanking {
            rating attendedContestsCount
          }
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
        }
      }
    `;

        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://leetcode.com',
                'Origin': 'https://leetcode.com'
            },
            timeout: 15000
        });

        const data = response.data?.data?.matchedUser;
        if (!data) return null;

        const submissions = data.submitStatsGlobal?.acSubmissionNum || [];
        const topicWise = {};
        const allTags = [
            ...(data.tagProblemCounts?.fundamental || []),
            ...(data.tagProblemCounts?.intermediate || []),
            ...(data.tagProblemCounts?.advanced || [])
        ];
        allTags.forEach(tag => {
            if (tag.problemsSolved > 0) topicWise[tag.tagName] = tag.problemsSolved;
        });

        return {
            totalSolved: submissions.find(s => s.difficulty === 'All')?.count || 0,
            easySolved: submissions.find(s => s.difficulty === 'Easy')?.count || 0,
            mediumSolved: submissions.find(s => s.difficulty === 'Medium')?.count || 0,
            hardSolved: submissions.find(s => s.difficulty === 'Hard')?.count || 0,
            contestRating: Math.round(data.userContestRanking?.rating || 0),
            contestsAttended: data.userContestRanking?.attendedContestsCount || 0,
            ranking: data.profile?.ranking || 0,
            topicWise
        };
    } catch (err) {
        console.error('LeetCode direct fallback error:', err.message);
        return null;
    }
}
// GeeksforGeeks stats — scrape profile page for embedded data
async function fetchGFGStats(username) {
    // Primary: Scrape GFG profile page (data is embedded in Next.js RSC payload)
    try {
        console.log(`🌐 Scraping GFG profile for: ${username}`);
        const response = await axios.get(`https://www.geeksforgeeks.org/user/${username}/`, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        const html = response.data;
        if (typeof html !== 'string') return null;

        // Look for the userData object in the RSC payload
        // It's often escaped like \"userData\":{...}
        const scoreMatch = html.match(/\\?"score\\?"\s*:\s*(\d+)/);
        const solvedMatch = html.match(/\\?"total_problems_solved\\?"\s*:\s*(\d+)/);
        const rankMatch = html.match(/\\?"institute_rank\\?"\s*:\s*(\d+)/);

        if (scoreMatch || solvedMatch) {
            const stats = {
                totalSolved: solvedMatch ? parseInt(solvedMatch[1]) : 0,
                score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
                institute_rank: rankMatch ? parseInt(rankMatch[1]) : 0
            };
            console.log('✅ GFG Scrape Success:', JSON.stringify(stats));
            return stats;
        }

        console.log('⚠️ GFG Regex failed to find stats in HTML');
    } catch (err) {
        console.log('❌ GFG scrape error:', err.message);
    }

    // Fallback: try old API
    try {
        console.log('🔄 Trying GFG API fallback...');
        const response = await axios.get(`https://geeks-for-geeks-api.vercel.app/api/${username}`, {
            timeout: 10000
        });
        const data = response.data;
        if (data) {
            const stats = {
                totalSolved: parseInt(data.totalProblemsSolved) || 0,
                score: parseInt(data.codingScore) || 0,
                institute_rank: parseInt(data.instituteRank) || 0
            };
            console.log('✅ GFG API Fallback Success:', JSON.stringify(stats));
            return stats;
        }
    } catch (err) {
        console.log('❌ GFG API fallback failed:', err.message);
    }

    return null;
}

// HackerRank stats (limited public API)
async function fetchHackerRankStats(username) {
    try {
        const response = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/badges`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const badges = response.data?.models || [];

        return {
            badges: badges.length,
            certificates: badges.filter(b => b.stars && b.stars > 0).length
        };
    } catch (err) {
        console.error('HackerRank fetch error:', err.message);
        return null;
    }
}

/**
 * Main dispatcher function
 */
async function fetchUserPlatformStats(platform, username) {
    if (!username) return null;

    switch (platform) {
        case 'leetcode':
            return fetchLeetCodeStats(username);
        case 'gfg':
            return fetchGFGStats(username);
        case 'hackerrank':
            return fetchHackerRankStats(username);
        default:
            return null;
    }
}

module.exports = { fetchUserPlatformStats };
