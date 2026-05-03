# Kaamio — Full-Stack Team Task Management Platform

> **Work Smart. Build Faster.**

A startup-grade collaborative work management platform inspired by Trello, Asana, ClickUp, and Notion task boards.

---

## 🚀 Live Demo

| Role   | Email                | Password    |
|--------|----------------------|-------------|
| Admin  | admin@kaamio.dev     | kaamio123   |
| Member | member@kaamio.dev    | kaamio123   |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 👥 **Role-based Access** — Admin & Member roles with protected routes
- 📁 **Project Management** — Create, edit, archive, and track progress
- ✅ **Task Management** — Full CRUD, priority levels, labels, subtasks
- 🗂️ **Kanban Board** — Drag-and-drop task status updates (dnd-kit)
- 📊 **Analytics Dashboard** — Pie charts, bar graphs, productivity metrics
- 🔔 **Real-time Notifications** — Socket.io powered live alerts
- 📋 **Activity Log** — Full audit trail per project
- 💬 **Comments** — Task-level collaboration
- 🌙 **Dark Mode** — Beautiful dark theme throughout
- 📱 **Responsive** — Mobile-first design

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework |
| Redux Toolkit | State management |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| dnd-kit | Drag and drop |
| Recharts | Analytics charts |
| Socket.io-client | Real-time |
| React Hook Form | Form handling |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | Server |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Auth |
| Socket.io | WebSockets |
| Helmet + CORS + Rate-limiting | Security |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend |
| Railway | Backend |
| MongoDB Atlas | Database |

---

## 📁 Project Structure

```
kaamio/
├── client/              # React frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route-level pages
│       ├── layouts/     # Layout wrappers
│       ├── redux/       # Redux slices & store
│       ├── services/    # API + utility services
│       └── hooks/       # Custom React hooks
│
├── server/              # Express backend
│   ├── config/          # DB config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth & role middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routers
│   └── sockets/         # Socket.io setup
│
└── README.md
```

---

## ⚡ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/kaamio.git
cd kaamio

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
# In server/
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kaamio
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Demo Users (optional)

```bash
cd server
node scripts/seed.js
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open `http://localhost:5173`

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project (Admin) |
| GET | `/api/projects/:id` | Get project with tasks |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| PUT | `/api/projects/:id/archive` | Archive project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Remove member |
| GET | `/api/projects/analytics/summary` | Admin analytics |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks/my` | Get my assigned tasks |
| GET | `/api/tasks/project/:id` | Tasks by project |
| POST | `/api/tasks` | Create task (Admin) |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |
| POST | `/api/tasks/:id/comments` | Add comment |
| PUT | `/api/tasks/:id/subtasks/:sid` | Update subtask |
| PUT | `/api/tasks/bulk-status` | Bulk Kanban update |

### Users (Admin)
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/users` | List all users |
| GET | `/api/users/productivity` | Productivity stats |
| PUT | `/api/users/:id/role` | Change role |
| PUT | `/api/users/:id/deactivate` | Deactivate user |

### Notifications
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notifications` | Get my notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/:id` | Delete |

---

## 🚢 Deployment Guide

### Vercel (Frontend)
1. Push `client/` to GitHub
2. Import in Vercel
3. Set `VITE_API_URL` if using separate domain
4. Deploy

### Railway (Backend)
1. Create new project in Railway
2. Connect GitHub repo
3. Set env variables from `.env.example`
4. Deploy

### MongoDB Atlas
1. Create free M0 cluster
2. Whitelist IP `0.0.0.0/0`
3. Create DB user
4. Copy connection string to `MONGO_URI`

---

## 🎨 Design System

- **Font:** Plus Jakarta Sans
- **Primary:** `#7c3aed` (Brand Purple)
- **Background:** `#0f1117` (Deep Dark)
- **Surface:** `#1e2535` (Card Dark)

---

## 🏆 Recruiter Notes

Kaamio demonstrates:
- ✅ Full-stack architecture with separation of concerns
- ✅ JWT auth with role-based access control
- ✅ Real-time features via WebSockets
- ✅ Complex state management with Redux Toolkit
- ✅ Drag-and-drop Kanban with dnd-kit
- ✅ Aggregation pipelines for analytics
- ✅ Production security (Helmet, Rate limiting, CORS, input sanitization)
- ✅ Clean component architecture & reusable UI library
- ✅ Live deployment readiness (Vercel + Railway)

---

Built with ❤️ as a showcase full-stack project.
