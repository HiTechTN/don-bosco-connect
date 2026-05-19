import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/api';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setUser, setDashboard, setLoading: setAuthLoading, isLoading, user } = useAuthStore();

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [me, dash] = await Promise.all([authService.me(), authService.dashboard()]);
        setUser(me);
        setDashboard(dash);
      } catch {
        setUser(null);
        setDashboard(null);
      } finally {
        setAuthLoading(false);
      }
    };
    if (isLoading) loadAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1a365d" />
        <Text style={styles.loadingText}>Connexion...</Text>
      </View>
    );
  }

  return (
    <>
      {!user && (
        <Text>Redirection vers connexion...</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
});