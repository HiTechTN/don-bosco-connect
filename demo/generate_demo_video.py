"""Generate comprehensive demo video from today's screenshots + TTS audio."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

SCREENSHOTS = Path.home() / "projects" / "don-bosco-connect" / "demo" / "screenshots"
OUTPUT = Path.home() / "projects" / "don-bosco-connect" / "demo"
OUTPUT.mkdir(exist_ok=True)

W, H = 1280, 720

SCENES = [
    {
        "name": "intro",
        "title": "Don Bosco Connect",
        "subtitle": "Plateforme éducative IA — 100% sur site",
        "bg": (22, 78, 99),
        "screenshots": ["00_landing.png", "00_login.png"],
        "text": (
            "Au cœur de Tunis, le Collège Don Bosco perpétue la vision de son fondateur : "
            "former des citoyens libres, responsables et fraternels. Aujourd'hui, cette mission "
            "entre dans l'ère du numérique avec Don Bosco Connect. "
            "Une plateforme éducative de nouvelle génération, entièrement déployée sur site — "
            "pas de cloud, pas de fuite de données. L'intelligence artificielle tourne localement "
            "sur nos serveurs avec Ollama et les modèles open source. Les données des élèves, "
            "des notes et des absences restent dans l'établissement, protégées par chiffrement "
            "AES-256 et authentification multi-facteurs. "
            "Sécurité, souveraineté numérique, excellence pédagogique : voici Don Bosco Connect."
        ),
    },
    {
        "name": "admin",
        "title": "Espace Administrateur",
        "subtitle": "Gestion complète de l'établissement",
        "bg": (120, 53, 15),
        "screenshots": [
            "admin_01_login.png", "admin_02_dashboard.png", "admin_03_users.png",
            "admin_04_classes.png", "admin_05_subjects.png", "admin_06_timetable.png",
            "admin_07_audit.png",
        ],
        "text": (
            "Côté administration, le tableau de bord centralisé donne une vue en temps réel "
            "sur l'ensemble de l'établissement. Gestion des utilisateurs avec attribution des rôles, "
            "création des classes et des matières, planification des emplois du temps, "
            "et journal d'audit complet pour la traçabilité de toutes les actions. "
            "Chaque indicateur est visible, chaque alerte est immédiate. "
            "L'administration pilote l'établissement avec une précision inédite."
        ),
    },
    {
        "name": "teacher",
        "title": "Espace Enseignant",
        "subtitle": "Cours, notes, absences et IA pédagogique",
        "bg": (22, 101, 52),
        "screenshots": [
            "teacher_01_login.png", "teacher_02_dashboard.png", "teacher_03_courses.png",
            "teacher_04_grades.png", "teacher_05_absences.png", "teacher_06_messages.png",
            "teacher_07_ai.png",
        ],
        "text": (
            "Pour les enseignants, tout est conçu pour la simplicité et l'efficacité. "
            "Le tableau de bord affiche les prochains cours et les alertes. "
            "Les cours peuvent être créés ou importés au format PDF, automatiquement indexés "
            "par l'IA pour permettre aux élèves de poser des questions sur le contenu. "
            "La saisie des notes et le suivi des absences se font en quelques clics. "
            "La messagerie intégrée permet de communiquer avec les parents et l'administration. "
            "Et l'assistant IA aide à préparer les séances pédagogiques."
        ),
    },
    {
        "name": "student",
        "title": "Espace Élève",
        "subtitle": "Mentor IA, quiz adaptatif et gamification",
        "bg": (147, 51, 234),
        "screenshots": [
            "student_01_login.png", "student_02_dashboard.png", "student_03_grades.png",
            "student_04_absences.png", "student_05_timetable.png", "student_06_quizzes.png",
            "student_07_ai.png", "student_08_gamification.png",
        ],
        "text": (
            "L'élève découvre un tableau de bord personnalisé avec ses notes, ses absences "
            "et son emploi du temps. Le Mentor IA est son assistant virtuel : il pose une "
            "question en langage naturel et reçoit une réponse contextualisée à partir de ses "
            "propres cours. Les quiz adaptatifs évaluent sa compréhension et ajustent le niveau "
            "automatiquement. Chaque bonne réponse rapporte des points d'expérience et débloque "
            "des badges. L'apprentissage devient un jeu captivant."
        ),
    },
    {
        "name": "parent",
        "title": "Espace Parent",
        "subtitle": "Suivi en temps réel de la scolarité",
        "bg": (180, 83, 9),
        "screenshots": [
            "parent_01_login.png", "parent_02_dashboard.png", "parent_03_grades.png",
            "parent_04_absences.png", "parent_05_messages.png",
        ],
        "text": (
            "Les parents suivent la scolarité de leurs enfants en temps réel. "
            "Tableau de bord avec synthèse des notes et des absences. Dès qu'une absence "
            "est signalée, elle apparaît immédiatement. Plus besoin d'attendre le bulletin "
            "trimestriel pour savoir où en est son enfant. La messagerie intégrée permet "
            "d'échanger directement avec les enseignants. "
            "Une transparence totale pour une collaboration éducative renforcée."
        ),
    },
    {
        "name": "outro",
        "title": "Don Bosco Connect",
        "subtitle": "L'IA au service de l'éducation, dans la confiance",
        "bg": (22, 78, 99),
        "screenshots": ["00_landing.png"],
        "text": (
            "Don Bosco Connect, c'est l'intelligence artificielle au service de l'éducation, "
            "dans le respect de la vie privée et de la souveraineté numérique. "
            "Déployée sur site, sécurisée, ouverte et évolutive. "
            "Rejoignez-nous sur donbosco.hitech.tn pour découvrir la plateforme. "
            "Don Bosco Connect : former les citoyens de demain, avec les outils d'aujourd'hui."
        ),
    },
]


def make_transition_frame(text, bg, w=W, h=H):
    img = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(img)
    try:
        ft = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        fs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    except Exception:
        ft = fs = ImageFont.load_default()
    cx = w // 2
    lines = text.split("\n")
    y0 = h // 2 - 40 * len(lines)
    for i, line in enumerate(lines):
        b = draw.textbbox((0, 0), line, font=ft if i == 0 else fs)
        draw.text((cx - (b[2] - b[0]) // 2, y0 + i * 50), line, font=ft if i == 0 else fs, fill=(255, 255, 255))
    return np.array(img)


from moviepy import ImageClip, AudioFileClip, concatenate_videoclips, VideoClip
from gtts import gTTS


def generate_audio():
    for scene in SCENES:
        path = OUTPUT / f"{scene['name']}.mp3"
        if path.exists():
            print(f"[SKIP] {scene['name']}.mp3")
            continue
        print(f"[TTS] {scene['name']}.mp3 ...")
        tts = gTTS(text=scene["text"], lang="fr", slow=False)
        tts.save(str(path))
        print(f"  -> {path.stat().st_size / 1024:.1f} KB")


def make_slideshow(scene):
    audio_path = OUTPUT / f"{scene['name']}.mp3"
    if not audio_path.exists():
        print(f"[SKIP] missing audio for {scene['name']}")
        return []
    audio = AudioFileClip(str(audio_path))
    audio_dur = audio.duration
    images = scene["screenshots"]
    if not images:
        return []
    time_per_img = audio_dur / len(images)
    clips = []
    for i, img_name in enumerate(images):
        img_path = SCREENSHOTS / img_name
        if not img_path.exists():
            print(f"  [WARN] {img_name} not found, using placeholder")
            frame = make_transition_frame(f"{scene['title']}\n{scene['subtitle']}", scene["bg"])
            clip = ImageClip(frame).with_duration(time_per_img)
        else:
            clip = ImageClip(str(img_path)).with_duration(time_per_img)
            clip = clip.resized(new_size=(W, H))
        t_start = i * time_per_img
        t_end = (i + 1) * time_per_img
        clip = clip.with_start(t_start)
        clips.append(clip)
    if not clips:
        return []
    slideshow = concatenate_videoclips(clips, method="compose")
    slideshow = slideshow.with_audio(audio)
    slideshow = slideshow.with_duration(audio_dur)
    return [slideshow]


def build():
    print("=" * 60)
    print("  Phase 1: Génération des fichiers audio TTS")
    print("=" * 60)
    generate_audio()

    print("\n" + "=" * 60)
    print("  Phase 2: Assemblage de la vidéo")
    print("=" * 60)

    all_clips = []
    for scene in SCENES:
        print(f"[SCENE] {scene['name']}")
        clips = make_slideshow(scene)
        if clips:
            all_clips.extend(clips)
        else:
            print(f"  [SKIP] no clips for {scene['name']}")

    if not all_clips:
        print("[ERROR] no clips to render")
        return

    final = concatenate_videoclips(all_clips, method="compose")
    out_path = str(OUTPUT / "demo_don_bosco.mp4")
    print(f"\n[ENCODE] {out_path} ({final.duration:.1f}s)...")
    final.write_videofile(
        out_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        preset="fast",
        threads=2,
        logger=None,
    )
    size_mb = Path(out_path).stat().st_size / 1024 / 1024
    print(f"[DONE] {out_path} ({size_mb:.1f} MB, {final.duration:.0f}s)")


if __name__ == "__main__":
    build()
