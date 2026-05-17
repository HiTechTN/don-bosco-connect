import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { clearAuth, getUser } from '../lib/auth';

interface Props {
  navigation: any;
}

export default function ParentHomeScreen({ navigation }: Props) {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    await clearAuth();
    navigation.replace('Login');
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logout}>Déconnexion</Text></TouchableOpacity>
      </View>
      <Text style={styles.title}>Mes Enfants</Text>
      <FlatList
        data={[]} // populated from API in real implementation
        keyExtractor={(_, i) => String(i)}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucun enfant lié pour le moment</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a237e' },
  logout: { color: '#d32f2f', fontSize: 14 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#999', fontSize: 16 },
});