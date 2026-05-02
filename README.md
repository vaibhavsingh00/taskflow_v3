<<<<<<< HEAD
# 🚀 TaskFlow v2 — Premium Collaborative Team Task Manager SaaS

TaskFlow v2 is a full-stack production-ready collaborative task management platform built to streamline how Admins, Managers, and Team Members plan projects, assign work, track progress, and monitor execution in real time.

Designed as a modern SaaS productivity solution, TaskFlow combines structured project assignment, transparent task collaboration, member accountability, and dashboard analytics into one centralized workflow.

> Built with scalability, real-time team visibility, and professional UX in mind.

---

## 🌟 Core Highlights

✅ Secure Gmail OTP based Authentication & Verification  
✅ Forgot Password with OTP Reset Flow  
✅ Role Based Access Control (Admin / Manager / Member)  
✅ Project Creation, Assignment & Lifecycle Management  
✅ Task Creation with Priority, Due Date & Progress Tracking  
✅ Member Acceptance & Real-Time Task Status Updates  
✅ Kanban Board + Table View Workflow  
✅ Search, Multi Filters & Smart Task Navigation  
✅ Team Member Collaboration with Comments  
✅ Progress Analytics Dashboard with Completion Insights  
✅ Fully Responsive Premium SaaS Interface

---

## 🎯 Problem This Project Solves

Managing team productivity becomes difficult when work is assigned but execution visibility is missing.

TaskFlow solves this by creating a transparent workflow where:

- leadership can assign and monitor work,
- members can continuously update execution progress,
- deadlines can be tracked,
- and all activity becomes visible from one dashboard.

This reduces communication gaps, delayed follow-ups, and unclear ownership.

---

## 👥 User Roles & Workflow

### 👑 Admin
Admin has complete platform control and can:

- Create / Update / Delete Projects
- Create and Assign Tasks
- Add or Manage Team Members
- Monitor Member Performance
- Track Overdue / Pending / Completed Tasks
- View Progress Analytics
- Review Latest Team Updates

---

### 🧑‍💼 Manager
Managers act as execution supervisors and can:

- Manage assigned projects
- Assign tasks to members
- Track day-to-day project completion
- Review task comments and progress notes

---

### 👨‍💻 Member
Members work on assigned deliverables and can:

- View assigned tasks only
- Accept or start work
- Update task status
- Add completion percentage
- Post comments / work notes
- Track deadlines and priorities

---

## 🔄 Real-Time Collaboration Workflow

```text
Admin/Manager Creates Project
          ↓
Assign Tasks to Members
          ↓
Members Accept Assigned Work
          ↓
Members Update Status + Progress + Comments
          ↓
Dashboard Instantly Reflects All Activity
          ↓
Leadership Monitors Completion & Delays

📊 Dashboard Analytics

TaskFlow provides centralized analytics to help leadership monitor team productivity:

Total Projects
Total Active Tasks
Completed Tasks
In Progress Tasks
Review Queue
Overdue Tasks
Team Productivity Insights
Project Completion Ratios

This allows faster decision making and efficient execution control.

🧩 Advanced Features in v2
🔐 Authentication System
Gmail OTP verification during signup
Secure login using JWT authentication
Forgot password reset via OTP
Protected routes with persistent login session
📁 Project Management
Create and organize multiple projects
Add project descriptions, deadlines, and members
Structured ownership management
📌 Task Management
Create tasks under projects
Assign individual members
Set priority:
Low
Medium
High
Define due dates
Track member execution updates
📋 Flexible Task Views
Kanban Board View
Table/List View

This allows both visual tracking and detailed management.

💬 Team Collaboration
Comment system for execution notes
Progress updates
Work visibility between managers and members
🛠 Tech Stack
Frontend
React.js
Vite
Tailwind CSS
Axios
React Router DOM
Backend
Node.js
Express.js
Database
MongoDB Atlas + Mongoose
Security / Auth
JWT Authentication
bcrypt Password Hashing
Gmail OTP via Nodemailer
Deployment
Railway (Production Ready)
📂 Clean Folder Architecture
taskflow/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/
        ├── context/
        ├── components/
        ├── pages/
        └── styles/
⚙️ Local Development Setup
Backend Environment

Create backend/.env

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
Frontend Environment

Create frontend/.env

VITE_API_URL=http://localhost:5000/api
Run Application
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

Open in browser:

http://localhost:3000
🔐 Gmail OTP Setup
Open Google Account Security Settings
Enable 2-Step Verification
Generate Gmail App Password
Add generated 16-character password in EMAIL_PASS
🌐 Production Deployment

This application is fully configured for cloud deployment using Railway.

Deployment includes:

frontend production build
backend API hosting
MongoDB Atlas cloud database
environment variable configuration
📡 Main API Modules
Auth APIs
/api/auth/send-otp
/api/auth/verify-otp
/api/auth/register
/api/auth/login
/api/auth/reset-password
/api/auth/me
Project APIs
project CRUD + member management
Task APIs
task CRUD + status updates + filters + comments
🧠 Engineering Focus Behind This Build

While developing TaskFlow v2, the major focus areas were:

role-based workflow clarity
scalable backend architecture
secure authentication
real-time member visibility
modern SaaS-grade user experience
deployment readiness

This project was built not as a simple CRUD app, but as a practical team productivity system.

👨‍💻 Developed By

Vaibhav Singh
=======
# taskflow_v3
Modern MERN-based project and task management platform built for team collaboration, member productivity tracking, and admin analytics.
>>>>>>> 93a425879f909838fcc3a288919a99afd5510c46
