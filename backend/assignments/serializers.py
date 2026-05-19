"""Assignment serializers"""
from rest_framework import serializers
from accounts.serializers import UserSerializer
from courses.serializers import CourseSerializer
from .models import Assignment, Submission, Grade, Quiz, QuizAttempt, Attendance


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    grade_score = serializers.DecimalField(source='grade.score', max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'student', 'student_name', 'content', 'file', 'submitted_at', 'is_late', 'grade_score']


class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    submissions_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'course', 'course_title', 'teacher', 'teacher_name',
                 'due_date', 'max_score', 'is_published', 'submissions_count', 'created_at']

    def get_submissions_count(self, obj):
        return obj.submissions.count()


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='submission.student.get_full_name', read_only=True)
    graded_by_name = serializers.CharField(source='graded_by.get_full_name', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'submission', 'student_name', 'score', 'feedback', 'graded_by', 'graded_by_name', 'graded_at']


class QuizSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    attempts_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'course', 'course_title', 'teacher', 'time_limit', 'passing_score',
                 'is_published', 'questions', 'attempts_count', 'created_at']

    def get_attempts_count(self, obj):
        return obj.attempts.count()


class QuizAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student', 'student_name', 'answers', 'score', 'is_passed', 'started_at', 'completed_at']


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'course', 'date', 'is_present', 'notes']