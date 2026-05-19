# Don Bosco Connect — Frontend Web

<p align="center">
  <img src="https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/shadcn/ui-latest-000000?style=flat-square" alt="shadcn/ui"/>
</p>

Interface web de **Don Bosco Connect** — SPA moderne avec React 18, Vite, Tailwind CSS et shadcn/ui.

## 🚀 Démarrer

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # Build production → dist/
npm run preview   # Prévisualiser le build
```

## 📁 Structure

```
src/
├── pages/         # Tableaux de bord (admin, teacher, student, parent)
│   ├── admin/     # Dashboard, Users, Classes, Timetable, Audit
│   ├── teacher/   # Dashboard, Courses, Grades, Absences, Messages, AI
│   ├── student/   # Dashboard, Grades, Absences, Timetable, Quiz, AI, Gamification
│   └── parent/    # Dashboard, Grades, Absences, Messages
├── components/    # UI components (shadcn/ui + custom)
├── hooks/         # Custom React hooks
├── lib/           # Utilitaires, mock API
├── i18n/          # FR / EN / AR
└── types/         # TypeScript types
```

## 🔗 Liens

- [README principal](../README.md)
- [Guide utilisateur](../GUIDE_UTILISATION.md)
- [Démo](https://hitechtn.github.io/don-bosco-connect)
