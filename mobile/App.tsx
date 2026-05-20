import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import StudentDashboardScreen from './src/screens/StudentDashboardScreen';
import TeacherDashboardScreen from './src/screens/TeacherDashboardScreen';
import ParentHomeScreen from './src/screens/ParentHomeScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminClassesScreen from './src/screens/AdminClassesScreen';
import AdminSubjectsScreen from './src/screens/AdminSubjectsScreen';
import AdminTimetableScreen from './src/screens/AdminTimetableScreen';
import AdminEventsScreen from './src/screens/AdminEventsScreen';
import AdminAuditScreen from './src/screens/AdminAuditScreen';
import TeacherCoursesScreen from './src/screens/TeacherCoursesScreen';
import TeacherGradesScreen from './src/screens/TeacherGradesScreen';
import TeacherAbsencesScreen from './src/screens/TeacherAbsencesScreen';
import GradesScreen from './src/screens/GradesScreen';
import AbsencesScreen from './src/screens/AbsencesScreen';
import StudentTimetableScreen from './src/screens/StudentTimetableScreen';
import StudentQuizzesScreen from './src/screens/StudentQuizzesScreen';
import StudentGamificationScreen from './src/screens/StudentGamificationScreen';
import ParentGradesScreen from './src/screens/ParentGradesScreen';
import ParentAbsencesScreen from './src/screens/ParentAbsencesScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import AIChatScreen from './src/screens/AIChatScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
      } catch {}
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const handleLogin = async (userData: any) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    setUser(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen navigation={{ replace: (screen: string, params?: any) => {
              const roles: Record<string, any> = {
                AdminHome: { role: 'admin', first_name: 'Admin', last_name: 'Principal' },
                TeacherHome: { role: 'teacher', first_name: 'Karim', last_name: 'Hamdi' },
                ParentHome: { role: 'parent', first_name: 'Ahmed', last_name: 'Slim' },
              };
              const userData = roles[screen] || { role: 'student', first_name: 'Adam', last_name: 'Slim' };
              handleLogin(userData);
            } } as any} />}
          </Stack.Screen>
        ) : (
          <>
            {user.role === 'admin' && (
              <>
                <Stack.Screen name="AdminHome" component={AdminDashboardScreen} />
                <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ headerShown: true, title: 'Utilisateurs', headerTintColor: '#4F46E5' }} />
                <Stack.Screen name="AdminClasses" component={AdminClassesScreen} options={{ headerShown: true, title: 'Classes', headerTintColor: '#4F46E5' }} />
                <Stack.Screen name="AdminSubjects" component={AdminSubjectsScreen} options={{ headerShown: true, title: 'Matières', headerTintColor: '#4F46E5' }} />
                <Stack.Screen name="AdminTimetable" component={AdminTimetableScreen} options={{ headerShown: true, title: 'Emploi du temps', headerTintColor: '#4F46E5' }} />
                <Stack.Screen name="AdminEvents" component={AdminEventsScreen} options={{ headerShown: true, title: 'Événements', headerTintColor: '#4F46E5' }} />
                <Stack.Screen name="AdminAudit" component={AdminAuditScreen} options={{ headerShown: true, title: 'Audit', headerTintColor: '#4F46E5' }} />
              </>
            )}
            {user.role === 'teacher' && (
              <>
                <Stack.Screen name="TeacherHome" component={TeacherDashboardScreen} />
                <Stack.Screen name="TeacherCourses" component={TeacherCoursesScreen} options={{ headerShown: true, title: 'Mes Cours', headerTintColor: '#059669' }} />
                <Stack.Screen name="TeacherGrades" component={TeacherGradesScreen} options={{ headerShown: true, title: 'Évaluations & Notes', headerTintColor: '#059669' }} />
                <Stack.Screen name="TeacherAbsences" component={TeacherAbsencesScreen} options={{ headerShown: true, title: 'Absences', headerTintColor: '#059669' }} />
                <Stack.Screen name="Messages" component={MessagesScreen} options={{ headerShown: true, title: 'Messages', headerTintColor: '#8B5CF6' }} />
                <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: true, title: 'Assistant IA', headerTintColor: '#14B8A6' }} />
              </>
            )}
            {user.role === 'student' && (
              <>
                <Stack.Screen name="StudentHome" component={StudentDashboardScreen} />
                <Stack.Screen name="Grades" component={GradesScreen} options={{ headerShown: true, title: 'Mes Notes', headerTintColor: '#D97706' }} />
                <Stack.Screen name="Absences" component={AbsencesScreen} options={{ headerShown: true, title: 'Mes Absences', headerTintColor: '#D97706' }} />
                <Stack.Screen name="StudentTimetable" component={StudentTimetableScreen} options={{ headerShown: true, title: 'Emploi du temps', headerTintColor: '#D97706' }} />
                <Stack.Screen name="StudentQuizzes" component={StudentQuizzesScreen} options={{ headerShown: true, title: 'Quiz', headerTintColor: '#D97706' }} />
                <Stack.Screen name="StudentGamification" component={StudentGamificationScreen} options={{ headerShown: true, title: 'Gamification', headerTintColor: '#D97706' }} />
                <Stack.Screen name="Messages" component={MessagesScreen} options={{ headerShown: true, title: 'Messages', headerTintColor: '#8B5CF6' }} />
                <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: true, title: 'Assistant IA', headerTintColor: '#14B8A6' }} />
              </>
            )}
            {user.role === 'parent' && (
              <>
                <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
                <Stack.Screen name="ParentGrades" component={ParentGradesScreen} options={{ headerShown: true, title: 'Notes de mon enfant', headerTintColor: '#DC2626' }} />
                <Stack.Screen name="ParentAbsences" component={ParentAbsencesScreen} options={{ headerShown: true, title: 'Absences de mon enfant', headerTintColor: '#DC2626' }} />
                <Stack.Screen name="Messages" component={MessagesScreen} options={{ headerShown: true, title: 'Messages', headerTintColor: '#8B5CF6' }} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
});