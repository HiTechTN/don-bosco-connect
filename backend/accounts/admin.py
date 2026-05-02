from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Classe, Subject, StudentProfile, TeacherProfile


@admin.register(CustomUser)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations complémentaires', {'fields': ('role', 'phone', 'avatar')}),
    )


@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'year')
    list_filter = ('year', 'level')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'classe', 'xp_points', 'level')
    list_filter = ('classe',)


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('user',)
    filter_horizontal = ('subjects', 'classes')