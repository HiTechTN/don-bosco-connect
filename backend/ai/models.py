"""AI Adaptive Learning System using Ollama"""
from django.db import models
from django.conf import settings


class StudentSkill(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    subject = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=200)
    mastery_level = models.IntegerField(default=0, help_text="0-100")
    last_practiced = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_skills'
        unique_together = ['student', 'subject', 'skill_name']


class AIChatSession(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_sessions'
    )
    course = models.ForeignKey('courses.Course', on_delete=models.SET_NULL, null=True)
    started_at = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'ai_chat_sessions'


class AIChatMessage(models.Model):
    session = models.ForeignKey(AIChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant')])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_chat_messages'
        ordering = ['created_at']


class LearningPath(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_paths'
    )
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='learning_paths')
    current_level = models.IntegerField(default=1)
    target_level = models.IntegerField(default=10)
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'learning_paths'
        unique_together = ['student', 'course']


class DropoutRisk(models.Model):
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dropout_risk'
    )
    risk_score = models.IntegerField(default=0, help_text="0-100, higher is riskier")
    factors = models.JSONField(default=list)
    last_updated = models.DateTimeField(auto_now=True)
    alert_sent = models.BooleanField(default=False)

    class Meta:
        db_table = 'dropout_risk'