import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getUser } from '../lib/auth';
import { mockApi } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

export default function StudentGamificationScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [xpHistory, setXpHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        const [pData, bData, lData, xData] = await Promise.all([
          mockApi.getGamificationProfile(u.id),
          mockApi.getGamificationBadges(u.id),
          mockApi.getGamificationLeaderboard(u.id),
          mockApi.getGamificationXpHistory(u.id),
        ]);
        setProfile(pData);
        setBadges(bData);
        setLeaderboard(lData);
        setXpHistory(xData);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.levelBadge}>Niveau {profile?.level || 1}</Text>
        <Text style={styles.xpTotal}>{profile?.xp_total || 0} XP</Text>
        <Text style={styles.streak}>🔥 Série: {profile?.streak_days || 0} jours</Text>
      </View>

      {badges.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Badges ({badges.length})</Text>
          <FlatList
            horizontal
            data={badges}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <View style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>🏅</Text>
                <Text style={styles.badgeName}>{item.name}</Text>
                <Text style={styles.badgeXp}>+{item.xp_reward} XP</Text>
              </View>
            )}
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Classement</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => String(item.rank)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.rankRow}>
            <Text style={styles.rank}>#{item.rank}</Text>
            <View style={styles.rankInfo}>
              <Text style={styles.rankName}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.rankLevel}>Niveau {item.level}</Text>
            </View>
            <Text style={styles.rankXp}>{item.xp_total} XP</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Historique XP</Text>
      <FlatList
        data={xpHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.xpRow}>
            <Text style={styles.xpAmount}>+{item.amount} XP</Text>
            <Text style={styles.xpReason}>{item.reason}</Text>
            <Text style={styles.xpDate}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  profileCard: { backgroundColor: '#4F46E5', padding: 24, margin: 12, borderRadius: 20, alignItems: 'center' },
  levelBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, color: '#fff', fontWeight: '700', fontSize: 14, overflow: 'hidden' },
  xpTotal: { fontSize: 40, fontWeight: '800', color: '#fff', marginTop: 8 },
  streak: { fontSize: 14, color: '#FCD34D', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4, paddingHorizontal: 16, marginTop: 12 },
  badgeCard: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginRight: 10, alignItems: 'center', width: 110, elevation: 2 },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontSize: 12, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginTop: 4 },
  badgeXp: { fontSize: 10, color: '#D97706', marginTop: 2 },
  rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 6, elevation: 1 },
  rank: { fontSize: 18, fontWeight: '700', color: '#4F46E5', width: 36 },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  rankLevel: { fontSize: 11, color: '#6B7280' },
  rankXp: { fontSize: 14, fontWeight: '600', color: '#D97706' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 4, elevation: 1 },
  xpAmount: { fontSize: 14, fontWeight: '600', color: '#059669' },
  xpReason: { fontSize: 13, color: '#374151', flex: 1, marginHorizontal: 8 },
  xpDate: { fontSize: 11, color: '#9CA3AF' },
});
