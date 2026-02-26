const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    branch: {
        type: String,
        enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AI/ML', 'DS', 'Other'],
        default: 'CSE'
    },
    year: {
        type: Number,
        enum: [1, 2, 3, 4],
        default: 1
    },
    bio: {
        type: String,
        maxlength: 300,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    collegeName: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    },
    platforms: {
        leetcode: {
            username: { type: String, default: '' },
            verified: { type: Boolean, default: false },
            stats: {
                totalSolved: { type: Number, default: 0 },
                easySolved: { type: Number, default: 0 },
                mediumSolved: { type: Number, default: 0 },
                hardSolved: { type: Number, default: 0 },
                contestRating: { type: Number, default: 0 },
                contestsAttended: { type: Number, default: 0 },
                ranking: { type: Number, default: 0 },
                topicWise: { type: Map, of: Number, default: {} }
            }
        },
        gfg: {
            username: { type: String, default: '' },
            verified: { type: Boolean, default: false },
            stats: {
                totalSolved: { type: Number, default: 0 },
                score: { type: Number, default: 0 },
                institute_rank: { type: Number, default: 0 }
            }
        },
        hackerrank: {
            username: { type: String, default: '' },
            verified: { type: Boolean, default: false },
            stats: {
                badges: { type: Number, default: 0 },
                certificates: { type: Number, default: 0 }
            }
        }
    },
    cScore: {
        type: Number,
        default: 0
    },
    totalProblemsSolved: {
        type: Number,
        default: 0
    },
    totalContests: {
        type: Number,
        default: 0
    },
    profileViews: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    lastRefreshed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Calculate C Score
userSchema.methods.calculateCScore = function () {
    const lc = this.platforms.leetcode.stats;
    const gfg = this.platforms.gfg.stats;
    console.log(`📊 Calculating Score for ${this.username}: LeetCode Solved=${lc.totalSolved}, GFG Solved=${gfg.totalSolved}`);

    // Weighted scoring algorithm
    let score = 0;

    // DSA Problems (max ~400 points)
    const totalProblems = lc.totalSolved + gfg.totalSolved;
    score += Math.min(totalProblems * 0.5, 400);

    // Difficulty bonus for LeetCode
    score += lc.easySolved * 0.2;
    score += lc.mediumSolved * 0.5;
    score += lc.hardSolved * 1.5;

    // Contest ratings (max ~100 points)
    if (lc.contestRating > 0) score += Math.min(lc.contestRating * 0.1, 100);

    // Contest participation bonus (max ~100 points)
    const totalContests = lc.contestsAttended;
    score += Math.min(totalContests * 2, 100);

    // GFG bonus
    score += Math.min(gfg.score * 0.1, 50);

    this.cScore = Math.round(score * 100) / 100;
    this.totalProblemsSolved = totalProblems;
    this.totalContests = totalContests;

    return this.cScore;
};

module.exports = mongoose.model('User', userSchema);
