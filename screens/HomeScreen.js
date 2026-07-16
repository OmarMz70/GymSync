import { useState, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ActivityIndicator, TextInput, Modal, Linking, FlatList, Image,
} from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getSpotifyToken, searchSongs, getItunesPreview } from './services/spotify';

const DEFAULT_GOALS = { calories: 2500, protein: 150, carbs: 300, fat: 80 };

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getGreetingEmoji = () => {
  const h = new Date().getHours();
  if (h < 12) return '☀️';
  if (h < 17) return '🌤️';
  return '🌙';
};

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { feed } = useWorkout();
  const { user, profile } = useAuth();

  const [expanded, setExpanded] = useState({});
  const [fabOpen, setFabOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [calLoading, setCalLoading] = useState(true);

  const lastTap = useRef({ id: null, time: 0 });

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  useFocusEffect(useCallback(() => {
    if (!user) return;
    (async () => {
      setCalLoading(true);
      try {
        const [goalsSnap, mealsSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid, 'goals', 'daily')),
          getDocs(collection(db, 'users', user.uid, 'logs', getTodayKey(), 'meals')),
        ]);
        if (goalsSnap.exists()) setGoals({ ...DEFAULT_GOALS, ...goalsSnap.data() });
        const t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        mealsSnap.docs.forEach(d => {
          const m = d.data();
          t.calories += Number(m.calories) || 0;
          t.protein += Number(m.protein) || 0;
          t.carbs += Number(m.carbs) || 0;
          t.fat += Number(m.fat) || 0;
        });
        setTotals(t);
      } catch (e) {}
      setCalLoading(false);
    })();
  }, [user]));

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const token = await getSpotifyToken();
      const results = await searchSongs(searchQuery, token);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
    setIsSearching(false);
  };

  const handleShareSong = async (track) => {
    try {
      let previewUrl = track.preview_url || null;
      if (!previewUrl) {
        previewUrl = await getItunesPreview(track.name, track.artists[0].name);
      }
      await addDoc(collection(db, 'posts'), {
        type: 'song',
        name: profile?.name || 'Someone',
        userId: user.uid,
        songName: track.name,
        artistName: track.artists[0].name,
        albumCover: track.album.images[0]?.url || null,
        previewUrl,
        spotifyUrl: track.external_urls.spotify,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setSearchResults([]);
      setSearchQuery('');
    } catch (e) {
      console.error(e);
      alert('Failed to share song');
    }
  };

  const stopCurrentSound = async () => {
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch (e) {}
      setCurrentSound(null);
      setPlayingId(null);
    }
  };

  const playPreview = async (post) => {
    await stopCurrentSound();
    if (!post.previewUrl) { alert('No preview available for this song'); return; }
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    const { sound } = await Audio.Sound.createAsync({ uri: post.previewUrl });
    setCurrentSound(sound);
    setPlayingId(post.id);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) { setCurrentSound(null); setPlayingId(null); }
    });
  };

  const handleSongTap = (post) => {
    const now = Date.now();
    // Double tap → Spotify
    if (lastTap.current.id === post.id && now - lastTap.current.time < 300) {
      stopCurrentSound();
      Linking.openURL(post.spotifyUrl);
      lastTap.current = { id: null, time: 0 };
      return;
    }
    // Single tap on playing song → pause
    if (playingId === post.id) {
      stopCurrentSound();
      lastTap.current = { id: null, time: 0 };
      return;
    }
    // Single tap on idle song → wait to confirm not a double tap, then play
    lastTap.current = { id: post.id, time: now };
    setTimeout(() => {
      if (lastTap.current.id === post.id && Date.now() - lastTap.current.time >= 300) {
        playPreview(post);
        lastTap.current = { id: null, time: 0 };
      }
    }, 300);
  };

  const firstName = profile?.name?.split(' ')[0] || 'there';

  return (
    <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent}>

      {/* ── Calorie header card ── */}
      <TouchableOpacity
        style={s.calorieCard}
        onPress={() => navigation.navigate('CalorieLog')}
        activeOpacity={0.88}
      >
        <View style={s.cardTopRow}>
          <Text style={s.greeting}>
            {getGreeting()}, {firstName} {getGreetingEmoji()}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditGoals')}
            style={s.editBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {calLoading ? (
          <ActivityIndicator color={theme.accentLight} style={{ marginVertical: 28 }} />
        ) : (
          <>
            <View style={s.ringWrap}>
              <CircularProgress
                size={128}
                strokeWidth={14}
                progress={goals.calories > 0 ? totals.calories / goals.calories : 0}
                color={theme.accentLight}
                trackColor={theme.border}
                bg={theme.card}
              >
                <Text style={s.ringNum}>{totals.calories}</Text>
                <Text style={s.ringGoal}>/ {goals.calories}</Text>
                <Text style={s.ringUnit}>kcal</Text>
              </CircularProgress>
            </View>

            <View style={s.macros}>
              <MacroBar label="Protein" consumed={totals.protein} goal={goals.protein} color="#93b4ff" theme={theme} />
              <MacroBar label="Carbs" consumed={totals.carbs} goal={goals.carbs} color="#f4a261" theme={theme} />
              <MacroBar label="Fat" consumed={totals.fat} goal={goals.fat} color="#2a9d8f" theme={theme} />
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* ── Friend feed ── */}
      <Text style={s.screenTitle}>Home</Text>
      <Text style={s.screenSub}>What your crew has been up to</Text>

      {feed.length === 0 && (
        <Text style={s.empty}>No workouts yet. Be the first to log one!</Text>
      )}

      {feed.map((post) => {
        // ── Song card ──
        if (post.type === 'song') {
          return (
            <TouchableOpacity
              key={post.id}
              style={s.songCard}
              activeOpacity={0.85}
              onPress={() => handleSongTap(post)}
            >
              <View style={s.feedAvatar}>
                <Text style={s.feedAvatarText}>{(post.name || '?')[0]}</Text>
              </View>
              {post.albumCover ? (
                <Image source={{ uri: post.albumCover }} style={s.albumCover} />
              ) : (
                <View style={[s.albumCover, s.albumFallback]}>
                  <Text style={{ fontSize: 18 }}>🎵</Text>
                </View>
              )}
              <View style={s.songInfo}>
                <Text style={s.songName} numberOfLines={1}>{post.songName}</Text>
                <Text style={s.songArtist} numberOfLines={1}>{post.artistName}</Text>
                <Text style={s.feedMeta}>{post.name} · {post.time}</Text>
              </View>
              <Text style={s.playIcon}>{playingId === post.id ? 'II' : '▶'}</Text>
            </TouchableOpacity>
          );
        }

        // ── Workout card ──
        return (
          <View key={post.id} style={s.feedCard}>
            <View style={s.feedHeader}>
              <View style={s.feedLeft}>
                <View style={s.feedAvatar}>
                  <Text style={s.feedAvatarText}>{(post.name || '?')[0]}</Text>
                </View>
                <View>
                  <Text style={s.feedName}>{post.name}</Text>
                  <Text style={s.feedWorkoutType}>{post.workout} Day</Text>
                  <Text style={s.feedMeta}>{post.time}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleExpand(post.id)}>
                <Text style={s.moreButton}>{expanded[post.id] ? 'Less ▲' : 'More ▼'}</Text>
              </TouchableOpacity>
            </View>

            {expanded[post.id] && (
              <View style={s.feedExpanded}>
                {(post.exercises || []).map((ex, i) => (
                  <View key={i} style={s.feedExercise}>
                    <Text style={s.feedExerciseName}>{ex.name}</Text>
                    {(ex.sets || []).map((set, j) => (
                      <Text key={j} style={s.feedSet}>
                        Set {j + 1}: {set.reps} reps @ {set.weight}kg
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* ── Floating Action Button ── */}
      <View style={s.fabContainer}>
        {fabOpen && (
          <>
            <TouchableOpacity
              style={s.fabOption}
              onPress={() => { setFabOpen(false); navigation.navigate('AICoach'); }}
            >
              <Text style={s.fabOptionIcon}>🤖</Text>
              <Text style={s.fabOptionText}>AI Coach</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.fabOption}
              onPress={() => { setFabOpen(false); setShowModal(true); }}
            >
              <Text style={s.fabOptionIcon}>🎵</Text>
              <Text style={s.fabOptionText}>Share a Song</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={s.fab} onPress={() => setFabOpen(!fabOpen)}>
          <Text style={s.fabIcon}>{fabOpen ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Song Search Modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Share a Song</Text>
              <TouchableOpacity onPress={() => {
                setShowModal(false);
                setSearchResults([]);
                setSearchQuery('');
              }}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={s.searchRow}>
              <TextInput
                style={s.searchInput}
                placeholder="Search a song..."
                placeholderTextColor="#4a5a8a"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
                <Text style={s.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

            {isSearching && <ActivityIndicator color="#93b4ff" style={{ marginTop: 20 }} />}

            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={s.trackCard}>
                  {item.album.images[0] ? (
                    <Image source={{ uri: item.album.images[0].url }} style={s.trackCover} />
                  ) : (
                    <View style={[s.trackCover, s.albumFallback]}>
                      <Text>🎵</Text>
                    </View>
                  )}
                  <View style={s.trackInfo}>
                    <Text style={s.trackName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.trackArtist} numberOfLines={1}>{item.artists[0].name}</Text>
                  </View>
                  <TouchableOpacity style={s.shareTrackBtn} onPress={() => handleShareSong(item)}>
                    <Text style={s.shareTrackBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

function CircularProgress({ size, strokeWidth, progress, color, trackColor, bg, children }) {
  const p = Math.max(0, Math.min(1, progress));
  const angle = p * 360;
  const half = size / 2;
  const innerSize = size - strokeWidth * 2;
  const rightRot = `${Math.min(angle, 180) - 180}deg`;
  const leftRot = `${Math.max(0, angle - 180) - 180}deg`;

  return (
    <View style={{ width: size, height: size, borderRadius: half, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', width: size, height: size, backgroundColor: trackColor }} />
      <View style={{ position: 'absolute', right: 0, width: half, height: size, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: 0, width: size, height: size, transform: [{ rotate: rightRot }] }}>
          <View style={{ position: 'absolute', right: 0, width: half, height: size, backgroundColor: color }} />
        </View>
      </View>
      <View style={{ position: 'absolute', left: 0, width: half, height: size, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: 0, width: size, height: size, transform: [{ rotate: leftRot }] }}>
          <View style={{ position: 'absolute', left: 0, width: half, height: size, backgroundColor: color }} />
        </View>
      </View>
      <View style={{
        position: 'absolute',
        top: strokeWidth, left: strokeWidth,
        width: innerSize, height: innerSize,
        borderRadius: innerSize / 2,
        backgroundColor: bg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </View>
    </View>
  );
}

function MacroBar({ label, consumed, goal, color, theme }) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: theme.subtext, fontSize: 12 }}>{consumed}g / {goal}g</Text>
      </View>
      <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: t.bg },
    scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 120 },
    calorieCard: {
      backgroundColor: t.card, borderRadius: 20, padding: 20,
      marginBottom: 28, borderWidth: 0.5, borderColor: t.border,
    },
    cardTopRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 18,
    },
    greeting: { color: t.text, fontSize: 16, fontWeight: '600', flex: 1 },
    editBtn: {
      backgroundColor: t.inputBg, paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 8, borderWidth: 0.5, borderColor: t.border,
    },
    editBtnText: { color: t.accentLight, fontSize: 13, fontWeight: '600' },
    ringWrap: { alignItems: 'center', marginBottom: 20 },
    ringNum: { color: t.text, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    ringGoal: { color: t.subtext, fontSize: 11, textAlign: 'center', marginTop: 1 },
    ringUnit: { color: t.subtext, fontSize: 11, textAlign: 'center' },
    macros: {},
    screenTitle: { fontSize: 32, fontWeight: 'bold', color: t.text, marginBottom: 4 },
    screenSub: { fontSize: 14, color: t.subtext, marginBottom: 24 },
    feedCard: {
      backgroundColor: t.card, borderRadius: 12, padding: 16,
      marginBottom: 16, borderWidth: 0.5, borderColor: t.border,
    },
    songCard: {
      backgroundColor: t.card, borderRadius: 12, padding: 16,
      marginBottom: 16, borderWidth: 0.5, borderColor: t.border,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    albumCover: { width: 44, height: 44, borderRadius: 8 },
    albumFallback: {
      backgroundColor: t.inputBg, alignItems: 'center', justifyContent: 'center',
    },
    songInfo: { flex: 1, minWidth: 0 },
    songName: { color: t.text, fontSize: 14, fontWeight: 'bold' },
    songArtist: { color: t.accentLight, fontSize: 12, marginTop: 2 },
    playIcon: { color: t.accentLight, fontSize: 16, fontWeight: 'bold' },
    feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    feedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    feedAvatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center',
    },
    feedAvatarText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    feedName: { color: t.text, fontSize: 16, fontWeight: 'bold' },
    feedWorkoutType: { color: t.accentLight, fontSize: 13, marginTop: 2 },
    feedMeta: { color: t.subtext, fontSize: 11, marginTop: 2 },
    moreButton: { color: t.accentLight, fontSize: 13, fontWeight: 'bold' },
    feedExpanded: {
      marginTop: 12, borderTopWidth: 0.5, borderTopColor: t.border, paddingTop: 12,
    },
    feedExercise: { marginBottom: 10 },
    feedExerciseName: { color: t.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    feedSet: { color: t.subtext, fontSize: 13, marginLeft: 8 },
    empty: { color: t.subtext, fontSize: 14, textAlign: 'center', marginTop: 60 },
    fabContainer: {
      position: 'absolute', bottom: 30, right: 24, alignItems: 'flex-end',
    },
    fab: {
      width: 56, height: 56, borderRadius: 28, backgroundColor: t.accent,
      alignItems: 'center', justifyContent: 'center', elevation: 8,
      shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
    },
    fabIcon: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
    fabOption: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: t.card,
      borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
      marginBottom: 12, borderWidth: 0.5, borderColor: t.border, elevation: 4,
    },
    fabOptionIcon: { fontSize: 18, marginRight: 10 },
    fabOptionText: { color: t.text, fontSize: 14, fontWeight: '600' },
    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 24, maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 16,
    },
    modalTitle: { color: t.text, fontSize: 18, fontWeight: 'bold' },
    modalClose: { color: t.subtext, fontSize: 20 },
    searchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    searchInput: {
      flex: 1, backgroundColor: t.inputBg, borderRadius: 10,
      padding: 12, color: t.text, fontSize: 14, borderWidth: 0.5, borderColor: t.border,
    },
    searchBtn: {
      backgroundColor: t.accent, borderRadius: 10,
      paddingHorizontal: 16, justifyContent: 'center',
    },
    searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    trackCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: t.border,
    },
    trackCover: { width: 40, height: 40, borderRadius: 6 },
    trackInfo: { flex: 1, minWidth: 0 },
    trackName: { color: t.text, fontSize: 14, fontWeight: '600' },
    trackArtist: { color: t.subtext, fontSize: 12, marginTop: 2 },
    shareTrackBtn: {
      backgroundColor: t.accent, borderRadius: 8,
      paddingHorizontal: 14, paddingVertical: 8,
    },
    shareTrackBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  });
}