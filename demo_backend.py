"""
Backend de démonstration pour Don Bosco Connect.
Utilise SQLite au lieu de PostgreSQL pour fonctionner sans Docker.
"""
import uuid
import json
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
import sqlite3
import os
import asyncio

app = FastAPI(title="Don Bosco Connect - Demo", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "demo-secret-key-don-bosco-2026"
ALGORITHM = "HS256"
DB_PATH = "/tmp/donbosco_demo.db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Database setup ────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            status TEXT DEFAULT 'active',
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            preferred_language TEXT DEFAULT 'fr',
            mfa_enabled INTEGER DEFAULT 0,
            last_login_at TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            token_hash TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            revoked_at TEXT
        );
    """)
    # Seed demo users
    existing = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if existing == 0:
        users = [
            ("admin@donbosco.tn", pwd_context.hash("admin123!"), "admin", "Admin", "Don Bosco"),
            ("karim.hamdi@donbosco.tn", pwd_context.hash("teacher123!"), "teacher", "Karim", "Hamdi"),
            ("adam.slim@donbosco.tn", pwd_context.hash("student123!"), "student", "Adam", "Slim"),
            ("ahmed.slim@parent.tn", pwd_context.hash("parent123!"), "parent", "Ahmed", "Slim"),
        ]
        for email, pw, role, first, last in users:
            conn.execute(
                "INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), email, pw, role, first, last),
            )
        conn.commit()
    conn.close()

init_db()

# ── Schemas ───────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

# ── Auth helpers ─────────────────────────────────────────

def create_access_token(user_id: str, role: str):
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: str):
    token_raw = str(uuid.uuid4()) + str(uuid.uuid4())
    token_hash = str(hash(token_raw))
    conn = get_db()
    conn.execute(
        "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
        (str(uuid.uuid4()), user_id, token_hash, (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()),
    )
    conn.commit()
    conn.close()
    return token_raw

# ── Auth endpoints ───────────────────────────────────────

@app.post("/api/v1/auth/login")
async def login(body: LoginRequest):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (body.email,)).fetchone()
    conn.close()
    if not user or not pwd_context.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if user["status"] == "suspended":
        raise HTTPException(status_code=403, detail="Compte suspendu")
    access_token = create_access_token(user["id"], user["role"])
    refresh_token = create_refresh_token(user["id"])
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "preferred_language": user["preferred_language"],
            "mfa_enabled": bool(user["mfa_enabled"]),
        },
    }

@app.post("/api/v1/auth/refresh")
async def refresh(body: RefreshRequest):
    return {"access_token": create_access_token("demo", "admin"), "refresh_token": body.refresh_token}

@app.get("/api/v1/users/me")
async def get_current_user(authorization: str = Header("")):
    token = authorization.replace("Bearer ", "") if authorization else ""
    user_id = None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        pass
    conn = get_db()
    if user_id:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    else:
        user = conn.execute("SELECT * FROM users LIMIT 1").fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "status": user["status"],
        "preferred_language": user["preferred_language"],
        "mfa_enabled": bool(user["mfa_enabled"]),
        "created_at": user["created_at"],
    }

@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "db": "sqlite", "mode": "demo"}

@app.get("/health")
async def health_root():
    return await health()

# ── Mock data ───────────────────────────────────────────

MOCK_DATA = {
    "users": [
        {"id": "u1", "email": "admin@donbosco.tn", "role": "admin", "first_name": "Admin", "last_name": "Don Bosco", "status": "active", "phone": "+21670123456", "preferred_language": "fr"},
        {"id": "u2", "email": "karim.hamdi@donbosco.tn", "role": "teacher", "first_name": "Karim", "last_name": "Hamdi", "status": "active", "phone": "+21670123457"},
        {"id": "u3", "email": "sami.benali@donbosco.tn", "role": "teacher", "first_name": "Sami", "last_name": "Ben Ali", "status": "active"},
        {"id": "u4", "email": "leila.trabelsi@donbosco.tn", "role": "teacher", "first_name": "Leila", "last_name": "Trabelsi", "status": "active"},
        {"id": "u5", "email": "adam.slim@donbosco.tn", "role": "student", "first_name": "Adam", "last_name": "Slim", "status": "active"},
        {"id": "u6", "email": "yasmine.gharbi@donbosco.tn", "role": "student", "first_name": "Yasmine", "last_name": "Gharbi", "status": "active"},
        {"id": "u7", "email": "rayen.mansour@donbosco.tn", "role": "student", "first_name": "Rayen", "last_name": "Mansour", "status": "active"},
        {"id": "u8", "email": "ahmed.slim@parent.tn", "role": "parent", "first_name": "Ahmed", "last_name": "Slim", "status": "active"},
    ],
    "academic_years": [{"id": "ay1", "name": "2025-2026", "start_date": "2025-09-01", "end_date": "2026-06-30", "is_current": True}],
    "classes": [
        {"id": "c1", "academic_year_id": "ay1", "name": "3ème A", "level": "3eme", "section": "A", "main_teacher_id": "u2", "max_students": 30, "created_at": "2025-09-01"},
        {"id": "c2", "academic_year_id": "ay1", "name": "4ème Sciences", "level": "4eme", "section": "Sciences", "main_teacher_id": "u3", "max_students": 30},
        {"id": "c3", "academic_year_id": "ay1", "name": "Terminale Maths", "level": "terminale", "section": "Maths", "main_teacher_id": "u4", "max_students": 25},
    ],
    "subjects": [
        {"id": "s1", "name": "Mathématiques", "name_ar": "رياضيات", "code": "MATH", "color": "#EF4444", "coefficient": 3.0},
        {"id": "s2", "name": "Français", "name_ar": "الفرنسية", "code": "FR", "color": "#3B82F6", "coefficient": 2.0},
        {"id": "s3", "name": "Arabe", "name_ar": "العربية", "code": "AR", "color": "#10B981", "coefficient": 2.0},
        {"id": "s4", "name": "Anglais", "name_ar": "الإنجليزية", "code": "EN", "color": "#F59E0B", "coefficient": 1.5},
        {"id": "s5", "name": "Physique-Chimie", "name_ar": "الفيزياء", "code": "PC", "color": "#8B5CF6", "coefficient": 2.5},
        {"id": "s6", "name": "Informatique", "name_ar": "إعلامية", "code": "INFO", "color": "#6366F1", "coefficient": 1.0},
    ],
}

CLASSES = [
    {"id": "c1", "academic_year_id": "ay1", "name": "3ème A", "level": "3eme", "section": "A", "main_teacher_id": "u2", "max_students": 30, "created_at": "2025-09-01"},
    {"id": "c2", "academic_year_id": "ay1", "name": "4ème Sciences", "level": "4eme", "section": "Sciences", "main_teacher_id": "u3", "max_students": 30},
    {"id": "c3", "academic_year_id": "ay1", "name": "Terminale Maths", "level": "terminale", "section": "Maths", "main_teacher_id": "u4", "max_students": 25},
]

enrollments = []  # (class_id, student_id, academic_year_id)

# ── Routes mock ────────────────────────────────────────

@app.get("/api/v1/users")
async def list_users(page: int = 1, per_page: int = 20, search: str = "", role: str = ""):
    items = MOCK_DATA["users"]
    if role:
        items = [u for u in items if u["role"] == role]
    if search:
        items = [u for u in items if search.lower() in u["first_name"].lower() or search.lower() in u["last_name"].lower()]
    total = len(items)
    pages = max(1, (total + per_page - 1) // per_page)
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": pages}

@app.post("/api/v1/users")
async def create_user():
    return MOCK_DATA["users"][0]

@app.get("/api/v1/users/{user_id}")
async def get_user(user_id: str):
    user = next((u for u in MOCK_DATA["users"] if u["id"] == user_id), MOCK_DATA["users"][0])
    return user

@app.patch("/api/v1/users/{user_id}")
async def update_user(user_id: str):
    return MOCK_DATA["users"][0]

@app.delete("/api/v1/users/{user_id}", status_code=204)
async def delete_user(user_id: str):
    return None

@app.get("/api/v1/academic-years")
async def list_academic_years():
    return MOCK_DATA["academic_years"]

@app.get("/api/v1/classes")
async def list_classes():
    return {"items": CLASSES, "total": len(CLASSES), "page": 1, "per_page": 20, "pages": 1}

@app.post("/api/v1/classes")
async def create_class():
    return CLASSES[0]

@app.get("/api/v1/classes/{class_id}")
async def get_class(class_id: str):
    c = next((c for c in CLASSES if c["id"] == class_id), CLASSES[0])
    return c

@app.post("/api/v1/classes/{class_id}/students")
async def enroll_student(class_id: str):
    enrollments.append({"class_id": class_id, "student_id": "u5", "academic_year_id": "ay1"})
    return {"ok": True}

@app.get("/api/v1/classes/{class_id}/students")
async def get_class_students(class_id: str):
    return MOCK_DATA["users"][4:7]

@app.get("/api/v1/subjects")
async def list_subjects():
    return {"items": MOCK_DATA["subjects"], "total": len(MOCK_DATA["subjects"]), "page": 1, "per_page": 20, "pages": 1}

@app.get("/api/v1/timetable")
async def get_timetable(class_id: str = ""):
    days = ["monday","tuesday","wednesday","thursday","friday"]
    slots = []
    for i, d in enumerate(days):
        for h in range(1, 5):
            slots.append({
                "id": f"ts_{d}_{h}",
                "class_id": class_id or "c1", "subject_id": f"s{(i % 6) + 1}",
                "teacher_id": f"u{(i % 3) + 2}",
                "day": d, "start_time": f"{8 + h}:00", "end_time": f"{9 + h}:00", "room": f"Salle {100 + h}",
            })
    return {"items": slots, "total": len(slots), "page": 1, "per_page": 20, "pages": 1}

@app.get("/api/v1/courses")
async def list_courses():
    return {"items": [
        {"id": "co1", "title": "Mathématiques - Chapitre 3 : Équations", "subject_id": "s1", "class_id": "c1", "teacher_id": "u2", "is_published": True, "created_at": "2026-05-10"},
        {"id": "co2", "title": "Français - Analyse de texte", "subject_id": "s2", "class_id": "c1", "teacher_id": "u3", "is_published": True, "created_at": "2026-05-12"},
        {"id": "co3", "title": "Physique-Chimie - Les solutions", "subject_id": "s5", "class_id": "c2", "teacher_id": "u4", "is_published": False, "created_at": "2026-05-14"},
    ], "total": 3, "page": 1, "per_page": 20, "pages": 1}

@app.post("/api/v1/courses")
async def create_course():
    return {"id": "co_new", "title": "Nouveau cours", "is_published": False, "created_at": datetime.now(timezone.utc).isoformat()}

@app.get("/api/v1/evaluations")
async def list_evaluations():
    return {"items": [
        {"id": "e1", "title": "Devoir de contrôle - Maths", "type": "exam", "subject_id": "s1", "class_id": "c1", "teacher_id": "u2", "max_score": 20, "coefficient": 2, "date": "2026-05-20", "is_published": True},
        {"id": "e2", "title": "Interrogation - Français", "type": "quiz", "subject_id": "s2", "class_id": "c1", "teacher_id": "u3", "max_score": 10, "coefficient": 1, "date": "2026-05-22", "is_published": True},
        {"id": "e3", "title": "Devoir de synthèse - Physique", "type": "exam", "subject_id": "s5", "class_id": "c2", "teacher_id": "u4", "max_score": 20, "coefficient": 3, "date": "2026-05-25", "is_published": False},
    ], "total": 3, "page": 1, "per_page": 20, "pages": 1}

@app.get("/api/v1/evaluations/{eval_id}/grades")
async def get_evaluation_grades(eval_id: str):
    return [
        {"id": "g1", "evaluation_id": eval_id, "student_id": "u5", "student_name": "Adam Slim", "score": 14.5, "comment": "Bien", "is_absent": False},
        {"id": "g2", "evaluation_id": eval_id, "student_id": "u6", "student_name": "Yasmine Gharbi", "score": 17.0, "comment": "Excellent", "is_absent": False},
        {"id": "g3", "evaluation_id": eval_id, "student_id": "u7", "student_name": "Rayen Mansour", "score": None, "comment": "", "is_absent": True},
    ]

@app.get("/api/v1/absences")
async def list_absences():
    return {"items": [
        {"id": "a1", "student_id": "u5", "student_name": "Adam Slim", "date": "2026-05-15", "type": "absence", "justification_status": "unjustified", "reason": "", "recorded_by": "u2", "class_name": "3ème A"},
        {"id": "a2", "student_id": "u6", "student_name": "Yasmine Gharbi", "date": "2026-05-14", "type": "absence", "justification_status": "justified", "reason": "Visite médicale", "recorded_by": "u2", "class_name": "3ème A"},
    ], "total": 2, "page": 1, "per_page": 20, "pages": 1}

@app.post("/api/v1/absences")
async def create_absence():
    return {"id": "a_new", "student_id": "u5", "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "type": "absence"}

@app.get("/api/v1/students/{student_id}/grades")
async def get_student_grades(student_id: str):
    return [
        {"id": "g1", "subject_name": "Mathématiques", "evaluation_title": "Devoir de contrôle", "score": 14.5, "max_score": 20, "coefficient": 2, "date": "2026-05-20", "is_absent": False, "comment": "Bien"},
        {"id": "g2", "subject_name": "Français", "evaluation_title": "Interrogation", "score": 8.5, "max_score": 10, "coefficient": 1, "date": "2026-05-22", "is_absent": False, "comment": ""},
        {"id": "g3", "subject_name": "Anglais", "evaluation_title": "Test", "score": 16.0, "max_score": 20, "coefficient": 1.5, "date": "2026-05-18", "is_absent": False, "comment": ""},
    ]

@app.get("/api/v1/students/{student_id}/absences")
async def get_student_absences(student_id: str):
    return [
        {"id": "a1", "date": "2026-05-15", "type": "absence", "justification_status": "unjustified", "reason": "", "class_name": "3ème A"},
    ]

@app.get("/api/v1/messages/threads")
async def list_threads():
    return []

@app.get("/api/v1/notifications")
async def list_notifications():
    return {"items": [], "total": 0, "page": 1, "per_page": 20, "pages": 0}

@app.get("/api/v1/audit/logs")
async def list_audit_logs():
    return {"items": [
        {"id": "log1", "user_id": "u1", "action": "user.login", "resource": "auth", "details": "Connexion admin", "ip_address": "127.0.0.1", "created_at": "2026-05-17T08:00:00Z"},
        {"id": "log2", "user_id": "u1", "action": "user.create", "resource": "users", "details": "Création utilisateur", "ip_address": "127.0.0.1", "created_at": "2026-05-16T14:30:00Z"},
        {"id": "log3", "user_id": "u2", "action": "grade.publish", "resource": "evaluations", "details": "Publication notes Maths", "ip_address": "127.0.0.1", "created_at": "2026-05-16T10:00:00Z"},
    ], "total": 3, "page": 1, "per_page": 50, "pages": 1}

@app.get("/api/v1/analytics/dashboard")
async def analytics_dashboard():
    return {
        "total_users": 8,
        "total_students": 3,
        "total_teachers": 3,
        "total_parents": 1,
        "total_classes": 3,
        "active_users_today": 8,
        "avg_grades": 14.5,
        "attendance_rate": 0.92,
        "dropout_risk_count": 1,
        "recent_activities": [
            {"action": "Nouvel élève inscrit", "timestamp": "2026-05-17T08:30:00Z"},
            {"action": "Notes publiées - 3ème A Maths", "timestamp": "2026-05-16T14:00:00Z"},
            {"action": "Absence signalée - Adam Slim", "timestamp": "2026-05-16T09:15:00Z"},
        ],
    }

@app.get("/api/v1/analytics/teacher")
async def analytics_teacher():
    return {
        "total_courses": 3,
        "total_evaluations": 5,
        "grades_last_30_days": 24,
        "total_absences_recorded": 4,
        "average_score": 14.2,
    }

@app.get("/api/v1/analytics/at-risk")
async def analytics_at_risk():
    return [{"student_id": "u5", "student_name": "Adam Slim", "risk_score": 0.72, "class_name": "3ème A"}]

@app.get("/api/v1/gamification/badges")
async def list_badges():
    return [
        {"code": "first_login", "name": "Première Connexion", "description": "Connectez-vous pour la première fois", "xp_reward": 5},
        {"code": "quiz_master", "name": "Maître des Quiz", "description": "Obtenez 100 points aux quiz", "xp_reward": 50},
        {"code": "streak_7", "name": "7 Jours d'Affilée", "description": "Connectez-vous 7 jours de suite", "xp_reward": 25},
    ]

@app.get("/api/v1/gamification/profile")
async def gamification_profile():
    return {"xp_total": 1250, "level": 7, "streak_days": 12, "next_level_xp": 500, "rank": "Argent"}

@app.get("/api/v1/gamification/my-badges")
async def gamification_my_badges():
    return [
        {"id": "b1", "badge": {"code": "first_login", "name": "Première Connexion"}, "earned_at": "2026-04-01T08:00:00Z"},
        {"id": "b2", "badge": {"code": "streak_7", "name": "7 Jours d'Affilée"}, "earned_at": "2026-04-10T08:00:00Z"},
    ]

@app.get("/api/v1/gamification/leaderboard")
async def gamification_leaderboard():
    return [
        {"student_id": "u6", "first_name": "Yasmine", "last_name": "Gharbi", "xp_total": 2500, "rank": 1},
        {"student_id": "u7", "first_name": "Rayen", "last_name": "Mansour", "xp_total": 1800, "rank": 2},
        {"student_id": "u5", "first_name": "Adam", "last_name": "Slim", "xp_total": 1250, "rank": 3},
    ]

@app.get("/api/v1/gamification/xp-history")
async def gamification_xp_history():
    return [
        {"id": "xh1", "amount": 50, "reason": "Quiz terminé - Mathématiques", "created_at": "2026-05-16T10:00:00Z"},
        {"id": "xh2", "amount": 10, "reason": "Connexion quotidienne", "created_at": "2026-05-16T08:00:00Z"},
        {"id": "xh3", "amount": 100, "reason": "Devoir rendu - Français", "created_at": "2026-05-15T14:00:00Z"},
        {"id": "xh4", "amount": 20, "reason": "Badge débloqué : 7 Jours", "created_at": "2026-05-14T08:00:00Z"},
        {"id": "xh5", "amount": 50, "reason": "Participation en classe", "created_at": "2026-05-13T11:00:00Z"},
    ]

@app.get("/api/v1/ai/quizzes")
async def ai_list_quizzes():
    return [
        {"id": "qz1", "title": "Quiz - Équations du 2nd degré", "subject": "Mathématiques", "question_count": 10, "difficulty": "moyen", "time_limit_minutes": 15, "created_at": "2026-05-10"},
        {"id": "qz2", "title": "Quiz - Vocabulaire Français", "subject": "Français", "question_count": 8, "difficulty": "facile", "time_limit_minutes": 10, "created_at": "2026-05-12"},
    ]

@app.get("/api/v1/ai/quizzes/{quiz_id}")
async def ai_get_quiz(quiz_id: str):
    return {
        "id": quiz_id, "title": "Quiz - Équations du 2nd degré", "subject": "Mathématiques",
        "time_limit_minutes": 15,
        "questions": [
            {"id": "q1", "text": "Résoudre x² - 5x + 6 = 0", "options": ["x=2 ou x=3", "x=-2 ou x=-3", "x=1 ou x=6", "x=-1 ou x=-6"], "correct_index": 0},
            {"id": "q2", "text": "Résoudre x² + 4x + 4 = 0", "options": ["x=2", "x=-2", "x=±2", "Pas de solution"], "correct_index": 1},
            {"id": "q3", "text": "Le discriminant de 2x² - 3x + 1 = 0 est", "options": ["1", "9", "17", "25"], "correct_index": 0},
        ],
    }

@app.post("/api/v1/ai/quizzes/{quiz_id}/attempt")
async def ai_attempt_quiz(quiz_id: str):
    return {"score": 7, "total": 10, "passed": True, "xp_earned": 50}

@app.get("/api/v1/events")
async def list_events():
    return {"items": [], "total": 0, "page": 1, "per_page": 20, "pages": 0}

@app.get("/api/v1/audit")
async def list_audit():
    return {"items": [], "total": 0, "page": 1, "per_page": 20, "pages": 0}


if __name__ == "__main__":
    import uvicorn
    print("🚀 Démarrage du backend de démonstration sur http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
