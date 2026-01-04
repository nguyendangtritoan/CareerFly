# CareerFly

**CareerFly** is a "Local-First, Cloud-Sync" Progressive Web Application (PWA) designed to solve "Recency Bias" in software engineering performance reviews. It allows frictionless logging of daily work, which is then aggregated into meaningful metric and exported for performance reviews.

## Features

### ⚡️ Core Experience
- **Local-First**: Works 100% offline using `Dexie.js` (IndexedDB).
- **Composer**: A Tiptap-based rich text editor with Markdown support.
- **Mentions**: Tag skills or projects using `#` (e.g., `#React`, `#BugFix`).
- **Timeline**: Daily logs grouped weekly for a smooth review experience.

### 🧠 Analytics & Review
- **Learned Bank**: Visualizes acquired skills over time.
- **Impact Distribution**: Break down your work by Low/Medium/High impact.
- **Heatmap**: GitHub-style contribution calendar.
- **Template Exporter**: One-click generation of performance summaries.

### 🔌 Power User Features
- **Command Palette** (`Cmd+K`): Quick navigation and actions.
- **Manager Mode**: Filter out private logs for screen sharing.
- **Natural Language Dates**: "Yesterday: Fixed header bug".
- **Floating Action Button**: Mobile-optimized quick log entry.

### ☁️ Cloud Sync (Phase 3)
- **Authentication**: Google Sign-In via Firebase.
- **Shadow Sync**: Automatically mirrors local data to Firestore when online.
- **Cross-Device**: Seamlessly switch between desktop and mobile.

## Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS + `shadcn/ui` (custom integration)
- **Database**: Dexie.js (Local) + Firebase Firestore (Cloud)
- **State**: Zustand + TanStack Query

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase Project (for sync features)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/careerfly.git
    cd careerfly
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    Copy `.env.example` to `.env` and fill in your Firebase keys.
    ```bash
    cp .env.example .env
    ```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## License
MIT