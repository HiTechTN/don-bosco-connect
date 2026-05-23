import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';

interface Props { navigation: any }

const MOCK_STATS = { users: 9, classes: 3, subjects: 8, events: 5 };

export default function AdminDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [stats] = useState(MOCK_STATS);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
          <Text style={styles.role}>Administrateur</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.first_name || 'A')[0]}{(user?.last_name || 'P')[0]}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard label="Utilisateurs" value={stats.users} color="#4F46E5" icon="👥" style={styles.stat} />
          <StatCard label="Classes" value={stats.classes} color="#059669" icon="🏫" style={styles.stat} />
          <StatCard label="Matières" value={stats.subjects} color="#D97706" icon="📚" style={styles.stat} />
          <StatCard label="Événements" value={stats.events} color="#DC2626" icon="📅" style={styles.stat} />
        </View>

        <Text style={styles.sectionTitle}>Gestion</Text>
        <View style={styles.grid}>
          {[
            { title: 'Utilisateurs', icon: '👥', color: '#4F46E5', screen: 'AdminUsers' },
            { title: 'Classes', icon: '🏫', color: '#059669', screen: 'AdminClasses' },
            { title: 'Matières', icon: '📚', color: '#D97706', screen: 'AdminSubjects' },
            { title: 'Emploi du temps', icon: '📅', color: '#8B5CF6', screen: 'AdminTimetable' },
            { title: 'Événements', icon: '🎉', color: '#EC4899', screen: 'AdminEvents' },
            { title: 'Audit', icon: '📋', color: '#14B8A6', screen: 'AdminAudit' },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={styles.gridItem} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={styles.gridLabel}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  role: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  content: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  stat: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { backgroundColor: '#fff', borderRadius: 14, padding: 20, width: '47%', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  gridIcon: { fontSize: 32, marginBottom: 8 },
  gridLabel: { fontSize: 14, fontWeight: '500', color: '#374151' },
});
