import { useState, useRef, Fragment } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, Animated, PanResponder,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { MUSCLES, getMuscleName } from '../src/data/exercises';

export default function SplitBuilderScreen({ navigation, route }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { updateProfile } = useAuth();

  const [days, setDays] = useState(() =>
    (route.params?.days || []).map(d => ({ ...d, muscles: [...d.muscles] }))
  );
  const [saving, setSaving] = useState(false);

  // Day modal state — editingId null means adding a new day
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dayName, setDayName] = useState('');
  const [dayMuscles, setDayMuscles] = useState([]);

  // ── Hold-and-drag reordering ──
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [hoverSlot, setHoverSlot] = useState(null);
  const pan = useRef(new Animated.Value(0)).current;
  const draggingRef = useRef(null);
  const grantedRef = useRef(false);
  const hoverSlotRef = useRef(null);
  const layoutsRef = useRef([]);
  const daysRef = useRef(days);
  daysRef.current = days;

  // Insertion slot = how many other cards' midpoints sit above the dragged card's center
  const computeSlot = (from, dy) => {
    const layouts = layoutsRef.current;
    const count = daysRef.current.length;
    const me = layouts[from];
    if (!me) return from;
    const center = me.y + me.h / 2 + dy;
    let slot = 0;
    for (let j = 0; j < count; j++) {
      if (j === from) continue;
      const lj = layouts[j];
      if (lj && center > lj.y + lj.h / 2) slot++;
    }
    return slot;
  };

  const startDrag = (index) => {
    draggingRef.current = index;
    hoverSlotRef.current = index;
    pan.setValue(0);
    setDraggingIndex(index);
    setHoverSlot(index);
  };

  const endDrag = () => {
    draggingRef.current = null;
    grantedRef.current = false;
    hoverSlotRef.current = null;
    pan.setValue(0);
    setDraggingIndex(null);
    setHoverSlot(null);
  };

  const finishDrag = (dy) => {
    const from = draggingRef.current;
    if (from !== null) {
      const slot = computeSlot(from, dy);
      setDays(prev => {
        if (from >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(slot, 0, moved);
        return next;
      });
    }
    endDrag();
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: () => draggingRef.current !== null,
    onPanResponderGrant: () => { grantedRef.current = true; },
    onPanResponderMove: (_, g) => {
      pan.setValue(g.dy);
      const slot = computeSlot(draggingRef.current, g.dy);
      if (slot !== hoverSlotRef.current) {
        hoverSlotRef.current = slot;
        setHoverSlot(slot);
      }
    },
    onPanResponderRelease: (_, g) => finishDrag(g.dy),
    onPanResponderTerminate: (_, g) => finishDrag(g.dy),
  })).current;

  const openAddDay = () => {
    setEditingId(null);
    setDayName('');
    setDayMuscles([]);
    setModalVisible(true);
  };

  const openEditDay = (day) => {
    setEditingId(day.id);
    setDayName(day.name);
    setDayMuscles([...day.muscles]);
    setModalVisible(true);
  };

  const toggleMuscle = (muscleId) => {
    setDayMuscles(prev =>
      prev.includes(muscleId) ? prev.filter(m => m !== muscleId) : [...prev, muscleId]
    );
  };

  const saveDay = () => {
    const name = dayName.trim();
    if (!name || dayMuscles.length === 0) return;
    if (editingId) {
      setDays(days.map(d => d.id === editingId ? { ...d, name, muscles: dayMuscles } : d));
    } else {
      setDays([...days, { id: Date.now().toString(), name, muscles: dayMuscles }]);
    }
    setModalVisible(false);
  };

  const deleteDay = (day) => {
    Alert.alert('Delete day', `Remove "${day.name}" from your split?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setDays(days.filter(d => d.id !== day.id)) },
    ]);
  };

  const saveSplit = async () => {
    if (days.length === 0) {
      Alert.alert('Empty split', 'Add at least one day before saving.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ split: days });
      navigation.popToTop();
    } catch (e) {
      Alert.alert('Error', 'Could not save your split. Try again.');
    }
    setSaving(false);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>{route.params?.title || 'Split Builder'}</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        scrollEnabled={draggingIndex === null}
      >
        {days.length === 0 ? (
          <Text style={s.empty}>No days yet. Add your first training day below.</Text>
        ) : (
          <Text style={s.builderHint}>Tap a day to edit it. Hold & drag to reorder.</Text>
        )}

        <View {...panResponder.panHandlers}>
          {days.map((day, index) => {
            const isDragging = draggingIndex === index;
            const showLineAbove =
              draggingIndex !== null &&
              index !== draggingIndex &&
              hoverSlot === index - (draggingIndex < index ? 1 : 0);
            return (
              <Fragment key={day.id}>
                {showLineAbove && <View style={s.dropLine} />}
                <Animated.View
                  onLayout={(e) => {
                    const { y, height } = e.nativeEvent.layout;
                    layoutsRef.current[index] = { y, h: height };
                  }}
                  style={[
                    s.dayCardWrap,
                    isDragging && {
                      transform: [{ translateY: pan }, { scale: 1.05 }],
                      zIndex: 10, elevation: 8,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[s.dayCard, isDragging && s.dayCardDragging]}
                    activeOpacity={0.85}
                    onPress={() => openEditDay(day)}
                    onLongPress={() => startDrag(index)}
                    delayLongPress={220}
                    onPressOut={() => { if (!grantedRef.current) endDrag(); }}
                  >
                    <View style={s.dayHeader}>
                      <Text style={s.dayName}>{day.name}</Text>
                      <TouchableOpacity
                        onPress={() => deleteDay(day)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={s.deleteText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={s.chipRow}>
                      {day.muscles.map(m => (
                        <View key={m} style={s.chip}>
                          <Text style={s.chipText}>{getMuscleName(m)}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </Fragment>
            );
          })}
          {draggingIndex !== null && hoverSlot === days.length - 1 && <View style={s.dropLine} />}
        </View>

        <TouchableOpacity style={s.addDayButton} onPress={openAddDay}>
          <Text style={s.addDayText}>+ Add Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.saveButton, saving && s.saveButtonDisabled]}
          onPress={saveSplit}
          disabled={saving}
        >
          <Text style={s.saveButtonText}>{saving ? 'Saving…' : 'Save Split'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Add / Edit Day Modal ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingId ? 'Edit Day' : 'Add Day'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={s.nameInput}
              placeholder="Day name (e.g. Push)"
              placeholderTextColor={theme.subtext}
              value={dayName}
              onChangeText={setDayName}
            />

            <Text style={s.muscleLabel}>Muscles trained this day:</Text>
            <ScrollView style={s.muscleScroll}>
              <View style={s.muscleGrid}>
                {MUSCLES.map(m => {
                  const selected = dayMuscles.includes(m.id);
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[s.muscleChip, selected && s.muscleChipActive]}
                      onPress={() => toggleMuscle(m.id)}
                    >
                      <Text style={[s.muscleChipText, selected && s.muscleChipTextActive]}>
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[s.modalSaveButton, (!dayName.trim() || dayMuscles.length === 0) && s.saveButtonDisabled]}
              onPress={saveDay}
              disabled={!dayName.trim() || dayMuscles.length === 0}
            >
              <Text style={s.saveButtonText}>{editingId ? 'Save Changes' : 'Add Day'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    scroll: { padding: 24, paddingTop: 8, paddingBottom: 60 },
    empty: { color: t.subtext, fontSize: 14, textAlign: 'center', marginVertical: 32 },
    builderHint: { color: t.subtext, fontSize: 13, marginBottom: 16 },
    dayCardWrap: { marginBottom: 14 },
    dayCard: {
      backgroundColor: t.card, borderRadius: 12, padding: 16,
      borderWidth: 0.5, borderColor: t.border,
    },
    dayCardDragging: {
      borderColor: t.accentLight, borderWidth: 1,
      shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    dropLine: {
      height: 3, borderRadius: 2, backgroundColor: t.accentLight,
      marginBottom: 14, marginHorizontal: 4,
    },
    dayHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 10,
    },
    dayName: { color: t.text, fontSize: 16, fontWeight: 'bold', flex: 1 },
    deleteText: { color: t.subtext, fontSize: 16 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      backgroundColor: t.inputBg, borderRadius: 14,
      paddingHorizontal: 10, paddingVertical: 4,
      borderWidth: 0.5, borderColor: t.border,
    },
    chipText: { color: t.accentLight, fontSize: 12 },
    addDayButton: {
      borderRadius: 12, padding: 16, alignItems: 'center',
      borderWidth: 0.5, borderColor: t.border, marginBottom: 14,
    },
    addDayText: { color: t.accentLight, fontSize: 15, fontWeight: 'bold' },
    saveButton: {
      backgroundColor: t.accent, borderRadius: 12,
      padding: 16, alignItems: 'center',
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
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
    nameInput: {
      backgroundColor: t.inputBg, borderRadius: 10, padding: 12,
      color: t.text, fontSize: 14, borderWidth: 0.5, borderColor: t.border,
      marginBottom: 16,
    },
    muscleLabel: { color: t.subtext, fontSize: 13, marginBottom: 10 },
    muscleScroll: { maxHeight: 260, marginBottom: 16 },
    muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    muscleChip: {
      borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8,
      borderWidth: 0.5, borderColor: t.border, backgroundColor: t.inputBg,
    },
    muscleChipActive: { borderColor: t.accentLight, backgroundColor: t.accent },
    muscleChipText: { color: t.subtext, fontSize: 13 },
    muscleChipTextActive: { color: '#ffffff', fontWeight: 'bold' },
    modalSaveButton: {
      backgroundColor: t.accent, borderRadius: 12,
      padding: 16, alignItems: 'center',
    },
  });
}
