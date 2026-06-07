import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { mockApi } from '../services/api';
import { UserRecord } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const mounted = useRef(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getUsers();
      if (!mounted.current) return;
      let filtered = data;
      if (search) filtered = filtered.filter((u) => u.first_name?.toLowerCase().includes(search.toLowerCase()) || u.last_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
      if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter);
      setUsers(filtered);
    } catch (e) { console.error('Failed to load users:', e); } finally { if (mounted.current) setLoading(false); }
  };

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [search, roleFilter]);

  const toggleStatus = (u: UserRecord) => {
    Alert.alert(
      u.status === 'active' ? 'Désactiver' : 'Activer',
      `${u.first_name} ${u.last_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => { load(); } },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput style={styles.search} placeholder="Rechercher..." value={search} onChangeText={setSearch} placeholderTextColor="#9CA3AF" />
        <View style={styles.roleRow}>
          {['', 'admin', 'teacher', 'student', 'parent'].map((r) => (
            <TouchableOpacity key={r} style={[styles.roleBtn, roleFilter === r && styles.roleActive]} onPress={() => setRoleFilter(r)}>
              <Text style={[styles.roleText, roleFilter === r && styles.roleTextActive]}>{r || 'Tous'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userRow} onPress={() => toggleStatus(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.first_name || '?')[0]}{(item.last_name || '?')[0]}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.first_name || ''} {item.last_name || ''}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <View style={styles.badges}>
                <Badge label={item.role || ''} color={item.role === 'admin' ? '#4F46E5' : item.role === 'teacher' ? '#059669' : item.role === 'parent' ? '#DC2626' : '#D97706'} />
                <Badge label={item.status === 'active' ? 'Actif' : 'Inactif'} color={item.status === 'active' ? '#059669' : '#EF4444'} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  filters: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  search: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  roleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#F3F4F6' },
  roleActive: { backgroundColor: '#4F46E5' },
  roleText: { fontSize: 12, fontWeight: '500', color: '#6B7280', textTransform: 'capitalize' },
  roleTextActive: { color: '#fff' },
  userRow: { flexDirection: 'row', padding: 14, backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 4, borderRadius: 12, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  userEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 6 },
});
