"""Phase 3.2 — Generate demo_don_bosco.mp4 (static slides + TTS audio)."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

ASSETS = Path(__file__).resolve().parent.parent / "assets"
ASSETS.mkdir(exist_ok=True)

VIDEO_W, VIDEO_H = 1280, 720

SCENES = [
    {
        "audio": "scene1_intro.mp3",
        "title": "Don Bosco Connect",
        "subtitle": "IA & Sécurite au service de l'Education",
        "bg": (22, 78, 99),
        "icon": "\U0001f3eb",
    },
    {
        "audio": "scene2_teacher.mp3",
        "title": "Espace Enseignant",
        "subtitle": "Upload PDF & Indexation IA (RAG)",
        "bg": (22, 101, 52),
        "icon": "\U0001f468\u200d\U0001f3eb",
    },
    {
        "audio": "scene3_student.mp3",
        "title": "Espace Eleve",
        "subtitle": "Mentor IA RAG & Quiz Adaptatif",
        "bg": (147, 51, 234),
        "icon": "\U0001f393",
    },
    {
        "audio": "scene4_parent.mp3",
        "title": "Espace Parent & Admin",
        "subtitle": "Alertes decrochage & Notifications temps reel",
        "bg": (180, 83, 9),
        "icon": "\U0001f46a",
    },
]


def make_slide(scene: dict) -> np.ndarray:
    img = Image.new("RGB", (VIDEO_W, VIDEO_H), scene["bg"])
    draw = ImageDraw.Draw(img)
    cx, cy = VIDEO_W // 2, VIDEO_H // 2

    try:
        ft = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        fs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
        fi = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 90)
    except Exception:
        ft = fs = fi = ImageFont.load_default()

    bg = scene["bg"]
    d1 = tuple(min(255, c + 30) for c in bg)
    d2 = tuple(min(255, c + 15) for c in bg)
    draw.ellipse([-60, -60, 260, 260], fill=d1)
    draw.ellipse([VIDEO_W - 160, VIDEO_H - 200, VIDEO_W + 60, VIDEO_H + 60], fill=d2)

    try:
        b = draw.textbbox((0, 0), scene["icon"], font=fi)
        draw.text((cx - (b[2] - b[0]) // 2, cy - 170), scene["icon"], font=fi, fill=(255, 255, 255))
    except Exception:
        pass
    try:
        b = draw.textbbox((0, 0), scene["title"], font=ft)
        draw.text((cx - (b[2] - b[0]) // 2, cy + 10), scene["title"], font=ft, fill=(255, 255, 255))
    except Exception:
        draw.text((cx - 120, cy + 10), scene["title"], fill=(255, 255, 255))
    try:
        b = draw.textbbox((0, 0), scene["subtitle"], font=fs)
        draw.text((cx - (b[2] - b[0]) // 2, cy + 90), scene["subtitle"], font=fs, fill=(210, 210, 210))
    except Exception:
        draw.text((cx - 180, cy + 90), scene["subtitle"], fill=(210, 210, 210))

    return np.array(img)


def build():
    from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

    clips = []
    for s in SCENES:
        ap = ASSETS / s["audio"]
        if not ap.exists():
            print(f"[SKIP] missing {ap}")
            continue
        audio = AudioFileClip(str(ap))
        dur = audio.duration
        print(f"[RENDER] {s['title']} — {dur:.1f}s")
        frame = make_slide(s)
        clip = ImageClip(frame).with_duration(dur).with_audio(audio)
        clips.append(clip)

    if not clips:
        print("[ERROR] no clips")
        return

    final = concatenate_videoclips(clips, method="compose")
    out = str(ASSETS / "demo_don_bosco.mp4")
    print(f"[ENCODE] {out} ...")
    final.write_videofile(out, fps=24, codec="libx264", audio_codec="aac", preset="fast", threads=2)
    print(f"[DONE] {out}  ({Path(out).stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    build()
