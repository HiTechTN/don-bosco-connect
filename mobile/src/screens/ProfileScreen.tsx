import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  teacher: 'Enseignant',
  student: 'Élève',
  parent: 'Parent',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#4F46E5',
  teacher: '#059669',
  student: '#D97706',
  parent: '#DC2626',
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: logout },
      ],
    );
  };

  const initials = user
    ? `${(user.first_name || '?')[0]}${(user.last_name || '?')[0]}`
    : '??';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.avatarContainer, { backgroundColor: (user?.role && ROLE_COLORS[user.role]) || '#6B7280' }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.fullName}>{user?.first_name} {user?.last_name}</Text>
        <Text style={styles.email}>{user?.email || 'utilisateur@donbosco.tn'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: ((user?.role && ROLE_COLORS[user.role]) || '#6B7280') + '20' }]}>
          <Text style={[styles.roleText, { color: (user?.role && ROLE_COLORS[user.role]) || '#6B7280' }]}>
            {user?.role && ROLE_LABELS[user.role] ? ROLE_LABELS[user.role] : user?.role}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
            <Text style={styles.infoValue}>{user?.email?.split('@')[0] || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rôle</Text>
            <Text style={styles.infoValue}>{user?.role && ROLE_LABELS[user.role] ? ROLE_LABELS[user.role] : user?.role}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version app</Text>
            <Text style={styles.infoValue}>2.1.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.switchHint}>
          <Text style={styles.switchHintText}>
            Après déconnexion, vous pouvez vous connecter avec un autre compte pour tester tous les profils.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatarContainer: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  fullName: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  email: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 24 },
  roleText: { fontSize: 14, fontWeight: '600' },
  infoCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', marginBottom: 16 },
  logoutIcon: { fontSize: 20, marginRight: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
  switchHint: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, width: '100%' },
  switchHintText: { fontSize: 13, color: '#3B82F6', textAlign: 'center', lineHeight: 18 },
});
