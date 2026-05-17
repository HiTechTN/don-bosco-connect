import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import TeacherHomeScreen from '../screens/TeacherHomeScreen';
import ParentHomeScreen from '../screens/ParentHomeScreen';
import GradesScreen from '../screens/GradesScreen';
import AbsencesScreen from '../screens/AbsencesScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
        <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
        <Stack.Screen name="Grades" component={GradesScreen} options={{ headerShown: true, title: 'Mes Notes' }} />
        <Stack.Screen name="Absences" component={AbsencesScreen} options={{ headerShown: true, title: 'Mes Absences' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}