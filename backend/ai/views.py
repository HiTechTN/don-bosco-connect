"""AI views with RAG and adaptive learning"""
import json
import asyncio
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta

from accounts.models import CustomUser
from courses.models import Course, StudentProgress
from assignments.models import Assignment, Submission, QuizAttempt
from .models import StudentSkill, AIChatSession, AIChatMessage, LearningPath, DropoutRisk
from .services import (
    ollama_service, adaptive_learning_service,
    AdaptiveLearningService
)


class AIChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def chat(self, request):
        """Chat with AI tutor"""
        if request.user.role != 'student':
            return Response({'error': 'Only students can use AI chat'}, status=status.HTTP_400_BAD_REQUEST)

        course_id = request.data.get('course_id')
        message = request.data.get('message', '')

        try:
            course = Course.objects.get(id=course_id) if course_id else None
        except Course.DoesNotExist:
            course = None

        session_id = request.data.get('session_id')
        if session_id:
            try:
                session = AIChatSession.objects.get(id=session_id, student=request.user)
            except AIChatSession.DoesNotExist:
                session = AIChatSession.objects.create(
                    student=request.user,
                    course=course
                )
        else:
            session = AIChatSession.objects.create(
                student=request.user,
                course=course
            )

        AIChatMessage.objects.create(
            session=session,
            role='user',
            content=message
        )

        messages = list(AIChatMessage.objects.filter(
            session=session
        ).values('role', 'content'))

        course_context = ""
        if course:
            lessons = course.lessons.all()[:3]
            course_context = "\n\n".join([
                f"Leçon: {l.title}\n{l.content[:500]}"
                for l in lessons
            ])

        system_prompt = f"""Tu es le Mentor IA de Don Bosco Connect.
Tu aides les élèves à comprendre leurs cours.
Tu dois répondre en français, de façon claire etpedagogique.
 utilise les informations du cours quand disponible."""

        if course_context:
            system_prompt += f"\n\nCours actuel:\n{course_context[:2000]}"

        try:
            response = asyncio.run(
                ollama_service.chat(messages, system_prompt)
            )
        except:
            response = "Désolé, je rencontre un problème technique. Réessayez bientôt."

        AIChatMessage.objects.create(
            session=session,
            role='assistant',
            content=response
        )

        return Response({
            'response': response,
            'session_id': session.id
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get chat history"""
        sessions = AIChatSession.objects.filter(
            student=request.user
        ).order_by('-started_at')[:10]

        return Response([{
            'id': s.id,
            'course': s.course.title if s.course else None,
            'started_at': s.started_at,
            'ended_at': s.ended_at
        } for s in sessions])

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages from a session"""
        session = AIChatSession.objects.get(id=pk, student=request.user)
        messages = session.messages.all()
        return Response([{
            'role': m.role,
            'content': m.content,
            'created_at': m.created_at
        } for m in messages])


class AdaptiveContentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_level(self, request):
        """Get student's current learning level"""
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response({'error': 'course_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            path = LearningPath.objects.get(
                student=request.user,
                course_id=course_id
            )
            return Response({
                'current_level': path.current_level,
                'target_level': path.target_level,
                'recommendations': path.recommendations
            })
        except LearningPath.DoesNotExist:
            return Response({
                'current_level': 50,
                'target_level': 100,
                'recommendations': []
            })

    @action(detail=False, methods=['post'])
    def generate_content(self, request):
        """Generate adaptive content based on student's level"""
        if request.user.role != 'student':
            return Response({'error': 'Only students can use adaptive content'}, status=status.HTTP_400_BAD_REQUEST)

        course_id = request.data.get('course_id')
        topic = request.data.get('topic', '')

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        course_content = "\n\n".join([
            f"{{l.title}}: {{l.content[:500]}}"
            for l in course.lessons.all()[:3]
        ])

        try:
            path = LearningPath.objects.get(
                student=request.user,
                course=course
            )
            current_level = path.current_level
        except LearningPath.DoesNotExist:
            current_level = 50

        response = asyncio.run(
            adaptive_learning_service.generate_adaptive_content(
                current_level,
                topic,
                course_content
            )
        )

        return Response({
            'content': response,
            'level': current_level
        })

    @action(detail=False, methods=['post'])
    def generate_quiz(self, request):
        """Generate differentiated quiz"""
        course_id = request.data.get('course_id')
        num_questions = request.data.get('num_questions', 5)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            path = LearningPath.objects.get(
                student=request.user,
                course=course
            )
            current_level = path.current_level
        except LearningPath.DoesNotExist:
            current_level = 50

        course_content = " ".join([
            l.content[:300] for l in course.lessons.all()[:3]
        ])

        response = asyncio.run(
            adaptive_learning_service.generate_quiz(
                course_content,
                current_level,
                num_questions
            )
        )

        return Response({
            'questions': response,
            'level': current_level
        })

    @action(detail=False, methods=['post'])
    def update_level(self, request):
        """Update student's learning level after quiz"""
        course_id = request.data.get('course_id')
        quiz_score = float(request.data.get('quiz_score', 0))
        response_time = float(request.data.get('response_time', 60))

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        new_level = adaptive_learning_service.calculate_level(quiz_score, response_time)

        path, _ = LearningPath.objects.update_or_create(
            student=request.user,
            course=course,
            defaults={'current_level': new_level}
        )

        return Response({
            'previous_level': path.current_level,
            'new_level': new_level,
            'difficulty': adaptive_learning_service.get_difficulty_adjustment(new_level)
        })


class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def student_analytics(self, request):
        """Get analytics for student"""
        if request.user.role != 'student':
            return Response({'error': 'Only for students'}, status=status.HTTP_400_BAD_REQUEST)

        progress = StudentProgress.objects.filter(
            student=request.user,
            is_completed=True
        )
        completed_lessons = progress.count()

        attempts = QuizAttempt.objects.filter(
            student=request.user,
            score__isnull=False
        )
        avg_score = attempts.aggregate(Avg('score'))['score__avg'] or 0

        return Response({
            'completed_lessons': completed_lessons,
            'average_score': avg_score,
            'quizzes_passed': attempts.filter(is_passed=True).count()
        })

    @action(detail=False, methods=['get'])
    def professor_analytics(self, request):
        """Get analytics for professor"""
        if request.user.role != 'prof':
            return Response({'error': 'Only for professors'}, status=status.HTTP_400_BAD_REQUEST)

        courses = Course.objects.filter(teacher=request.user)
        total_students = sum(c.students_enrolled.count() for c in courses)

        quizzes = QuizAttempt.objects.filter(
            quiz__teacher=request.user
        )
        avg_score = quizzes.aggregate(Avg('score'))['score__avg'] or 0

        return Response({
            'total_courses': courses.count(),
            'total_students': total_students,
            'average_score': avg_score
        })

    @action(detail=False, methods=['get'])
    def admin_analytics(self, request):
        """Get analytics for admin"""
        if request.user.role != 'admin':
            return Response({'error': 'Only for admins'}, status=status.HTTP_400_BAD_REQUEST)

        total_students = CustomUser.objects.filter(role='student').count()
        total_profs = CustomUser.objects.filter(role='prof').count()
        total_classes = Course.objects.values('classe').distinct().count()

        at_risk = DropoutRisk.objects.filter(risk_score__gte=50)
        at_risk_count = at_risk.count()

        return Response({
            'total_students': total_students,
            'total_profs': total_profs,
            'total_classes': total_classes,
            'students_at_risk': at_risk_count
        })

    @action(detail=False, methods=['post'])
    def analyze_dropout_risk(self, request):
        """Analyze dropout risk for a student (admin/prof only)"""
        if request.user.role not in ['admin', 'prof']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_400_BAD_REQUEST)

        student_id = request.data.get('student_id')
        try:
            student = CustomUser.objects.get(id=student_id, role='student')
        except CustomUser.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        submissions = Submission.objects.filter(student=student)
        completed = submissions.filter().count()
        total = Assignment.objects.filter(
            course__classe=student.student_profile.classe
        ).count()

        attempts = QuizAttempt.objects.filter(student=student)
        avg_score = attempts.aggregate(Avg('score'))['score__avg'] or 0

        student_data = {
            'attendance_rate': 80,
            'avg_score': avg_score,
            'assignments_completed': completed,
            'assignments_total': total,
            'days_since_login': 3
        }

        result = asyncio.run(
            adaptive_learning_service.analyze_dropout_risk(student_data)
        )

        DropoutRisk.objects.update_or_create(
            student=student,
            defaults={
                'risk_score': result['risk_score'],
                'factors': result['factors']
            }
        )

        return Response(result)


class SkillViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_skills(self, request):
        """Get student's skills"""
        course_id = request.query_params.get('course_id')
        skills = StudentSkill.objects.filter(
            student=request.user
        )
        if course_id:
            skills = skills.filter(course_id=course_id)

        return Response([{
            'id': s.id,
            'skill_name': s.skill_name,
            'mastery_level': s.mastery_level,
            'last_practiced': s.last_practiced
        } for s in skills])

    @action(detail=False, methods=['post'])
    def update_skill(self, request):
        """Update skill mastery"""
        course_id = request.data.get('course_id')
        skill_name = request.data.get('skill_name')
        mastery_level = request.data.get('mastery_level', 0)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        skill, _ = StudentSkill.objects.update_or_create(
            student=request.user,
            course=course,
            skill_name=skill_name,
            defaults={'mastery_level': mastery_level}
        )

        return Response({
            'id': skill.id,
            'mastery_level': skill.mastery_level
        })