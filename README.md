# 🏆 CodeBoard — College Coding Leaderboard

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application — a developer portfolio and leaderboard platform for college students, inspired by [Codolio](https://codolio.com).

![CodeBoard](https://img.shields.io/badge/Stack-MERN-green) ![Status](https://img.shields.io/badge/Status-In%20Development-orange)

## ✨ Features

### 🔐 Auth System
- Student registration/login with JWT authentication
- Profile setup with name, branch, year, college, and profile picture

### 🔗 Platform Integration
- Link usernames from **LeetCode**, **CodeChef**, **Codeforces**, **GeeksForGeeks**, and **HackerRank**
- Auto-fetch stats (problems solved, contest rating, badges) using public APIs

### 📊 Portfolio Dashboard
- Aggregated stats: total problems solved across all platforms
- Contest ratings for LeetCode, CodeChef, Codeforces
- Topic-wise DSA analysis (bar charts using Recharts)
- Difficulty breakdown (Easy/Medium/Hard donut chart)
- Platform-wise problem counts

### 🏅 Leaderboard
- College-wide leaderboard ranked by **C Score**
- Sort by: C Score, Total Questions, LeetCode Rating, Codeforces Rating
- Filter by branch and year
- Search by name, username, or college
- **Podium UI** for top 3 with medals
- Personal rank strip with "MY RANK" badge

### 👤 Public Profile
- Shareable profile URL (`/profile/:username`)
- Shows all stats, platforms, achievements, and social links

### ⚙️ Edit Profile
- Update personal info, bio, social links
- Upload profile picture
- Toggle public/private profile

### 🔄 Auto Refresh
- Scheduled stats refresh using `node-cron` (every 6 hours)
- Manual refresh with 5-minute cooldown

## 🧮 C Score Algorithm

The **C Score** (out of ~900) is calculated as a weighted composite:

| Component | Weight | Max Points |
|-----------|--------|-----------|
| Total Problems Solved | 0.5/problem | ~400 |
| LeetCode Easy | 0.2/problem | — |
| LeetCode Medium | 0.5/problem | — |
| LeetCode Hard | 1.5/problem | — |
| LeetCode Contest Rating | 0.1/rating | ~100 |
| CodeChef Rating | 0.05/rating | ~100 |
| Codeforces Rating | 0.06/rating | ~100 |
| Contest Participation | 2/contest | ~100 |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Vanilla CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |
| API Client | Axios |
| Cron Jobs | node-cron |
| Icons | react-icons |
| Notifications | react-hot-toast |

## 📁 Project Structure

```
codeboard/
├── server/
│   ├── server.js           # Express entry point
│   ├── models/
│   │   └── User.js         # Mongoose user schema + C Score logic
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Register, Login, Me
│   │   ├── user.js         # Profile, Platform linking, Refresh
│   │   ├── leaderboard.js  # Rankings, Top 3, My Rank
│   │   └── platform.js     # Platform verification
│   ├── services/
│   │   ├── platformFetcher.js  # API integrations for all platforms
│   │   └── statsRefresher.js   # Cron job stat refresh service
│   └── .env
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css       # Complete design system
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   └── EditProfile.jsx
│   │   └── utils/
│   │       ├── api.js
│   │       └── constants.js
│   └── index.html
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repo
```bash
git clone <repo-url>
cd codeboard
```

### 2. Setup Backend
```bash
cd server
npm install

# Create .env file (already provided with defaults)
# Update MONGODB_URI if using Atlas

npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open in browser
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile/:username` | Get public profile |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/user/platform` | Link platform |
| DELETE | `/api/user/platform/:platform` | Remove platform |
| POST | `/api/user/refresh` | Refresh all stats |
| GET | `/api/user/dashboard` | Get dashboard data |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/leaderboard/top` | Get top 3 |
| GET | `/api/leaderboard/myrank` | Get personal rank |

## 🎯 Bonus Features (Future)
- [ ] Email notifications for rank changes
- [ ] GitHub stats integration
- [ ] Contest reminder alerts
- [ ] Submission heatmap
- [ ] Activity streak tracking
- [ ] Compare two profiles side-by-side

## 📄 License
MIT

cd server; npm run dev
cd client; npm run dev