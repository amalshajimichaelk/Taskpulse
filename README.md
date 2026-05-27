# ⚡ TaskPulse

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js & Express">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io">
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  <i>A modern, elegant, and real-time project management platform designed to help teams collaborate and ship faster.</i>
</p>

---

Welcome to **TaskPulse**, a comprehensive full-stack application designed to handle team coordination, task tracking, and project management in real-time. Built with a modern React frontend and a robust Node.js/Express backend, TaskPulse leverages Socket.IO for instant live updates and MongoDB for scalable data storage.

---

## ✨ Key Features

* **Secure Authentication:** JWT-based login and registration system to protect user workspaces and projects.
* **Real-time Collaboration:** 
    * Powered by Socket.IO, see exactly who is online instantly (green status indicators).
    * Board and task updates sync live across all connected clients without needing to refresh the page.
* **Complete Project Management:**
    * **Kanban Boards:** Drag-and-drop interface for managing tasks across different stages.
    * **Task Management:** Create, assign, update, and track tasks with priorities, due dates, and rich descriptions.
* **Team & Member Management:**
    * Invite new members via an integrated email invitation system.
    * Role-based access control (Admin, Project Manager, Team Member).
* **AI-Powered Insights:** 
    * Integrated with Google Gemini AI to analyze project progress and provide intelligent summaries and task recommendations.
* **Analytics & Reporting:**
    * Interactive charts (Recharts) visualizing task completion rates, team workloads, and project health.
    * Export reports dynamically to PDF.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 (Vite) |
| **Backend Environment** | Node.js & Express |
| **Database & ORM** | MongoDB & Mongoose |
| **Real-time Engine** | Socket.IO |
| **State Management** | Zustand & React Query |
| **Styling & UI** | TailwindCSS & Motion (Framer Motion) |

---

## 🏛️ Architecture

This project is structured as a **Monolithic Full-Stack Application**, meaning both the frontend and backend are housed within the same repository and served together in production.

* **Frontend (`src/`):** A Single Page Application (SPA) built with React. It communicates with the backend via RESTful APIs and maintains a persistent WebSocket connection for live events.
* **Backend (`src/server/` & `server.ts`):** An Express server that exposes the API routes, handles JWT authentication, and mounts the Socket.IO server for real-time broadcasting.
* **Database Layer:** Mongoose schemas define the structure of Users, Projects, Tasks, and Workspaces, providing strict data validation before persisting to MongoDB.

This unified approach makes the application easy to develop locally while being highly robust in production environments like Render.

---

## 🗄️ Database Setup

TaskPulse uses **MongoDB Atlas** (or a local MongoDB instance). You do not need to manually run SQL scripts to create tables; Mongoose will automatically generate the required collections when the server starts.

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string (URI).
3. Create a `.env` file in the root of the project and add your URI:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/taskpulse"
   ```

---

## 🚀 How to Run

### Prerequisites

1. **Node.js:** Ensure you have Node.js (v18+) installed.
2. **MongoDB:** A running MongoDB instance or an Atlas URI.
3. **API Keys:** A Google Gemini API key if you want to use the AI features.

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amalshajimichaelk/Taskpulse.git
   cd Taskpulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   * Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   * Open `.env` and fill in your `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   * The app will now be running at `http://localhost:3000`. Vite handles the frontend hot-reloading, while `tsx` runs the backend Express server.

### Production Build

To build and run the optimized production version:
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
Taskpulse/
├── .env                  # Environment variables
├── package.json          # Project dependencies & scripts
├── server.ts             # Main backend Express & Socket.IO entry point
├── vite.config.ts        # Vite configuration
└── src/
    ├── components/       # Reusable React UI components
    ├── pages/            # Main application views/pages
    ├── store/            # Zustand state management
    ├── lib/              # Frontend utilities and API clients
    └── server/           # Backend Source Code
        ├── controllers/  # API route logic
        ├── models/       # Mongoose database schemas
        ├── routes/       # Express API definitions
        └── utils/        # Backend utilities (Email, AI, etc.)
```
                
---

## 📸 Screenshots

| Dashboard View | Kanban Board |
| :---: | :---: |
| <img width="1200" alt="Dashboard Screenshot" src="https://via.placeholder.com/1200x800.png?text=TaskPulse+Dashboard+Screenshot"> | <img width="1200" alt="Kanban Screenshot" src="https://via.placeholder.com/1200x800.png?text=TaskPulse+Kanban+Screenshot"> |

| Team Management | AI Insights |
| :---: | :---: |
| <img width="1200" alt="Team Screenshot" src="https://via.placeholder.com/1200x800.png?text=TaskPulse+Team+Screenshot"> | <img width="1200" alt="AI Insights Screenshot" src="https://via.placeholder.com/1200x800.png?text=TaskPulse+AI+Screenshot"> |

*(Note: Replace the placeholder image URLs above with actual screenshots of TaskPulse by uploading them to GitHub issues/PRs and pasting the links here).*

---

## 👨‍💻 Team Members

| Member | GitHub | Role |
| :---: | :---: | :---: |
| Amal Shaji Michael | <a href="https://github.com/amalshajimichaelk" target="_blank">@amalshajimichaelk</a> | Full Stack Developer |
