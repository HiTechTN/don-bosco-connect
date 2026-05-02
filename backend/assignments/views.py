"""Assignment views"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Assignment, Submission, Grade, Quiz, QuizAttempt, Attendance
from .serializers import (
    AssignmentSerializer, SubmissionSerializer, GradeSerializer,
    QuizSerializer, QuizAttemptSerializer, AttendanceSerializer
)


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    filterset_fields = ['course', 'teacher', 'is_published']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'student':
            try:
                student_profile = self.request.user.student_profile
                queryset = queryset.filter(
                    course__classe=student_profile.classe,
                    is_published=True
                )
            except:
                queryset = queryset.filter(is_published=True)
        elif self.request.user.role == 'prof':
            queryset = queryset.filter(teacher=self.request.user)
        return queryset

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        assignment = self.get_object()
        submissions = assignment.submissions.all()
        return Response(SubmissionSerializer(submissions, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        if request.user.role != 'student':
            return Response({'error': 'Only students can submit'}, status=status.HTTP_400_BAD_REQUEST)
        
        content = request.data.get('content', '')
        file = request.FILES.get('file')
        
        submission, created = Submission.objects.get_or_create(
            assignment=assignment,
            student=request.user,
            defaults={'content': content, 'file': file}
        )
        if not created:
            submission.content = content
            if file:
                submission.file = file
            submission.save()
        
        submission.is_late = timezone.now() > assignment.due_date
        submission.save()
        
        return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(graded_by=self.request.user)


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    filterset_fields = ['course', 'teacher', 'is_published']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'student':
            try:
                student_profile = self.request.user.student_profile
                queryset = queryset.filter(
                    course__classe=student_profile.classe,
                    is_published=True
                )
            except:
                queryset = queryset.filter(is_published=True)
        elif self.request.user.role == 'prof':
            queryset = queryset.filter(teacher=self.request.user)
        return queryset

    @action(detail=True, methods=['post'])
    def attempt(self, request, pk=None):
        quiz = self.get_object()
        if request.user.role != 'student':
            return Response({'error': 'Only students can attempt quiz'}, status=status.HTTP_400_BAD_REQUEST)
        
        attempt_obj, _ = QuizAttempt.objects.get_or_create(
            quiz=quiz,
            student=request.user
        )
        attempt_obj.answers = request.data.get('answers', {})
        attempt_obj.completed_at = timezone.now()
        
        questions = quiz.questions
        answers = attempt_obj.answers
        correct = 0
        total = len(questions)
        
        for q in questions:
            if answers.get(str(q.get('id'))) == q.get('correct_answer'):
                correct += 1
        
        if total > 0:
            score = (correct / total) * 100
            attempt_obj.score = score
            attempt_obj.is_passed = score >= quiz.passing_score
        
        attempt_obj.save()
        
        return Response(QuizAttemptSerializer(attempt_obj).data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['course', 'date', 'is_present']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'student':
            queryset = queryset.filter(student=self.request.user)
        elif self.request.user.role == 'prof':
            queryset = queryset.filter(course__teacher=self.request.user)
        return queryset

    @action(detail=False, methods=['post'])
    def mark_batch(self, request):
        if request.user.role != 'prof':
            return Response({'error': 'Only teachers can mark attendance'}, status=status.HTTP_400_BAD_REQUEST)
        
        records = request.data.get('records', [])
        for record in records:
            Attendance.objects.update_or_create(
                student_id=record.get('student_id'),
                course_id=record.get('course_id'),
                date=record.get('date'),
                defaults={'is_present': record.get('is_present', True)}
            )
        
        return Response({'status': 'attendance marked'})