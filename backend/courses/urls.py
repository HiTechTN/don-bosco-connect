"""Course URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonViewSet, StudentProgressViewSet

router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'progress', StudentProgressViewSet, basename='progress')

urlpatterns = [
    path('', include(router.urls)),
]