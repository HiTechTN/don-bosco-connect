"""Account models with role-based system"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    ADMIN = 'admin', _('Administrateur')
    PROF = 'prof', _('Professeur')
    STUDENT = 'student', _('Élève')
    PARENT = 'parent', _('Parent')


class CustomUser(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['username']


class Classe(models.Model):
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=50)
    year = models.CharField(max_length=9)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.year})"

    class Meta:
        db_table = 'classes'
        ordering = ['name']


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'subjects'
        ordering = ['name']


class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    classe = models.ForeignKey(Classe, on_delete=models.SET_NULL, null=True, related_name='students')
    parent = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    xp_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    badges = models.JSONField(default=list)
    enrolled_subjects = models.ManyToManyField(Subject, blank=True, related_name='enrolled_students')

    def __str__(self):
        return f"{self.user.username} - {self.classe}"

    class Meta:
        db_table = 'student_profiles'


class TeacherProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='teacher_profile')
    subjects = models.ManyToManyField(Subject, related_name='teachers')
    classes = models.ManyToManyField(Classe, related_name='teachers')

    def __str__(self):
        return f"{self.user.username} - Prof"

    class Meta:
        db_table = 'teacher_profiles'