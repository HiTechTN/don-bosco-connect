import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';

interface Props { navigation: any }

const MOCK_CHILDREN = [
  { id: 'student-uuid-001', first_name: 'Adam', last_name: 'Slim', email: 'adam.slim@donbosco.tn' },
];

export default function ParentDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [children] = useState(MOCK_CHILDREN);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
          <Text style={styles.role}>Parent</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.first_name || 'P')[0]}{(user?.last_name || 'T')[0]}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Card title="Mes Enfants">
          {children.length === 0 ? (
            <Text style={styles.empty}>Aucun enfant lié</Text>
          ) : (
            children.map((child) => (
              <View key={child.id} style={styles.childCard}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>{child.first_name[0]}{child.last_name[0]}</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.first_name} {child.last_name}</Text>
                  <Text style={styles.childEmail}>{child.email}</Text>
                  <View style={styles.childActions}>
                    <TouchableOpacity style={styles.childBtn} onPress={() => navigation.navigate('ParentGrades', { child })}>
                      <Text style={styles.childBtnText}>Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.childBtn} onPress={() => navigation.navigate('ParentAbsences', { child })}>
                      <Text style={styles.childBtnText}>Absences</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card title="Actions">
          <View style={styles.quickActions}>
            {[
              { title: 'Messages', icon: '💬', screen: 'Messages' },
            ].map((item) => (
              <TouchableOpacity key={item.screen} style={styles.actionBtn} onPress={() => navigation.navigate(item.screen)}>
                <Text style={styles.actionIcon}>{item.icon}</Text>
                <Text style={styles.actionLabel}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  role: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  content: { flex: 1, padding: 16 },
  childCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 10 },
  childAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#D97706', justifyContent: 'center', alignItems: 'center' },
  childAvatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  childInfo: { flex: 1, marginLeft: 12 },
  childName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  childEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  childActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  childBtn: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  childBtnText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  empty: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 20 },
  quickActions: { gap: 8, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#F9FAFB', borderRadius: 12, gap: 12 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 15, fontWeight: '500', color: '#374151' },
});
