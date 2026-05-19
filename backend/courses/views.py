"""Course views"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from .models import Course, Lesson, StudentProgress, CourseResource
from .serializers import (
    CourseSerializer, LessonSerializer, StudentProgressSerializer,
    CourseDetailSerializer, CourseResourceSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_fields = ['subject', 'classe', 'teacher', 'is_published']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'student':
            try:
                student_profile = self.request.user.student_profile
                queryset = queryset.filter(classe=student_profile.classe, is_published=True)
            except:
                queryset = queryset.filter(is_published=True)
        elif self.request.user.role == 'prof':
            queryset = queryset.filter(teacher=self.request.user)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = CourseDetailSerializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def my_progress(self, request, pk=None):
        course = self.get_object()
        progress = StudentProgress.objects.filter(
            student=request.user,
            lesson__course=course
        )
        return Response(StudentProgressSerializer(progress, many=True).data)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        if request.user.role != 'student':
            return Response({'error': 'Only students can enroll'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'status': 'enrolled'})


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    filterset_fields = ['course']

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        progress, _ = StudentProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )
        progress.is_completed = True
        progress.completion_percentage = 100
        progress.save()
        return Response(StudentProgressSerializer(progress).data)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        lesson = self.get_object()
        percentage = request.data.get('completion_percentage', 0)
        position = request.data.get('last_position', 0)
        
        progress, _ = StudentProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )
        progress.completion_percentage = percentage
        progress.last_position = position
        progress.save()
        
        return Response(StudentProgressSerializer(progress).data)


class StudentProgressViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudentProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudentProgress.objects.filter(student=self.request.user)

    @action(detail=False, methods=['get'])
    def by_course(self, request):
        course_id = request.query_params.get('course_id')
        if course_id:
            progress = StudentProgress.objects.filter(
                student=request.user,
                lesson__course_id=course_id
            )
            return Response(StudentProgressSerializer(progress, many=True).data)
        return Response({'error': 'course_id required'}, status=status.HTTP_400_BAD_REQUEST)