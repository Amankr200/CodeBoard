const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const leaderboardRoutes = require('./routes/leaderboard');
const platformRoutes = require('./routes/platform');
const contestRoutes = require('./routes/contests');
const { refreshAllUsersStats } = require('./services/statsRefresher');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/contests', contestRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Schedule stats refresh every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Running scheduled stats refresh...');
    try {
        await refreshAllUsersStats();
        console.log('✅ Stats refresh completed');
    } catch (err) {
        console.error('❌ Stats refresh failed:', err.message);
    }
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
