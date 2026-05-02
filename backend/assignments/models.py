"""Assignment and quiz models"""
from django.db import models
from django.conf import settings


class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    due_date = models.DateTimeField()
    max_score = models.IntegerField(default=20)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'assignments'
        ordering = ['-due_date']


class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    content = models.TextField()
    file = models.FileField(upload_to='assignments/files/', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)

    class Meta:
        db_table = 'submissions'
        unique_together = ['assignment', 'student']


class Grade(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='grade')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    graded_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'grades'


class Quiz(models.Model):
    title = models.CharField(max_length=200)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='quizzes')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quizzes')
    time_limit = models.IntegerField(default=30, help_text="Minutes")
    passing_score = models.IntegerField(default=50)
    is_published = models.BooleanField(default=False)
    questions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'quizzes'


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    answers = models.JSONField(default=dict)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_passed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'quiz_attempts'
        unique_together = ['quiz', 'student']


class Attendance(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    is_present = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'attendance'
        unique_together = ['student', 'course', 'date']