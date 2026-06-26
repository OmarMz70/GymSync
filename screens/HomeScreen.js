import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWorkout } from '../context/WorkoutContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { feed } = useWorkout();
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Home</Text>
      <Text style={styles.screenSub}>What your crew has been up to</Text>

      {feed.length === 0 && (
        <Text style={styles.empty}>No workouts yet. Be the first to log one!</Text>
      )}

      {feed.map((post) => (
        <View key={post.id} style={styles.feedCard}>
          <View style={styles.feedHeader}>
            <View style={styles.feedLeft}>
              <View style={styles.feedAvatar}>
                <Text style={styles.feedAvatarText}>{(post.name || '?')[0]}</Text>
              </View>
              <View>
                <Text style={styles.feedName}>{post.name}</Text>
                <Text style={styles.feedWorkoutType}>{post.workout} Day</Text>
                <Text style={styles.feedMeta}>{post.time}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleExpand(post.id)}>
              <Text style={styles.moreButton}>{expanded[post.id] ? 'Less ▲' : 'More ▼'}</Text>
            </TouchableOpacity>
          </View>

          {expanded[post.id] && (
            <View style={styles.feedExpanded}>
              {(post.exercises || []).map((ex, i) => (
                <View key={i} style={styles.feedExercise}>
                  <Text style={styles.feedExerciseName}>{ex.name}</Text>
                  {(ex.sets || []).map((set, j) => (
                    <Text key={j} style={styles.feedSet}>Set {j + 1}: {set.reps} reps @ {set.weight}kg</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: t.bg },
    scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    screenTitle: { fontSize: 32, fontWeight: 'bold', color: t.text, marginBottom: 4 },
    screenSub: { fontSize: 14, color: t.subtext, marginBottom: 24 },
    feedCard: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: t.border },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    feedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    feedAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' },
    feedAvatarText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
    feedName: { color: t.text, fontSize: 16, fontWeight: 'bold' },
    feedWorkoutType: { color: t.accentLight, fontSize: 13, marginTop: 2 },
    feedMeta: { color: t.subtext, fontSize: 12, marginTop: 2 },
    moreButton: { color: t.accentLight, fontSize: 13, fontWeight: 'bold' },
    feedExpanded: { marginTop: 12, borderTopWidth: 0.5, borderTopColor: t.border, paddingTop: 12 },
    feedExercise: { marginBottom: 10 },
    feedExerciseName: { color: t.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    feedSet: { color: t.subtext, fontSize: 13, marginLeft: 8 },
    empty: { color: t.subtext, fontSize: 14, textAlign: 'center', marginTop: 60 },
  });
}
