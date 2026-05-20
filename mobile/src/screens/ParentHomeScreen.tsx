import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from '../components/LoadingScreen';
import Card from '../components/Card';

interface Props { navigation: any }

const MOCK_CHILDREN = [
  { id: 'student-uuid-001', first_name: 'Adam', last_name: 'Slim', email: 'adam.slim@donbosco.tn' },
];

export default function ParentDashboardScreen({ navigation }: Props) {
  const [user, setUser] = useState<any>(null);
  const [children] = useState(MOCK_CHILDREN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
          <Text style={styles.role}>Parent</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Déconnexion</Text>
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
              { title: 'Notifications', icon: '🔔', screen: 'ParentHome' },
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
  logout: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  content: { flex: 1, padding: 16 },
  empty: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  childCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, marginBottom: 10 },
  childAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  childAvatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  childInfo: { flex: 1 },
  childName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  childEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  childActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  childBtn: { backgroundColor: '#4F46E5', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  childBtnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: { alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#F9FAFB', flex: 1 },
  actionIcon: { fontSize: 28, marginBottom: 4 },
  actionLabel: { fontSize: 12, fontWeight: '500', color: '#374151' },
});
