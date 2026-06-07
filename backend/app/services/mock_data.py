"""Mock data service for demo mode."""
from typing import Any

MOCK_USERS = [
    {
        "id": "admin-uuid-0001", "email": "admin@donbosco.tn",
        "role": "admin", "first_name": "Admin", "last_name": "Principal",
    },
    {
        "id": "teacher-uuid-001", "email": "karim.hamdi@donbosco.tn",
        "role": "teacher", "first_name": "Karim", "last_name": "Hamdi",
    },
    {
        "id": "student-uuid-001", "email": "adam.slim@donbosco.tn",
        "role": "student", "first_name": "Adam", "last_name": "Slim",
    },
]

MOCK_CLASSES = [
    {"id": "class-1", "name": "6ème A", "level": 6},
    {"id": "class-2", "name": "7ème B", "level": 7},
]

MOCK_EVALUATIONS = [
    {"id": "eval-1", "title": "Contrôle Math", "subject": "Mathématiques", "date": "2025-05-10"},
    {"id": "eval-2", "title": "Devoir Physique", "subject": "Physique", "date": "2025-05-08"},
]


def get_mock_data(key: str) -> list[dict[str, Any]]:
    data = {
        "users": MOCK_USERS,
        "classes": MOCK_CLASSES,
        "evaluations": MOCK_EVALUATIONS,
    }
    return data.get(key, [])
