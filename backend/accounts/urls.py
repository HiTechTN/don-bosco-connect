"""Account URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ClasseViewSet, SubjectViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'classes', ClasseViewSet, basename='classe')
router.register(r'subjects', SubjectViewSet, basename='subject')

urlpatterns = [
    path('', include(router.urls)),
]