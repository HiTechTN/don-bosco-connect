"""AI Service - Ollama integration for adaptive learning"""
import json
import logging
from typing import Optional
import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate text using Ollama"""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            return f"Désolé, je rencontre un problème technique. {str(e)}"

    async def chat(self, messages: list, system_prompt: Optional[str] = None) -> str:
        """Chat with context using Ollama"""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                all_messages = []
                if system_prompt:
                    all_messages.append({"role": "system", "content": system_prompt})
                all_messages.extend(messages)

                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": all_messages,
                        "temperature": 0.7
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"Ollama chat error: {e}")
            return f"Désolé, je rencontre un problème technique. {str(e)}"


class AdaptiveLearningService:
    def __init__(self):
        self.ollama = OllamaService()

    def calculate_level(self, quiz_score: float, response_time: float) -> float:
        """Calculate student level using formula from PRD"""
        normalized_time = min(response_time / 300, 1.0)
        level = (quiz_score * 0.6) + (normalized_time * 0.4) * 100
        return round(level, 2)

    def get_difficulty_adjustment(self, current_level: float) -> str:
        """Determine content difficulty based on level"""
        if current_level >= 80:
            return "advanced"
        elif current_level >= 60:
            return "intermediate"
        elif current_level >= 40:
            return "beginner"
        else:
            return "review"

    async def generate_adaptive_content(
        self,
        student_level: float,
        topic: str,
        course_content: str
    ) -> str:
        """Generate difficulty-adjusted content for student"""
        difficulty = self.get_difficulty_adjustment(student_level)

        system_prompt = f"""Tu es un tuteur pédagogique intelligent de Don Bosco Connect.
Ton rôle est d'adapter le contenu au niveau de l'élève.
Niveau actuel: {student_level}% - Difficulté: {difficulty}
Si le niveau est ≥80%, propose des exercices avancés.
Si le niveau est ≥60%, continue normalement.
Si le niveau est ≥40%, explique plus en détail.
Si le niveau est <40%, fais un rappel du cours."""

        prompt = f"""Basé sur ce cours:
{course_content}

Sujet: {topic}
Génère du contenu pédagogique adaptées au niveau {difficulty} de l'élève.
Inclue des exemples et des exercices pratiques."""

        return await self.ollama.generate(prompt, system_prompt)

    async def generate_quiz(
        self,
        course_content: str,
        level: float,
        num_questions: int = 5
    ) -> list:
        """Generate differentiated quiz questions"""
        difficulty = self.get_difficulty_adjustment(level)

        prompt = f"""Génère {num_questions} questions quiz en JSON sur ce contenu:
{course_content}

Difficulté: {difficulty}
Format JSON attendu:
[{{"id": 1, "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A"}}]"""

        result = await self.ollama.generate(prompt)
        try:
            questions = json.loads(result)
            return questions
        except:
            return []

    async def analyze_dropout_risk(
        self,
        student_data: dict
    ) -> dict:
        """Analyze student for dropout risk"""
        factors = []
        risk_score = 0

        attendance_rate = student_data.get('attendance_rate', 100)
        if attendance_rate < 70:
            factors.append("Faible présence")
            risk_score += 30

        avg_score = student_data.get('avg_score', 0)
        if avg_score < 10:
            factors.append("Mauvaises notes")
            risk_score += 25

        assignments_done = student_data.get('assignments_completed', 0)
        assignments_total = student_data.get('assignments_total', 1)
        completion_rate = (assignments_done / assignments_total * 100) if assignments_total > 0 else 100
        if completion_rate < 50:
            factors.append("Peux de devoirs rendus")
            risk_score += 25

        last_login_days = student_data.get('days_since_login', 0)
        if last_login_days > 14:
            factors.append("Inactif depuis longtemps")
            risk_score += 20

        return {
            "risk_score": min(risk_score, 100),
            "factors": factors,
            "recommendations": await self._generate_risk_recommendations(factors) if factors else []
        }

    async def _generate_risk_recommendations(self, factors: list) -> list:
        """Generate recommendations based on risk factors"""
        recommendations = []
        if "Faible présence" in factors:
            recommendations.append("Contacter la famille pour comprendre les difficultés")
        if "Mauvaises notes" in factors:
            recommendations.append("Proposer des séances de soutien supplémentaires")
        if "Peux de devoirs rendus" in factors:
            recommendations.append("Envoyer des rappels bienveillants")
        if "Inactif depuis longtemps" in factors:
            recommendations.append("Vérifier si l'élève a besoin d'aide technique")
        return recommendations


ollama_service = OllamaService()
adaptive_learning_service = AdaptiveLearningService()