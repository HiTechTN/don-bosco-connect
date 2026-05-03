import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { aiService } from '../services/api';

export function DashboardScreen() {
  const { user, dashboard } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'student') {
      aiService.getAnalytics().then(setAnalytics).catch(console.error);
    }
  }, [user?.role]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Bienvenue, {user?.first_name || 'Élève'}!</Text>
      
      {user?.role === 'student' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mon Profil</Text>
            <Text style={styles.stat}>XP: {dashboard?.profile?.xp_points || 0}</Text>
            <Text style={styles.stat}>Niveau: {dashboard?.profile?.level || 1}</Text>
          </View>
          
          {analytics && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Progrès</Text>
              <Text style={styles.stat}>Leçons complétées: {analytics.completed_lessons}</Text>
              <Text style={styles.stat}>Score moyen: {analytics.average_score?.toFixed(1)}%</Text>
              <Text style={styles.stat}>Quiz réussis: {analytics.quizzes_passed}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 12,
  },
  stat: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
  },
});