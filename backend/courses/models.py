"""Course and lesson models"""
from django.db import models
from django.conf import settings


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey('accounts.Subject', on_delete=models.CASCADE, related_name='courses')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    classe = models.ForeignKey('accounts.Classe', on_delete=models.CASCADE, related_name='courses')
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField()
    video_url = models.URLField(blank=True)
    pdf_file = models.FileField(upload_to='courses/pdfs/', null=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    class Meta:
        db_table = 'lessons'
        ordering = ['order']


class StudentProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completion_percentage = models.IntegerField(default=0)
    last_position = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'student_progress'
        unique_together = ['student', 'lesson']


class CourseResource(models.Model):
    TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('video', 'Vidéo'),
        ('link', 'Lien'),
        ('other', 'Autre'),
    ]
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file = models.FileField(upload_to='courses/resources/', null=True, blank=True)
    url = models.URLField(blank=True)

    class Meta:
        db_table = 'course_resources'