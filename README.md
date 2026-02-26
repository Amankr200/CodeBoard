# <p align="center">🏆 CodeBoard — College Coding Leaderboard</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-8E44AD?style=for-the-badge&logo=mongodb" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<p align="center">
  <b>A comprehensive developer portfolio and leaderboard platform for college students.</b>
</p>

---

## ✨ Features

### 🔐 Secure Auth System
- **JWT Authentication**: Secure student registration and login.
- **Custom Profiles**: Set up your branch, graduation year, college, and profile picture.

### 🔗 Multi-Platform Integration
- Link your accounts from **LeetCode**, **CodeChef**, **Codeforces**, **GeeksForGeeks**, and **HackerRank**.
- **Auto-Sync**: Fetch problems solved, contest ratings, and badges automatically.

### 📊 Dynamic Portfolio Dashboard
- **Aggregated Stats**: See your progress across all platforms in one view.
- **Visualization**: Beautiful bar charts (Recharts) for topic-wise DSA analysis.
- **Breakdown**: Donut charts for difficulty levels (Easy/Medium/Hard).

### 🏅 Competitive Leaderboard
- **Rankings**: Compete college-wide based on the unique **C Score**.
- **Smart Filtering**: Sort by score, questions, or specific platform ratings.
- **Podium UI**: Special display for the top 3 legends.

---

## 🧮 The C Score Algorithm

The **C Score** (MAX ~900) is a weighted metric designed to reflect true coding prowess:

| Component | weight | max points |
| :--- | :--- | :--- |
| **Total Problems Solved** | 0.5 per problem | ~400 |
| **LeetCode Hard** | 1.5 per problem | — |
| **LeetCode Medium** | 0.5 per problem | — |
| **LeetCode Easy** | 0.2 per problem | — |
| **LeetCode Contest Rating** | 0.1 per rating point | ~100 |
| **CodeChef Rating** | 0.05 per rating point | ~100 |
| **Codeforces Rating** | 0.06 per rating point | ~100 |
| **Contest Participation** | 2.0 per contest | ~100 |

---

## � Quick Start

Follow these steps to get the project running locally.

### 📋 Prerequisites
- **Node.js**: Version 18 or higher.
- **Database**: A local MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) URI.

### 1️⃣ Clone and Install
```bash
git clone https://github.com/Amankr200/CodeBoard.git
cd CodeBoard
```

### 2️⃣ Start Development Servers
Open two terminal windows to run the full stack:

#### **Backend Server**
```bash
cd server
npm install
npm run dev
```

#### **Frontend Client**
```bash
cd client
npm install
npm run dev
```

---

## �️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Vanilla CSS, Recharts |
| **Backend** | Node.js, Express.js, node-cron |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcryptjs |
| **API** | Axios, Cheerio (for scraping) |

---

## 📁 Repository Structure

```text
CodeBoard/
├── client/              # Frontend (React + Vite)
│   ├── src/pages/       # Dashboard, Leaderboard, Profiles
│   └── index.css        # Core Design System
├── server/              # Backend (Express + Node)
│   ├── models/          # MongoDB Schemas
│   ├── routes/          # API Endpoints
│   └── services/        # Platform Fetchers & Cron Jobs
└── .gitignore           # Excludes node_modules & .env
```

---

## 🎯 Roadmap
- [ ] 📧 **Email Alerts**: Get notified when your rank changes.
- [ ] 💻 **GitHub Sync**: Integrate your contribution graph.
- [ ] 🔥 **Streaks**: Daily coding activity tracking.
- [ ] ⚔️ **Duel Mode**: Compare profiles side-by-side.

---

<p align="center">
  Developed with ❤️ by <a href="https://github.com/Amankr200">Amankr200</a>
</p>
