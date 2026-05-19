"""Course admin configuration"""
from django.contrib import admin
from .models import Course, Lesson, StudentProgress, CourseResource


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'teacher', 'is_published', 'created_at')
    list_filter = ('is_published', 'subject', 'classe')
    search_fields = ('title', 'description')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    ordering = ['course', 'order']


@admin.register(StudentProgress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'is_completed', 'completion_percentage')
    list_filter = ('is_completed',)


@admin.register(CourseResource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'resource_type')
    list_filter = ('resource_type',)