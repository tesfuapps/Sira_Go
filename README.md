# 🚀 Sira Go (ሥራ ጎ) — Telegram-Integrated Ethiopian Job Marketplace

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Telegram](https://img.shields.io/badge/Telegram_Bot-Integrated-24A1DE?logo=telegram&logoColor=white)](https://t.me/sirago_jobs_bot)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Sira Go** is a modern, high-performance job marketplace specifically engineered for the Ethiopian employment ecosystem. It seamlessly bridges the gap between the web and **Telegram** — the primary platform where millions of Ethiopian professionals and job seekers discover opportunities.

Approved jobs are automatically formatted and broadcasted live to the official channel [**@sira_go**](https://t.me/sira_go), while the interactive [**@sirago_jobs_bot**](https://t.me/sirago_jobs_bot) allows employers to post jobs conversationally and candidates to receive instant personalized job alerts via DM.

---

## 🌟 Key Features

### 1. 🌐 Modern Web Experience
* **Ultra-Fast Single Page App**: Built with React 19, TypeScript, and Tailwind CSS 4 with 16 code-split chunk routes.
* **Dual Theme Support**: Cohesive dark mode (tailored `#0B0F19` canvas) and clean light mode with persistent toggle.
* **Interactive Job Discovery**: Real-time filtering by category (Developers, Creatives, Finance, Management, etc.), ETB salary range slider, date posted, and expired listing status.
* **1-Click Smart Telegram Apply**: Automatically generates pre-filled application introductions when contacting HR directly via Telegram.
* **Seeker Bookmarks & Profile Management**: Save favorite listings locally or sync across devices.

### 2. 📢 Live Telegram Channel Auto-Broadcast
* **Auto-Broadcast on Approval**: Whenever an administrator approves a job posting in the Admin Panel, it is formatted in Ethiopian vacancy standard HTML and published directly to [**@sira_go**](https://t.me/sira_go).
* **Interactive Inline Keyboards**:
  * `📩 Apply via Telegram`: Direct link pre-filled with the candidate's application greeting.
  * `👁️ View on Sira Go`: Deep-link back to the official listing on the web.
  * `📢 Share with Friends`: One-tap Telegram forward link.
* **Channel Management Hub**: Integrated Admin modal with bot connection ping testing, channel handle normalization, and live preview of message formatting before sending.

### 3. 🤖 Interactive Telegram Bot (`@sirago_jobs_bot`)
* ✍️ **/post Wizard (For Employers)**: Conversational, step-by-step job posting wizard right inside chat. Employer submissions arrive in the Admin Panel as `Pending` tagged with `📱 Telegram Bot`.
* 💼 **/jobs & /search (For Seekers)**: Paginated in-chat job cards with inline navigation (`« Prev` / `Next »`) and 1-tap apply links.
* 🔔 **/alerts DM Engine**: Seekers subscribe to categories or keywords and receive instant direct messages as soon as matching positions are approved.
* 📱 **Telegram Mini App (Web App)**: Configured with `setChatMenuButton` to provide a persistent **`🌐 Open Sira Go`** button at the bottom of the Telegram chat, opening Sira Go as an embedded native mobile app.

### 4. 🛡️ Role-Based Security & Moderation
* **Admin Dashboard**: Real-time filtering by status (`All`, `Approved`, `Pending`, `Rejected`), manual re-broadcast triggers, and subscriber alert monitoring.
* **Granular Firestore Rules**: Enforces employer authorization, prevents unauthorized status tampering, and keeps pending jobs strictly private until reviewed.

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌─────────────────────────────────────────┐
                                  │       @sirago_jobs_bot (Telegram)       │
                                  └────┬──────────────┬──────────────┬──────┘
                                       │              │              │
                             /jobs & /search        /post         /alerts
                             (Job Seekers)       (Employers)    (Subscribers)
                                       │              │              │
                                       ▼              ▼              ▼
                              Live Approved Jobs    Pending Jobs    Instant DM
                             with Inline Apply     to Admin Panel   Notification
                                       │              │              │
                                       └──────────────┼──────────────┘
                                                      ▼
                                        ┌───────────────────────────┐
                                        │        Sira Go Web        │
                                        │   React 19 + TypeScript   │
                                        │   http://localhost:5173   │
                                        └─────────────┬─────────────┘
                                                      │ (Approve & Broadcast)
                                                      ▼
                                        ┌───────────────────────────┐
                                        │    Channel: @sira_go      │
                                        └───────────────────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide Icons |
| **Routing** | React Router v7 with dynamic `React.lazy` code splitting |
| **Database & Auth** | Firebase Firestore, Firebase Authentication |
| **Bot Runner** | Node.js + TypeScript (`tsx`), Telegram Bot API (Long-Polling & Webhooks) |
| **Distribution** | Telegram Bot API (`sendMessage`, `setChatMenuButton`, `setMyCommands`) |

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js** 18.0 or higher
* **npm** or **yarn** / **pnpm**
* A Telegram Bot token from [@BotFather](https://t.me/BotFather)

### 1. Clone the Repository
```bash
git clone https://github.com/tesfuapps/Sira_Go.git
cd Sira_Go
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Telegram Bot Configuration
VITE_TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
VITE_TELEGRAM_CHANNEL_ID="@sira_go"
VITE_TELEGRAM_BOT_USERNAME="sirago_jobs_bot"

# Application URL
APP_URL="https://sirago.et"
```

### 4. Run the Web Application
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Run the Interactive Telegram Bot
In a separate terminal:
```bash
npm run bot
```
The bot will connect as `@sirago_jobs_bot` and begin listening for updates, commands, and conversational job submissions.

---

## 📋 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server at `http://localhost:5173` |
| `npm run bot` | Starts the interactive Telegram bot runner daemon (`bot/index.ts`) |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle in `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs `tsc --noEmit` to verify type safety across all components |

---

## 📲 Telegram Channel & Bot Setup Guide

### 1. Create your Bot with @BotFather
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to choose a Name and Username.
3. Copy the **HTTP API token** and place it in `.env` as `VITE_TELEGRAM_BOT_TOKEN`.

### 2. Configure Channel Broadcasting
1. Create a public or private Telegram channel (e.g., `t.me/sira_go`).
2. Go to **Channel Info ➔ Administrators ➔ Add Administrator**.
3. Search for your bot username and grant the **"Post Messages"** permission.
4. Ensure `VITE_TELEGRAM_CHANNEL_ID="@sira_go"` matches your channel handle.

### 3. Sync Commands and Telegram Mini App
1. Navigate to the Admin Panel at `http://localhost:5173/admin`.
2. Click **"Channel Settings & Preview"**.
3. Open the **"Interactive Bot & Mini App"** tab and click **"Sync with Telegram"**.
4. Telegram will automatically register the command menu (`/start`, `/jobs`, `/search`, `/post`, `/alerts`) and set the **`🌐 Open Sira Go`** Mini App menu button!

---

## 📂 Project Structure

```
Sira_Go/
├── bot/
│   └── index.ts                 # Interactive Telegram Bot runner & polling daemon
├── public/
│   ├── bot_store.json           # Local persistence store for bot jobs & alert subscribers
│   └── SiraGo.png               # Brand logo asset
├── src/
│   ├── components/
│   │   ├── AlertModal.tsx       # Web job alert creator modal
│   │   ├── JobCard.tsx          # Reusable job card component
│   │   ├── Layout.tsx           # Global responsive layout with theme toggle & nav
│   │   └── TelegramSettingsModal.tsx # Telegram Integration Hub & live preview modal
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state & role-based access control
│   │   ├── JobContext.tsx       # Global jobs state, Firestore sync & bookmarks
│   │   └── ThemeContext.tsx     # Dark/light theme context & local storage persistence
│   ├── lib/
│   │   ├── firebase.ts          # Firebase app & Firestore initialization
│   │   ├── telegram.ts          # Telegram Bot API client, post formatter & sync helpers
│   │   └── utils.ts             # ETB salary formatting, date checks & class merging
│   ├── pages/
│   │   ├── AdminPanel.tsx       # Admin job moderation, approvals & broadcast bar
│   │   ├── EmployerDashboard.tsx# Employer job management portal
│   │   ├── Home.tsx             # Main job board with interactive filters & search
│   │   ├── JobDetails.tsx       # Comprehensive vacancy view with 1-click apply links
│   │   ├── PostJob.tsx          # Web job submission form
│   │   └── ...                  # Code-split authentication & info pages
│   ├── types.ts                 # TypeScript interfaces (Job, JobAlert, Category, User)
│   ├── App.tsx                  # React Router configuration with React.lazy
│   └── index.css                # Tailwind CSS v4 styling & theme tokens
├── firestore.rules              # Production security rules for Google Cloud Firestore
├── firebase-applet-config.json  # Firebase client credentials
├── package.json                 # Project dependencies & scripts
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Please feel free to submit a Pull Request or open an Issue for bug reports and feature requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Sira Go (ሥራ ጎ)</b> — Connecting Ethiopian Talent with Opportunity 🇪🇹
</p>
