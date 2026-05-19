"""Account serializers"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Classe, Subject, StudentProfile, TeacherProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'avatar', 'first_name', 'last_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ClasseSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Classe
        fields = ['id', 'name', 'level', 'year', 'student_count', 'created_at']

    def get_student_count(self, obj):
        return obj.students.count()


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    classe_name = serializers.CharField(source='classe.name', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'classe', 'classe_name', 'xp_points', 'level', 'badges', 'enrolled_subjects']


class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    subjects_list = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = ['id', 'user', 'subjects', 'subjects_list', 'classes']

    def get_subjects_list(self, obj):
        return SubjectSerializer(obj.subjects.all(), many=True).data