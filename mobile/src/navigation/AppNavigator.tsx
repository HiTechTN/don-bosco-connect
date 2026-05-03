import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CoursesScreen } from '../screens/student/CoursesScreen';
import { AssignmentsScreen } from '../screens/student/AssignmentsScreen';
import { AIChatScreen } from '../screens/student/AIChatScreen';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Home, BookOpen, ClipboardList, Brain } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const studentTabs = (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarIcon: () => <Home /> }} />
    <Tab.Screen name="Cours" component={CoursesScreen} options={{ tabBarIcon: () => <BookOpen /> }} />
    <Tab.Screen name="Devoirs" component={AssignmentsScreen} options={{ tabBarIcon: () => <ClipboardList /> }} />
    <Tab.Screen name="IA" component={AIChatScreen} options={{ tabBarIcon: () => <Brain /> }} />
  </Tab.Navigator>
);

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Main" component={studentTabs} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}