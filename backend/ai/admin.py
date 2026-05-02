"""AI admin configuration"""
from django.contrib import admin
from .models import StudentSkill, AIChatSession, AIChatMessage, LearningPath, DropoutRisk


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'skill_name', 'mastery_level')
    list_filter = ('subject',)


@admin.register(AIChatSession)
class AIChatSessionAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'started_at', 'ended_at')


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'current_level', 'target_level')


@admin.register(DropoutRisk)
class DropoutRiskAdmin(admin.ModelAdmin):
    list_display = ('student', 'risk_score', 'last_updated')