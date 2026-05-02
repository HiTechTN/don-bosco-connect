# Don Bosco Connect

Digital educational platform for Don Bosco Tunis school.

## Project Structure

```
/
├── backend/          # Django API server
├── web/              # React + Electron desktop app
└── mobile/           # React Native mobile app
```

## Quick Start

### Backend
```bash
cd backend
cp env.example .env
python manage.py migrate
python manage.py runserver
```

### Web
```bash
cd web
npm install
npm run electron:dev
```

### Mobile
```bash
cd mobile
npm install
npm run start
```

## Tech Stack

- **Backend**: Django, FastAPI, PostgreSQL, pgvector, Ollama
- **Web/Desktop**: React, Electron
- **Mobile**: React Native (Expo)