"""Assignment admin configuration"""
from django.contrib import admin
from .models import Assignment, Submission, Grade, Quiz, QuizAttempt, Attendance


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'teacher', 'due_date', 'is_published')
    list_filter = ('is_published', 'due_date')
    search_fields = ('title',)


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submitted_at', 'is_late')
    list_filter = ('is_late',)


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'teacher', 'is_published')
    list_filter = ('is_published',)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'student', 'score', 'is_passed')


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'date', 'is_present')
    list_filter = ('date', 'is_present')