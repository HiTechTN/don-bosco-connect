# 📘 Don Bosco Connect — User Guide

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-c96442?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/badge/status-production-059669?style=flat-square" alt="Status"/>
</p>

## 🔐 Login & Roles

### Access
- **Web** : `http://localhost:8080` (or your deployed domain)
- **Mobile** : Expo Go or native build

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | `admin@donbosco.tn` | `admin123!` |
| 👨‍🏫 Teacher | `karim.hamdi@donbosco.tn` | `teacher123!` |
| 🧑‍🎓 Student | `adam.slim@donbosco.tn` | `student123!` |
| 👪 Parent | `ahmed.slim@parent.tn` | `parent123!` |

---

## 🛡️ Admin Dashboard

1. **User Management** — CRUD accounts, assign roles, link students to parents
2. **Classes & Subjects** — Create classes, set capacity (default 30), assign homeroom teachers
3. **Timetable** — Create slots per class with overlap detection
4. **School Year** — Manage academic years (only one active at a time)
5. **Audit Logs** — All admin actions logged with filters
6. **Analytics** — Usage stats, grade distribution, AI conversations

---

## 👨‍🏫 Teacher Dashboard

1. **Courses** — Upload PDF/DOCX/video, published to students
2. **Grades** — Create evaluations (Quiz, Exam, Project, Oral, etc.), enter scores, publish
3. **Absences** — Record absence/late/excused, justification workflow
4. **AI Assistant** — Generate quizzes from course content, RAG tutor
5. **Messaging** — AES-256-GCM encrypted chat with parents & admin

---

## 🧑‍🎓 Student Dashboard

1. **AI Mentor** — Ask questions about course content (RAG), 24/7
2. **Adaptive Quizzes** — Difficulty adjusts in real-time (remediation → normal → advanced)
3. **Gamification** — XP, 7 badges, streaks, friendly leaderboard
4. **Grades & Absences** — View published scores and attendance
5. **Portfolio** — Export PDF with achievements and QR-coded badges

---

## 👪 Parent Dashboard

1. **Monitoring** — Real-time grades, absences, messages for linked children
2. **Justify Absences** — Submit justification through the platform
3. **Messaging** — Encrypted chat with teachers
4. **Calendar** — School events, homework deadlines

---

## 🌍 Multi-language

Click the 🌐 icon (top-right) to switch between **Français · English · العربية**.

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Can't log in** | Check email/password, use "Forgot password", or contact admin |
| **AI not responding** | Ensure Ollama is running: `curl http://localhost:11434/api/tags` |
| **Blank page** | Enable JavaScript, try Chrome/Firefox, check F12 console |
| **Quizzes not showing** | Refresh (F5), clear browser cache |

**Support** : [GitHub Issues](https://github.com/HiTechTN/don-bosco-connect/issues)

---

*Version 2.0.0 · © Collège Don Bosco Tunis*
