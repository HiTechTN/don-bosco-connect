import asyncio, sys, uuid
sys.path.insert(0, "/app")
from app.database import AsyncSessionLocal, engine
from app.models.base import Base, User, AcademicYear, Class, ClassEnrollment, Subject, StudentParentLink, Badge, StudentProfile, XPTransaction
from app.core.security import hash_password
from sqlalchemy import select
from datetime import date

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        if (await session.execute(select(User).limit(1))).first():
            print("Base déjà initialisée.")
            return
        year = AcademicYear(id=uuid.uuid4(), name="2025-2026", start_date=date(2025,9,15), end_date=date(2026,6,30), is_current=True)
        session.add(year)
        await session.flush()
        admin = User(id=uuid.uuid4(), email="admin@donbosco.local", password_hash=hash_password("Admin123!"), role="admin", first_name="Admin", last_name="Système")
        session.add(admin)
        profs = []
        for first, last, email in [("Ahmed","Hamdi","ahmed.hamdi@donbosco.local"), ("Leila","Ben Ali","leila.benali@donbosco.local"), ("Karim","Jouini","karim.jouini@donbosco.local"), ("Fatma","Mansour","fatma.mansour@donbosco.local"), ("Mohamed","Ghariani","mohamed.ghariani@donbosco.local")]:
            profs.append(User(id=uuid.uuid4(), email=email, password_hash=hash_password("Prof1234!"), role="teacher", first_name=first, last_name=last))
        session.add_all(profs)
        subjects = []
        for name, name_ar, code, color in [("Mathématiques","رياضيات","MATH","#FF6384"), ("Physique-Chimie","فيزياء-كيمياء","PC","#36A2EB"), ("Français","فرنسية","FR","#FFCE56"), ("Arabe","عربية","AR","#4BC0C0"), ("Informatique","إعلامية","INFO","#9966FF"), ("Histoire-Géo","تاريخ-جغرافيا","HG","#FF9F40")]:
            subjects.append(Subject(id=uuid.uuid4(), name=name, name_ar=name_ar, code=code, color=color))
        session.add_all(subjects)
        await session.flush()
        classes = []
        for name, level in [("3ème A","3eme"), ("4ème B","4eme"), ("Terminale Sciences","terminale")]:
            classes.append(Class(id=uuid.uuid4(), academic_year_id=year.id, name=name, level=level, max_students=30))
        session.add_all(classes)
        await session.flush()
        eleves = []
        for i in range(10):
            eleves.append(User(id=uuid.uuid4(), email=f"eleve{i+1}@donbosco.local", password_hash=hash_password("Eleve123!"), role="student", first_name=f"Élève{i+1}", last_name=f"Test{i+1}"))
        session.add_all(eleves)
        await session.flush()
        for idx, e in enumerate(eleves):
            session.add(ClassEnrollment(student_id=e.id, class_id=classes[idx % 3].id, academic_year_id=year.id))
        parents_data = [("Parent1","Famille1","parent1@donbosco.local", eleves[0]), ("Parent2","Famille2","parent2@donbosco.local", eleves[1]), ("Parent3","Famille3","parent3@donbosco.local", eleves[2])]
        for first, last, email, enfant in parents_data:
            parent = User(id=uuid.uuid4(), email=email, password_hash=hash_password("Parent123!"), role="parent", first_name=first, last_name=last)
            session.add(parent)
            await session.flush()
            session.add(StudentParentLink(student_id=enfant.id, parent_id=parent.id))
        badges = [
            Badge(id=uuid.uuid4(), code="first_quiz", name="Premier Quiz", description="Termine ton premier quiz", xp_reward=10, condition_type="quiz_completed", condition_value=1),
            Badge(id=uuid.uuid4(), code="perfect_score", name="Sans Faute", description="Obtenir 20/20 à un quiz", xp_reward=50, condition_type="quiz_perfect", condition_value=1),
            Badge(id=uuid.uuid4(), code="streak_3", name="Régulier", description="3 jours de suite", xp_reward=25, condition_type="streak", condition_value=3),
            Badge(id=uuid.uuid4(), code="streak_7", name="Assidu", description="7 jours de suite", xp_reward=75, condition_type="streak", condition_value=7),
            Badge(id=uuid.uuid4(), code="streak_30", name="Légende Vivante", description="30 jours de suite", xp_reward=300, condition_type="streak", condition_value=30),
            Badge(id=uuid.uuid4(), code="ai_explorer", name="Explorateur IA", description="Pose ta première question à l'IA", xp_reward=5, condition_type="ai_session", condition_value=1),
            Badge(id=uuid.uuid4(), code="course_master", name="Maître du Cours", description="Consulte 10 cours", xp_reward=20, condition_type="course_viewed", condition_value=10),
        ]
        session.add_all(badges)
        await session.flush()
        # Créer un profil pour chaque élève
        for e in eleves:
            sp = StudentProfile(id=uuid.uuid4(), student_id=e.id, xp_total=0, level=1)
            session.add(sp)
        await session.commit()
        print("✅ Données de démonstration insérées.")

if __name__ == "__main__":
    asyncio.run(init_db())
