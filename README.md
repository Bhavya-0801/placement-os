# PlacementOS
> **“Placement Ka Pressure™ — turned into a system.”**

PlacementOS is an all-in-one student placement command center engineered specifically for engineering students navigating campus drives, off-campus jobs, technical interviews, online assessments (OAs), and resume iterations.

---

## 🚀 Key Features

### 1. ⚡ Command Center (`/dashboard`)
- Real-time placement metrics: Applications, Assessments, Interviews, Offers, and Ghosted rates.
- 6-stage interactive application conversion funnel.
- Composite Placement Readiness Gauge (0–100%) dynamically calculated across DSA, projects, CGPA, and interview scores.
- Upcoming deadlines & interview rounds agenda widget.
- Actionable AI-driven insights based on your pipeline health.

### 2. 🛡️ War Room (`/war-room`)
- Multi-view application tracker: Drag-and-drop Kanban board & searchable table view.
- Complete CRUD operations with company branding colors and tags.
- Detailed slide-over application drawer with event history timeline, referral tracking, and salary/stipend tags.
- Quick status progression (Applied ➔ OA ➔ OA Cleared ➔ Interview ➔ Offer / Rejected / Ghosted).

### 3. 📄 Resume Intelligence (`/resume-intelligence`)
- Deterministic ATS score calculation engine (no external API keys needed).
- Match vs. missing skill breakdown for any target Job Description (JD).
- Multi-dimensional scoring: ATS compatibility, Technical keyword density, Impact statement strength, and Experience alignment.
- Actionable recommendations with bullet-point improvement tips.
- Multi-version resume manager with response rate A/B analytics.

### 4. 🎙️ Interview Replay (`/interview-replay`)
- Interactive mock interview simulation across Technical, Behavioral, HR, and Rapid-fire rounds.
- Real-time Web Speech recognition transcription with instant typing fallback.
- Answer analytics: Words per minute (WPM), filler word frequency detection, and STAR method structure evaluation.
- Historical session playback with detailed report cards and improvement notes.

### 5. 🧠 Placement Twin (`/placement-twin`)
- Role benchmark matrices for 5 key profiles: Frontend Engineer, Backend Engineer, Full-Stack Engineer, Data Scientist, and DevOps Engineer.
- Interactive "What-If" simulator: See how solving +50 DSA problems or building another full-stack project increases your selection probability.
- 4-week step-by-step personalized placement prep roadmap.

### 6. 👻 Ghosted Analytics (`/ghosted`)
- Turn rejection and silence into data-driven strategy.
- Automated ghosting detection based on customizable threshold days.
- Source efficacy analysis (LinkedIn vs. Referrals vs. Campus vs. Career Portals).
- Pre-drafted professional follow-up email templates ready to copy and send.

### 7. 🛠️ Supporting Tools
- **Skills Matrix (`/skills`)**: Category-wise skill level tracker and LeetCode/DSA problem counter.
- **Calendar & Deadlines (`/calendar`)**: Month and agenda view with one-click `.ics` export for Google/Apple Calendar.
- **Student Profile (`/profile`)**: Academic CGPA, portfolio, credentials, and social links.
- **Workspace Settings (`/settings`)**: Ghosted threshold configuration, dark/light theme, and offline JSON backup/restore.

---

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Deep Dark Glassmorphism Design System
- **Icons**: Lucide React + custom inline SVGs
- **Charts**: Recharts
- **Storage**: Offline-first `localStorage` sandbox with pre-seeded demo dataset

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/placement-os.git
cd placement-os

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view PlacementOS.

---

## 🚢 Building for Production

```bash
# Lint code
npm run lint

# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🔒 Privacy & Offline First

PlacementOS runs entirely inside your browser. All student details, notes, interview answers, and resumes are saved in your browser's `localStorage` sandbox. No external servers or API keys are required. You can export a complete JSON backup anytime from Settings.
