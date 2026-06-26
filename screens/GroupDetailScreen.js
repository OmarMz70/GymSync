import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const WEEKLY_VOLUMES = {
  Abdullah: 15200,
  Khalid: 9450,
  Faisal: 3200,
  Sultan: 7800,
  Turki: 5100,
  Omar: 12840,
};

function daysUntilSaturday() {
  const day = new Date().getDay();
  return day === 6 ? 7 : 6 - day;
}

export default function GroupDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const styles = makeStyles(theme);
  const { group } = route.params;
  const currentUser = profile?.name || '';

  const ranked = [...group.members]
    .map(name => ({ name, volume: WEEKLY_VOLUMES[name] ?? 0 }))
    .sort((a, b) => b.volume - a.volume);

  const topVolume = ranked[0]?.volume || 1;
  const daysLeft = daysUntilSaturday();

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Friends</Text>
      </TouchableOpacity>

      <Text style={styles.groupName}>{group.name}</Text>
      <Text style={styles.memberCount}>{group.members.length} members</Text>

      <View style={styles.resetBanner}>
        <Text style={styles.resetText}>Resets in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</Text>
      </View>

      <Text style={styles.sectionLabel}>THIS WEEK'S LEADERBOARD</Text>

      {ranked.map((entry, index) => {
        const isMe = entry.name === currentUser;
        const bar = entry.volume / topVolume;

        return (
          <View key={entry.name} style={[styles.row, isMe && styles.rowMe]}>
            <Text style={styles.rank}>#{index + 1}</Text>

            <View style={[styles.avatar, isMe && styles.avatarMe]}>
              <Text style={styles.avatarText}>{entry.name[0]}</Text>
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, isMe && styles.nameMe]}>
                  {entry.name}{isMe ? ' (you)' : ''}
                </Text>
                <Text style={[styles.volume, isMe && styles.volumeMe]}>
                  {entry.volume.toLocaleString()} kg
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, isMe && styles.barFillMe, { flex: bar }]} />
                <View style={{ flex: 1 - bar }} />
              </View>
            </View>
          </View>
        );
      })}

      <Text style={styles.footnote}>Volume = total kg lifted across all sets this week</Text>
    </ScrollView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: t.bg },
    scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 48 },
    backButton: { marginBottom: 20 },
    backText: { color: t.accentLight, fontSize: 16 },
    groupName: { fontSize: 32, fontWeight: 'bold', color: t.text, marginBottom: 4 },
    memberCount: { fontSize: 14, color: t.subtext, marginBottom: 20 },
    resetBanner: { backgroundColor: t.card, borderRadius: 10, padding: 12, marginBottom: 28, borderWidth: 0.5, borderColor: t.border },
    resetText: { color: t.subtext, fontSize: 14 },
    sectionLabel: { fontSize: 11, fontWeight: 'bold', color: t.subtext, letterSpacing: 1.2, marginBottom: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: t.border },
    rowMe: { borderColor: t.accentLight, borderWidth: 1 },
    rank: { fontSize: 16, fontWeight: 'bold', color: t.subtext, width: 36, textAlign: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' },
    avatarMe: { backgroundColor: t.accentLight },
    avatarText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    info: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    name: { color: t.text, fontSize: 15, fontWeight: '600' },
    nameMe: { color: t.accentLight },
    volume: { color: t.subtext, fontSize: 14 },
    volumeMe: { color: t.accentLight, fontWeight: 'bold' },
    barTrack: { flexDirection: 'row', height: 4, borderRadius: 2, backgroundColor: t.border, overflow: 'hidden' },
    barFill: { backgroundColor: t.accent, borderRadius: 2 },
    barFillMe: { backgroundColor: t.accentLight },
    footnote: { fontSize: 12, color: t.subtext, textAlign: 'center', marginTop: 20 },
  });
}
