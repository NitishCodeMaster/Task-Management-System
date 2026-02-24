# TaskFlow — Employee Task Management System

A full-stack Mini SaaS application for task management with role-based access (Admin & Employee).

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas connection string)

### Setup

1. **Install server dependencies**
```bash
cd server
npm install
```

2. **Configure environment**  
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_secret_key
```

3. **Install client dependencies**
```bash
cd client
npm install
```

4. **Start the backend**
```bash
cd server
npm run dev
```

5. **Start the frontend** (in a new terminal)
```bash
cd client
npm run dev
```

6. Open **http://localhost:3000** in your browser

## Features

### Admin
- Dashboard with task/user statistics
- Create, edit, delete tasks
- Assign tasks to employees
- Update task priority, status, deadline

### Employee
- Personal dashboard with task counts
- View assigned tasks
- Update task status (Pending → In Progress → Completed)
- Overdue task indicators

## Project Structure

```
task-manager/
├── server/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/auth.js     # JWT + role guards
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routes
│   ├── server.js             # Entry point
│   └── .env                  # Environment config
├── client/
│   ├── src/
│   │   ├── components/       # Sidebar, TaskModal, ProtectedRoute
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # Login, Register, Admin/Employee Dashboard
│   │   ├── services/api.js   # Axios instance
│   │   ├── App.jsx           # Router
│   │   └── index.css         # Design system
│   └── vite.config.js        # Vite + proxy config
└── README.md
```
