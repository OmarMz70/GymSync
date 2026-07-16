import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const EMPTY_FORM = { name: '', calories: '', protein: '', carbs: '', fat: '' };

export default function CalorieLogScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = makeStyles(theme);

  const [meals, setMeals] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const todayKey = getTodayKey();
  const mealsRef = collection(db, 'users', user.uid, 'logs', todayKey, 'meals');
  const savedRef = collection(db, 'users', user.uid, 'savedMeals');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mealsSnap, savedSnap] = await Promise.all([
        getDocs(query(mealsRef, orderBy('timestamp', 'asc'))),
        getDocs(savedRef),
      ]);
      setMeals(mealsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSavedMeals(savedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [user.uid, todayKey]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addMeal = async (saveToo = false) => {
    if (!form.name.trim() || !form.calories) {
      Alert.alert('Missing info', 'Please enter at least a name and calories.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        timestamp: serverTimestamp(),
      };
      await addDoc(mealsRef, data);
      if (saveToo) {
        const { timestamp, ...saveData } = data;
        await addDoc(savedRef, saveData);
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const quickAdd = async (meal) => {
    try {
      await addDoc(mealsRef, {
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        timestamp: serverTimestamp(),
      });
      await loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const deleteMeal = (id) => {
    Alert.alert('Remove meal', "Remove this meal from today's log?", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'users', user.uid, 'logs', todayKey, 'meals', id));
          await loadData();
        },
      },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Today's Log</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accentLight} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          {/* Running totals */}
          <View style={s.totalsCard}>
            <Text style={s.totalsLabel}>Running Total</Text>
            <Text style={s.totalsCalories}>{totals.calories} kcal</Text>
            <View style={s.macroRow}>
              <MacroBadge label="Protein" value={totals.protein} color="#93b4ff" />
              <MacroBadge label="Carbs" value={totals.carbs} color="#f4a261" />
              <MacroBadge label="Fat" value={totals.fat} color="#2a9d8f" />
            </View>
          </View>

          {/* Quick-add saved meals */}
          {savedMeals.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Quick Add</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.chipRow}>
                  {savedMeals.map(m => (
                    <TouchableOpacity key={m.id} style={s.chip} onPress={() => quickAdd(m)}>
                      <Text style={s.chipName}>{m.name}</Text>
                      <Text style={s.chipCal}>{m.calories} kcal</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Meals list */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Meals</Text>
            {meals.length === 0 && <Text style={s.empty}>No meals logged yet.</Text>}
            {meals.map(m => (
              <View key={m.id} style={s.mealCard}>
                <View style={s.mealTop}>
                  <Text style={s.mealName}>{m.name}</Text>
                  <TouchableOpacity onPress={() => deleteMeal(m.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={s.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.mealMacros}>
                  <Text style={s.mealCal}>{m.calories} kcal</Text>
                  <Text style={s.mealMacro}>P {m.protein}g</Text>
                  <Text style={s.mealMacro}>C {m.carbs}g</Text>
                  <Text style={s.mealMacro}>F {m.fat}g</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
            <Text style={s.addBtnText}>+ Add Meal</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Add meal bottom sheet */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Add Meal</Text>
            {[
              { key: 'name', label: 'Meal name', numeric: false },
              { key: 'calories', label: 'Calories (kcal)', numeric: true },
              { key: 'protein', label: 'Protein (g)', numeric: true },
              { key: 'carbs', label: 'Carbs (g)', numeric: true },
              { key: 'fat', label: 'Fat (g)', numeric: true },
            ].map(({ key, label, numeric }) => (
              <TextInput
                key={key}
                style={s.input}
                placeholder={label}
                placeholderTextColor={theme.subtext}
                value={form[key]}
                onChangeText={v => setForm(p => ({ ...p, [key]: v }))}
                keyboardType={numeric ? 'numeric' : 'default'}
              />
            ))}
            <TouchableOpacity style={s.sheetBtn} onPress={() => addMeal(false)} disabled={saving}>
              <Text style={s.sheetBtnText}>{saving ? 'Saving…' : 'Add to Log'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.sheetBtn, s.sheetBtnAlt]} onPress={() => addMeal(true)} disabled={saving}>
              <Text style={s.sheetBtnText}>Add + Save for Quick Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MacroBadge({ label, value, color }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>{value}g</Text>
      <Text style={{ color: '#4a5a8a', fontSize: 12, marginTop: 2 }}>{label}</Text>
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
    totalsCard: {
      backgroundColor: t.card, borderRadius: 16, padding: 20,
      marginBottom: 20, borderWidth: 0.5, borderColor: t.border, alignItems: 'center',
    },
    totalsLabel: { color: t.subtext, fontSize: 13, marginBottom: 4 },
    totalsCalories: { color: t.text, fontSize: 40, fontWeight: 'bold', marginBottom: 14 },
    macroRow: { flexDirection: 'row', width: '100%' },
    section: { marginBottom: 20 },
    sectionTitle: {
      color: t.subtext, fontSize: 12, fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
    },
    chipRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
    chip: {
      backgroundColor: t.card, borderRadius: 12, padding: 12,
      borderWidth: 0.5, borderColor: t.border, alignItems: 'center', minWidth: 90,
    },
    chipName: { color: t.text, fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
    chipCal: { color: t.accentLight, fontSize: 12 },
    mealCard: {
      backgroundColor: t.card, borderRadius: 12, padding: 14,
      marginBottom: 10, borderWidth: 0.5, borderColor: t.border,
    },
    mealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    mealName: { color: t.text, fontSize: 15, fontWeight: 'bold', flex: 1 },
    deleteBtn: { color: t.subtext, fontSize: 15, paddingLeft: 8 },
    mealMacros: { flexDirection: 'row', gap: 12 },
    mealCal: { color: t.accentLight, fontSize: 13, fontWeight: '600' },
    mealMacro: { color: t.subtext, fontSize: 13 },
    empty: { color: t.subtext, fontSize: 14, textAlign: 'center', paddingVertical: 20 },
    addBtn: { backgroundColor: t.accentLight, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
    addBtnText: { color: '#0a0f1e', fontSize: 16, fontWeight: 'bold' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 24, paddingBottom: 48,
    },
    sheetTitle: { color: t.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    input: {
      backgroundColor: t.inputBg, borderRadius: 10, padding: 14,
      color: t.text, marginBottom: 10, fontSize: 15,
    },
    sheetBtn: { backgroundColor: t.accentLight, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10 },
    sheetBtnAlt: { backgroundColor: '#2a9d8f' },
    sheetBtnText: { color: '#0a0f1e', fontSize: 15, fontWeight: 'bold' },
    cancelBtn: { alignItems: 'center', padding: 12 },
    cancelText: { color: t.subtext, fontSize: 15 },
  });
}
