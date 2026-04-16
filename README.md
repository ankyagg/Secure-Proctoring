# 🛡️ Secure Proctor - AI-Enhanced Online Proctoring & Assessment Platform

Secure Proctor is a comprehensive, production-ready online assessment and coding platform designed to ensure exam integrity. It provides a seamless experience for students to solve performance-critical problems while giving administrators real-time monitoring and anti-cheat capabilities.

---

## 🚀 Key Features

### 👨‍🎓 Student Experience
- **Fluid Coding Workspace**: A high-performance code editor supporting C++, Java, and Python.
- **Wandbox Integration**: Instant code compilation and execution via cloud-based compilers.
- **Intelligent Feedback**: Real-time feedback on test cases (Accepted, Wrong Answer, TLE, MLE, CE).
- **Proctoring Overlay**: Persistent webcam preview ensuring honesty throughout the session.
- **Secure Fullscreen Experience**: Automatic enforcement of fullscreen mode to prevent distraction.

### 👩‍💼 Admin Management
- **Anti-Cheat Monitoring**: A dedicated dashboard to track student violations (Tab switching, Fullscreen exiting).
- **Suspicion Scoring**: Automatic risk assessment for each participant based on behavioral triggers.
- **Content Management**: Full CRUD operations for creating problems, test cases, and scheduled contests.
- **Submission Monitoring**: Live feed of all student submissions with detailed breakdown of execution metrics (Time, Memory).
- **Database Seeding**: Built-in scripts to quickly populate the platform with challenges.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS 4, Framer Motion, Lucide Icons |
| **UI Components** | Radix UI, Material UI (MUI) |
| **Backend** | Firebase Firestore, Node.js, Express |
| **Execution** | Wandbox API (Production), Docker + Judge0 (Self-hosted options) |
| **Integrations** | Firebase Auth, Firebase Admin SDK |

---

## 📂 Project Architecture

```bash
├── backend/            # Express server (Firebase admin & Docker logic)
├── src/
│   ├── app/
│   │   ├── components/ # Reusable UI & Layouts (Navbar, Sidebar, Webcam)
│   │   ├── pages/      # Core screens (Student Workspace, Admin Dashboard)
│   │   ├── services/   # Firebase & API interaction logic
│   │   └── routes.tsx  # Dynamic routing configuration
│   ├── styles/         # Global styles & Tailwind config
│   └── main.tsx        # Application entry point
├── judge0/             # Infrastructure for local Judge0 deployment
├── start_all.bat       # Unified startup script
└── package.json        # Dependencies & scripts
```

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)
- [Firebase account](https://firebase.google.com/) for database and auth

### Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ankyagg/Secure-Proctoring.git
   cd Secure-Proctoring
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Launch Application**:
   Simply run the start script:
   ```bash
   ./start_all.bat
   ```
   The application will be available at [http://localhost:5173](http://localhost:5173).

---

## ⚖️ License
This project is licensed under the **ISC License**. See the `LICENSE` file for details (or `package.json`).

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

*Developed with ❤️ for secure educational environments.*
