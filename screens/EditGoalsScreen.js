import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULTS = { calories: '2500', protein: '150', carbs: '300', fat: '80' };

export default function EditGoalsScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = makeStyles(theme);

  const [goals, setGoals] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'goals', 'daily'));
        if (snap.exists()) {
          const d = snap.data();
          setGoals({
            calories: String(d.calories ?? DEFAULTS.calories),
            protein: String(d.protein ?? DEFAULTS.protein),
            carbs: String(d.carbs ?? DEFAULTS.carbs),
            fat: String(d.fat ?? DEFAULTS.fat),
          });
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, [user.uid]);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'goals', 'daily'), {
        calories: Number(goals.calories) || 2500,
        protein: Number(goals.protein) || 150,
        carbs: Number(goals.carbs) || 300,
        fat: Number(goals.fat) || 80,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const FIELDS = [
    { key: 'calories', label: 'Calories', unit: 'kcal', color: '#93b4ff' },
    { key: 'protein', label: 'Protein', unit: 'g', color: '#93b4ff' },
    { key: 'carbs', label: 'Carbs', unit: 'g', color: '#f4a261' },
    { key: 'fat', label: 'Fat', unit: 'g', color: '#2a9d8f' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Daily Goals</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accentLight} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.hint}>Set your daily nutrition targets. These are used to calculate ring and bar progress on the Home screen.</Text>
          {FIELDS.map(({ key, label, unit, color }) => (
            <View key={key} style={s.fieldGroup}>
              <View style={s.labelRow}>
                <View style={[s.dot, { backgroundColor: color }]} />
                <Text style={s.label}>{label}</Text>
                <Text style={s.unit}>{unit}</Text>
              </View>
              <TextInput
                style={s.input}
                value={goals[key]}
                onChangeText={v => setGoals(p => ({ ...p, [key]: v }))}
                keyboardType="numeric"
                placeholderTextColor={theme.subtext}
                placeholder={DEFAULTS[key]}
              />
            </View>
          ))}

          <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save Goals'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16,
    },
    backBtn: { marginRight: 16 },
    backText: { color: t.accentLight, fontSize: 16 },
    title: { color: t.text, fontSize: 22, fontWeight: 'bold' },
    scroll: { padding: 24, paddingBottom: 60 },
    hint: { color: t.subtext, fontSize: 13, marginBottom: 24, lineHeight: 19 },
    fieldGroup: { marginBottom: 18 },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    label: { color: t.text, fontSize: 15, fontWeight: '600', flex: 1 },
    unit: { color: t.subtext, fontSize: 13 },
    input: {
      backgroundColor: t.inputBg, borderRadius: 10, padding: 14,
      color: t.text, fontSize: 17, fontWeight: '600',
    },
    saveBtn: {
      backgroundColor: t.accentLight, borderRadius: 12,
      padding: 16, alignItems: 'center', marginTop: 8,
    },
    saveBtnText: { color: '#0a0f1e', fontSize: 16, fontWeight: 'bold' },
  });
}
