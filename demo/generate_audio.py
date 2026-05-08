"""Phase 3.1 — Generate TTS audio files for each scene using gTTS."""

from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"
ASSETS.mkdir(exist_ok=True)

SCENES = {
    "scene1_intro": (
        "Au cœur de Tunis, le Collège Don Bosco perpétue la vision de son fondateur : "
        "former des citoyens libres, responsables et fraternels. Aujourd'hui, cette mission "
        "entre dans l'ère du numérique avec Don Bosco Connect. "
        "Une plateforme éducative de nouvelle génération, entièrement déployée sur site — "
        "pas de cloud, pas de fuite de données. L'intelligence artificielle tourne localement "
        "sur nos serveurs, grâce à Ollama et aux modèles Qwen. Les données des élèves, "
        "des notes et des absences restent dans l'établissement, protégées par chiffrement "
        "AES-256 et authentification multi-facteurs. "
        "Sécurité, souveraineté numérique, excellence pédagogique : voici Don Bosco Connect."
    ),
    "scene2_teacher": (
        "Côté enseignant, la simplicité d'abord. Un professeur se connecte, accède à son "
        "tableau de bord et dépose un cours au format PDF. En quelques secondes, le document "
        "est importé, indexé et découpé en fragments par notre pipeline RAG. "
        "Chaque fragment reçoit un vecteur sémantique via le modèle nomic-embed-text d'Ollama, "
        "stocké dans PostgreSQL avec l'extension pgvector. L'enseignant peut publier le cours, "
        "et l'IA peut désormais répondre aux questions des élèves en se basant uniquement "
        "sur ce contenu — pas de hallucination, pas de hors-programme. "
        "Résultat : des heures de préparation économisées, un contenu vivant et accessible à tous."
    ),
    "scene3_student": (
        "L'élève, lui, découvre un assistant virtuel unique : le Mentor IA. Il pose une "
        "question en langage naturel — explique-moi le théorème de Pythagore — et reçoit "
        "une réponse contextualisée, tirée de ses propres cours, avec un ton adapté à son niveau. "
        "Après chaque révision, un quiz adaptatif évalue sa compréhension. Le score intègre "
        "la rapidité de réponse et l'historique personnel via notre algorithme de score adaptatif. "
        "Selon le résultat, l'élève bascule en mode remédiation, normal ou avancé. "
        "Chaque bonne réponse rapporte des points d'expérience, débloque des badges et "
        "alimente un classement bienveillant. L'apprentissage devient un jeu — "
        "et le progrès, une récompense."
    ),
    "scene4_parent": (
        "Les parents ne sont pas oubliés. Dès qu'une absence est signalée, une notification "
        "push traverse les WebSocket jusqu'à leur tableau de bord. Fin des surprises en fin de trimestre. "
        "L'administration, elle, pilote l'établissement en temps réel : taux de complétion des cours, "
        "usage de l'IA par classe, risques de décrochage identifiés par notre algorithme prédictif "
        "pondérant absences, niveau adaptatif et régularité. "
        "Chaque indicateur est visible sur un tableau de bord centralisé. Chaque alerte est immédiate. "
        "Chaque donnée reste chez nous. "
        "Don Bosco Connect : l'IA au service de l'éducation, dans la confiance et la sécurité."
    ),
}


def main():
    from gtts import gTTS

    for name, text in SCENES.items():
        path = ASSETS / f"{name}.mp3"
        if path.exists():
            print(f"[SKIP] {name}.mp3 already exists")
            continue
        print(f"[GENERATE] {name}.mp3 ...")
        tts = gTTS(text=text, lang="fr", slow=False)
        tts.save(str(path))
        print(f"  -> Saved {path} ({path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
