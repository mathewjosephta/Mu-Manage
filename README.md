# μManage

A modern team management and productivity platform built for campus teams, student organizations, hackathon squads, and collaborative project workflows.

μManage helps teams manage tasks, communicate in real time, track progress, monitor productivity, and stay accountable through structured collaboration tools.

---

## Features

### Authentication & Role Management
- Secure authentication using Supabase Auth
- Role-based access system
- Project Manager (PM)
- Team Lead
- Team Member

---

## Team Chat
- Real-time team communication
- Separate chat rooms for each team
- PM can access all team chats
- Unread message notification badges
- Live updates using Supabase Realtime

---

## Task Management
- Create and assign tasks
- Team-wise task organization
- Task statuses:
  - Pending
  - In Progress
  - Completed
- Task priorities:
  - Low
  - Medium
  - High
- Due dates
- Task details drawer
- Real-time task updates

---

## Task Collaboration
- Task comments system
- Live task discussions
- Team workflow tracking
- Realtime synchronization

---

## Analytics Dashboard
- Productivity overview
- Team performance charts
- Task distribution insights
- Recent activity tracking
- Real-time analytics updates

---

## Calendar & Daily Updates
- Daily update tracking
- Locked previous day entries
- Same-day edit support
- Streak-like workflow system

---

## Linkedin Progress Tracking
- Weekly Linkedin update sections
- Week-wise activity organization
- Personal growth tracking

---

# Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React

## Backend
- Supabase
  - PostgreSQL
  - Authentication
  - Realtime
  - Storage

---

# Project Structure

```bash
src/
│
├── components/
│   ├── TaskCard.jsx
│   ├── Sidebar.jsx
│   └── ...
│
├── layouts/
│   └── MainLayout.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Tasks.jsx
│   ├── TeamChat.jsx
│   ├── Analytics.jsx
│   ├── Calendar.jsx
│   └── ...
│
├── routes/
│   └── ProtectedRoute.jsx
│
├── services/
│   └── supabase.js
│
└── App.jsx
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/mathewjosephta/Mu-Manage
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file in root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# Required Supabase Tables

## users

```sql
id uuid
name text
email text
role text
team_name text
```

---

## tasks

```sql
id uuid
title text
description text
assigned_to text
team_name text
priority text
status text
due_date date
created_by text
created_at timestamp
```

---

## task_comments

```sql
id uuid
task_id uuid
user_name text
user_role text
comment text
created_at timestamp
```

---

## team_messages

```sql
id uuid
team_name text
sender_name text
sender_email text
message text
created_at timestamp
```

---

## daily_updates

```sql
id uuid
user_email text
date date
update text
created_at timestamp
```

---

# Realtime Features

μManage uses Supabase Realtime for:
- Live chat
- Instant task updates
- Real-time analytics
- Live comments
- Notifications

---

# Future Improvements

- File uploads
- Voice messages
- Task deadline reminders
- Standup system
- Activity logs
- AI productivity insights
- Push notifications
- Team performance scoring

---


# License

This project is licensed under the MIT License.

---

# Author

Built by Mathew Joseph

- React Developer
- Design Lead at CSI SB ASIET
- IEEE SB ASIET Design Team
- IEEE Xtreme 19.0 Student Branch Ambassador

---

# Vision

μManage aims to simplify collaborative workflows for student communities, startup teams, and project-based organizations with a clean, modern, and real-time productivity experience.
