"""Course serializers"""
from rest_framework import serializers
from accounts.serializers import UserSerializer, SubjectSerializer, ClasseSerializer
from .models import Course, Lesson, StudentProgress, CourseResource


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    classe_name = serializers.CharField(source='classe.name', read_only=True)
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'subject', 'subject_name', 'teacher', 'teacher_name',
                 'classe', 'classe_name', 'thumbnail', 'is_published', 'lessons_count', 'created_at', 'updated_at']

    def get_lessons_count(self, obj):
        return obj.lessons.count()


class LessonSerializer(serializers.ModelSerializer):
    resources = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'video_url', 'pdf_file', 'order', 'resources', 'created_at', 'updated_at']

    def get_resources(self, obj):
        return CourseResourceSerializer(obj.resources.all(), many=True).data


class CourseResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseResource
        fields = ['id', 'title', 'resource_type', 'file', 'url']


class StudentProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.course.title', read_only=True)

    class Meta:
        model = StudentProgress
        fields = ['id', 'lesson', 'lesson_title', 'course_title', 'is_completed', 'completion_percentage', 'completed_at']


class CourseDetailSerializer(CourseSerializer):
    lessons = LessonSerializer(many=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'subject', 'subject_name', 'teacher', 'teacher_name',
                 'classe', 'classe_name', 'thumbnail', 'is_published', 'lessons', 'created_at', 'updated_at']