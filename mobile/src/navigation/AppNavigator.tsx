import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import ParentHomeScreen from '../screens/ParentHomeScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminClassesScreen from '../screens/AdminClassesScreen';
import AdminSubjectsScreen from '../screens/AdminSubjectsScreen';
import AdminTimetableScreen from '../screens/AdminTimetableScreen';
import AdminEventsScreen from '../screens/AdminEventsScreen';
import AdminAuditScreen from '../screens/AdminAuditScreen';
import TeacherCoursesScreen from '../screens/TeacherCoursesScreen';
import TeacherGradesScreen from '../screens/TeacherGradesScreen';
import TeacherAbsencesScreen from '../screens/TeacherAbsencesScreen';
import GradesScreen from '../screens/GradesScreen';
import AbsencesScreen from '../screens/AbsencesScreen';
import StudentTimetableScreen from '../screens/StudentTimetableScreen';
import StudentQuizzesScreen from '../screens/StudentQuizzesScreen';
import StudentGamificationScreen from '../screens/StudentGamificationScreen';
import ParentGradesScreen from '../screens/ParentGradesScreen';
import ParentAbsencesScreen from '../screens/ParentAbsencesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import AIChatScreen from '../screens/AIChatScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Admin */}
        <Stack.Screen name="AdminHome" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ headerShown: true, title: 'Utilisateurs', headerTintColor: '#4F46E5' }} />
        <Stack.Screen name="AdminClasses" component={AdminClassesScreen} options={{ headerShown: true, title: 'Classes', headerTintColor: '#4F46E5' }} />
        <Stack.Screen name="AdminSubjects" component={AdminSubjectsScreen} options={{ headerShown: true, title: 'Matières', headerTintColor: '#4F46E5' }} />
        <Stack.Screen name="AdminTimetable" component={AdminTimetableScreen} options={{ headerShown: true, title: 'Emploi du temps', headerTintColor: '#4F46E5' }} />
        <Stack.Screen name="AdminEvents" component={AdminEventsScreen} options={{ headerShown: true, title: 'Événements', headerTintColor: '#4F46E5' }} />
        <Stack.Screen name="AdminAudit" component={AdminAuditScreen} options={{ headerShown: true, title: 'Audit', headerTintColor: '#4F46E5' }} />

        {/* Teacher */}
        <Stack.Screen name="TeacherHome" component={TeacherDashboardScreen} />
        <Stack.Screen name="TeacherCourses" component={TeacherCoursesScreen} options={{ headerShown: true, title: 'Mes Cours', headerTintColor: '#059669' }} />
        <Stack.Screen name="TeacherGrades" component={TeacherGradesScreen} options={{ headerShown: true, title: 'Évaluations & Notes', headerTintColor: '#059669' }} />
        <Stack.Screen name="TeacherAbsences" component={TeacherAbsencesScreen} options={{ headerShown: true, title: 'Absences', headerTintColor: '#059669' }} />

        {/* Student */}
        <Stack.Screen name="StudentHome" component={StudentDashboardScreen} />
        <Stack.Screen name="Grades" component={GradesScreen} options={{ headerShown: true, title: 'Mes Notes', headerTintColor: '#D97706' }} />
        <Stack.Screen name="Absences" component={AbsencesScreen} options={{ headerShown: true, title: 'Mes Absences', headerTintColor: '#D97706' }} />
        <Stack.Screen name="StudentTimetable" component={StudentTimetableScreen} options={{ headerShown: true, title: 'Emploi du temps', headerTintColor: '#D97706' }} />
        <Stack.Screen name="StudentQuizzes" component={StudentQuizzesScreen} options={{ headerShown: true, title: 'Quiz', headerTintColor: '#D97706' }} />
        <Stack.Screen name="StudentGamification" component={StudentGamificationScreen} options={{ headerShown: true, title: 'Gamification', headerTintColor: '#D97706' }} />

        {/* Parent */}
        <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
        <Stack.Screen name="ParentGrades" component={ParentGradesScreen} options={{ headerShown: true, title: 'Notes de mon enfant', headerTintColor: '#DC2626' }} />
        <Stack.Screen name="ParentAbsences" component={ParentAbsencesScreen} options={{ headerShown: true, title: 'Absences de mon enfant', headerTintColor: '#DC2626' }} />

        {/* Shared */}
        <Stack.Screen name="Messages" component={MessagesScreen} options={{ headerShown: true, title: 'Messages', headerTintColor: '#8B5CF6' }} />
        <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: true, title: 'Assistant IA', headerTintColor: '#14B8A6' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
