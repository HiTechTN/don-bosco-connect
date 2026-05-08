"""
Seed script for Don Bosco Connect.
Creates initial data: 1 admin, 3 classes, 10 students, 5 teachers, 3 parents.
"""
import asyncio
import uuid
from datetime import datetime, timezone, date

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

from app.config import settings
from app.models.base import User, UserRole, AcademicYear, Class, ClassEnrollment, Subject, StudentParentLink, StudentProfile, Badge
from app.core.security import hash_password


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        existing = await session.execute(text("SELECT COUNT(*) FROM users"))
        count = existing.scalar()
        if count and count > 0:
            print(f"Database already has {count} users. Skipping seed.")
            return

        print("Seeding database with initial data...")

        admin = User(
            id=uuid.uuid4(),
            email="admin@donbosco.tn",
            password_hash=hash_password("admin123!"),
            role=UserRole.admin,
            first_name="Admin",
            last_name="Don Bosco",
            phone="+21670123456",
        )
        session.add(admin)

        teachers = []
        teacher_data = [
            ("Karim", "Hamdi", "karim.hamdi@donbosco.tn"),
            ("Sami", "Ben Ali", "sami.benali@donbosco.tn"),
            ("Leila", "Trabelsi", "leila.trabelsi@donbosco.tn"),
            ("Nadia", "Mzoughi", "nadia.mzoughi@donbosco.tn"),
            ("Mohamed", "Karray", "mohamed.karray@donbosco.tn"),
        ]
        for first, last, email in teacher_data:
            t = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=hash_password("teacher123!"),
                role=UserRole.teacher,
                first_name=first,
                last_name=last,
            )
            session.add(t)
            teachers.append(t)

        students = []
        student_data = [
            ("Adam", "Slim"), ("Yasmine", "Gharbi"), ("Rayen", "Mansour"),
            ("Sirine", "Bouazizi"), ("Omar", "Haddad"), ("Nour", "Ayadi"),
            ("Aziz", "Jmal"), ("Malek", "Dhahbi"), ("Lina", "Khemiri"),
            ("Imen", "Zouari"),
        ]
        for first, last in student_data:
            s = User(
                id=uuid.uuid4(),
                email=f"{first.lower()}.{last.lower()}@donbosco.tn",
                password_hash=hash_password("student123!"),
                role=UserRole.student,
                first_name=first,
                last_name=last,
            )
            session.add(s)
            students.append(s)

        parents = []
        parent_data = [
            ("Ahmed", "Slim", "ahmed.slim@parent.tn"),
            ("Fatma", "Mansour", "fatma.mansour@parent.tn"),
            ("Rachid", "Haddad", "rachid.haddad@parent.tn"),
        ]
        for first, last, email in parent_data:
            p = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=hash_password("parent123!"),
                role=UserRole.parent,
                first_name=first,
                last_name=last,
            )
            session.add(p)
            parents.append(p)

        await session.flush()

        student_profiles = []
        for s in students:
            sp = StudentProfile(
                student_id=s.id,
            )
            session.add(sp)
            student_profiles.append(sp)

        year = AcademicYear(
            id=uuid.uuid4(),
            name="2025-2026",
            start_date=date(2025, 9, 1),
            end_date=date(2026, 6, 30),
            is_current=True,
        )
        session.add(year)

        classes = []
        class_data = [
            ("3ème A", "3eme", "A", teachers[0].id),
            ("4ème Sciences", "4eme", "Sciences", teachers[1].id),
            ("Terminale Maths", "terminale", "Maths", teachers[2].id),
        ]
        for name, level, section, teacher_id in class_data:
            c = Class(
                id=uuid.uuid4(),
                academic_year_id=year.id,
                name=name,
                level=level,
                section=section,
                main_teacher_id=teacher_id,
            )
            session.add(c)
            classes.append(c)

        await session.flush()

        subjects = []
        subject_data = [
            ("Mathématiques", "رياضيات", "MATH", "#EF4444"),
            ("Français", "الفرنسية", "FR", "#3B82F6"),
            ("Arabe", "العربية", "AR", "#10B981"),
            ("Anglais", "الإنجليزية", "EN", "#F59E0B"),
            ("Physique-Chimie", "الفيزياء", "PC", "#8B5CF6"),
            ("Histoire-Géo", "تاريخ-جغرافيا", "HG", "#EC4899"),
            ("SVT", "علوم الحياة", "SVT", "#14B8A6"),
            ("Informatique", "إعلامية", "INFO", "#6366F1"),
        ]
        for name, name_ar, code, color in subject_data:
            sub = Subject(
                id=uuid.uuid4(),
                name=name,
                name_ar=name_ar,
                code=code,
                color=color,
            )
            session.add(sub)
            subjects.append(sub)

        await session.flush()

        for i, s in enumerate(students):
            class_idx = i % len(classes)
            enrollment = ClassEnrollment(
                student_id=s.id,
                class_id=classes[class_idx].id,
                academic_year_id=year.id,
            )
            session.add(enrollment)

        for i, p in enumerate(parents):
            for j in range(3):
                student_idx = (i * 3 + j) % len(students)
                link = StudentParentLink(
                    student_id=students[student_idx].id,
                    parent_id=p.id,
                    is_primary=(j == 0),
                )
                session.add(link)

        badges = [
            Badge(code="first_login", name="Première Connexion", condition_type="login", condition_value=1, xp_reward=5),
            Badge(code="quiz_master", name="Maître des Quiz", condition_type="quiz_score", condition_value=100, xp_reward=50),
            Badge(code="streak_7", name="7 Jours d'Affilée", condition_type="streak", condition_value=7, xp_reward=25),
            Badge(code="streak_30", name="Un Mois Sans Pause", condition_type="streak", condition_value=30, xp_reward=75),
            Badge(code="ai_explorer", name="Explorateur IA", condition_type="ai_sessions", condition_value=10, xp_reward=30),
            Badge(code="perfectionist", name="Perfectionniste", condition_type="perfect_quizzes", condition_value=5, xp_reward=100),
            Badge(code="knowledge_seeker", name="Chercheur de Savoir", condition_type="courses_viewed", condition_value=20, xp_reward=20),
        ]
        for b in badges:
            session.add(b)

        await session.commit()

        print("Seed complete!")
        print(f"  - 1 admin (admin@donbosco.tn / admin123!)")
        print(f"  - 5 teachers")
        print(f"  - 10 students")
        print(f"  - 3 parents")
        print(f"  - 1 academic year (2025-2026)")
        print(f"  - 3 classes")
        print(f"  - 8 subjects")
        print(f"  - 7 badges")
        print(f"  - {len(student_profiles)} student profiles")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
