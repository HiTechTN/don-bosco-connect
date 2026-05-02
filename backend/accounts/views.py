"""Account views with role-based permissions and dashboards"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, F
from .models import CustomUser, Classe, Subject, StudentProfile, TeacherProfile
from .serializers import (
    UserSerializer, UserCreateSerializer, ClasseSerializer,
    SubjectSerializer, StudentProfileSerializer, TeacherProfileSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['login', 'register', 'me']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        user = request.user
        data = {
            'user': UserSerializer(user).data,
            'role': user.role,
        }

        if user.role == 'admin':
            data['stats'] = {
                'total_students': User.objects.filter(role='student').count(),
                'total_profs': User.objects.filter(role='prof').count(),
                'total_classes': Classe.objects.count(),
                'total_subjects': Subject.objects.count(),
            }
        elif user.role == 'prof':
            try:
                profile = user.teacher_profile
                data['subjects'] = SubjectSerializer(profile.subjects.all(), many=True).data
                data['classes'] = ClasseSerializer(profile.classes.all(), many=True).data
            except TeacherProfile.DoesNotExist:
                data['subjects'] = []
                data['classes'] = []
        elif user.role == 'student':
            try:
                profile = user.student_profile
                data['profile'] = StudentProfileSerializer(profile).data
                data['classe'] = ClasseSerializer(profile.classe).data if profile.classe else None
            except StudentProfile.DoesNotExist:
                data['profile'] = None
        elif user.role == 'parent':
            children = User.objects.filter(role='student').filter(student_profile__parent=user)
            data['children'] = UserSerializer(children, many=True).data

        return Response(data)


class ClasseViewSet(viewsets.ModelViewSet):
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    filterset_fields = ['year', 'level']

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        classe = self.get_object()
        students = User.objects.filter(student_profile__classe=classe, role='student')
        return Response(UserSerializer(students, many=True).data)


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer