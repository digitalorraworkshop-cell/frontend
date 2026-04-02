# Employee Tracker & Management System

A robust, full-stack enterprise solution for monitoring employee activity, managing attendance, tasks, and real-time team collaboration.

## 🚀 Key Features

- **Activity Monitoring**: Real-time screenshot capture and idle time tracking.
- **Attendance System**: Check-in/out, leave management, and automated monthly credits.
- **Task Management**: Project-wise task assignment, daily to-do lists, and progress tracking.
- **Real-time Chat**: Enterprise-wide team chat and group discussions via Socket.io.
- **Admin Dashboard**: Comprehensive analytics, productivity metrics, and employee profiles.
- **Asset Management**: Tracking company assets assigned to employees.
- **Birthday System**: Automated reminders and celebratory banners.

## 🛠 Tech Stack

### Frontend
- **React (Vite)**: Modern UI library.
- **Tailwind CSS**: Utility-first styling for responsiveness.
- **Recharts**: Data visualization for productivity metrics.
- **Lucide React**: Premium icon set.
- **Socket.io Client**: Real-time bidirectional communication.

### Backend
- **Node.js & Express**: High-performance backend routing.
- **MongoDB (Mongoose)**: Scalable NoSQL database.
- **Socket.io**: Real-time server-side events.
- **Multer**: File upload handling for profile pictures and screenshots.
- **JWT**: Secure token-based authentication.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd employee-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided environment variables
   npm run build # (Optional)
   node server.js
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with VITE_API_URL
   npm run dev
   ```

---

## 🎨 UI/UX Philosophy

This project prioritizes a **Premium & Responsive** experience. It utilizes:
- **Glassmorphism**: Subtle blurs and translucent backgrounds for a modern depth.
- **Dynamic Layouts**: Full compatibility with mobile, tablet, and desktop views.
- **Micro-animations**: Smooth transitions using CSS and Framer-like interactions.

---

## 🤝 Project Structure

```text
├── backend/            # Express, MongoDB, Socket.io
├── frontend/           # React, Tailwind, Recharts
└── desktop/           # (Optional) Electron-based activity monitor
```

---
*Created with ❤️ by TimeTracker Corp*
