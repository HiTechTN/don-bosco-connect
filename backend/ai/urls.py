"""AI URLs"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIChatViewSet, AdaptiveContentViewSet, AnalyticsViewSet, SkillViewSet
)

router = DefaultRouter()
router.register(r'chat', AIChatViewSet, basename='ai-chat')
router.register(r'content', AdaptiveContentViewSet, basename='ai-content')
router.register(r'analytics', AnalyticsViewSet, basename='ai-analytics')
router.register(r'skills', SkillViewSet, basename='ai-skills')

urlpatterns = [
    path('', include(router.urls)),
]