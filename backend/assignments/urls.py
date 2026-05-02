"""Assignment URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, GradeViewSet, QuizViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r'', AssignmentViewSet, basename='assignment')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]