import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { getMuscleName, searchExercises } from '../src/data/exercises';
import { SPLIT_PRESETS } from '../src/data/splitPresets';

// Users without a saved split (or with a legacy string value) fall back to PPL
const FALLBACK_DAYS = SPLIT_PRESETS.find(p => p.id === 'ppl').days;

export default function ActivityScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { addPost } = useWorkout();
  const { profile, updateProfile } = useAuth();

  const [workoutDay, setWorkoutDay] = useState(null);
  const [exercises, setExercises] = useState([]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerMuscle, setPickerMuscle] = useState(null);

  const splitDays = Array.isArray(profile?.split) && profile.split.length > 0
    ? profile.split
    : FALLBACK_DAYS;

  const addSet = (exerciseId) => {
    setExercises(exercises.map(ex =>
      ex.id !== exerciseId ? ex : { ...ex, sets: [...ex.sets, { id: Date.now(), reps: '', weight: '' }] }
    ));
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setExercises(exercises.map(ex =>
      ex.id !== exerciseId ? ex : { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) }
    ));
  };

  const deleteExercise = (exerciseId) => setExercises(exercises.filter(ex => ex.id !== exerciseId));

  const addExerciseFromPicker = (name, muscle) => {
    setExercises([...exercises, { id: Date.now(), name, muscle, sets: [] }]);
  };

  const openPicker = (muscleId) => {
    setPickerQuery('');
    setPickerMuscle(muscleId);
    setPickerVisible(true);
  };

  const handleFinish = () => {
    addPost({
      name: profile?.name || 'Me',
      workout: workoutDay.name,
      exercises: exercises.map(ex => ({ name: ex.name, sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight })) })),
    });
    setWorkoutDay(null);
    setExercises([]);
    navigation.navigate('Home');
  };

  if (!workoutDay) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>Today's Workout</Text>
        <Text style={styles.screenSub}>What are you training today?</Text>
        <View style={styles.workoutTypeGrid}>
          {splitDays.map(day => (
            <TouchableOpacity key={day.id} style={styles.workoutTypeButton} onPress={() => setWorkoutDay(day)}>
              <Text style={styles.workoutTypeText}>{day.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.editSplitButton} onPress={() => navigation.navigate('ChooseSplit')}>
          <Text style={styles.editSplitText}>Edit Split</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dayMuscles = workoutDay.muscles || [];
  // Each muscle of the day gets its own section; days with no muscles get one generic section
  const sections = dayMuscles.length > 0 ? dayMuscles : [null];
  const addedNames = new Set(exercises.map(ex => ex.name.toLowerCase()));
  const trimmedQuery = pickerQuery.trim();

  // User-created exercises saved on their profile, scoped to the picker's muscle
  const customExercises = Array.isArray(profile?.customExercises) ? profile.customExercises : [];
  const queryWords = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const matchingCustoms = customExercises.filter(ex =>
    (!pickerMuscle || ex.muscle === pickerMuscle) &&
    queryWords.every(w => ex.name.toLowerCase().includes(w))
  );
  const pickerResults = [
    ...searchExercises(pickerQuery, pickerMuscle ? [pickerMuscle] : null),
    ...matchingCustoms,
  ];
  const queryIsNew = trimmedQuery.length > 0 &&
    !addedNames.has(trimmedQuery.toLowerCase()) &&
    !pickerResults.some(ex => ex.name.toLowerCase() === trimmedQuery.toLowerCase());

  // Adds to this workout AND saves permanently under this muscle for future pickers
  const addCustomExercise = () => {
    addExerciseFromPicker(trimmedQuery, pickerMuscle);
    const entry = { id: `custom-${Date.now()}`, name: trimmedQuery, muscle: pickerMuscle };
    updateProfile({ customExercises: [...customExercises, entry] }).catch(() => {});
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.workoutHeader}>
        <Text style={styles.screenTitle}>{workoutDay.name} Day</Text>
        <TouchableOpacity onPress={() => { setWorkoutDay(null); setExercises([]); }}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {sections.map(muscleId => {
        const sectionExercises = muscleId ? exercises.filter(ex => ex.muscle === muscleId) : exercises;
        return (
          <View key={muscleId || 'all'} style={styles.muscleSection}>
            <View style={styles.muscleSectionHeader}>
              <Text style={styles.muscleSectionTitle}>{muscleId ? getMuscleName(muscleId) : 'Exercises'}</Text>
              <TouchableOpacity onPress={() => openPicker(muscleId)}>
                <Text style={styles.muscleSectionAdd}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {sectionExercises.length === 0 && (
              <Text style={styles.muscleSectionEmpty}>No exercises yet</Text>
            )}

            {sectionExercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <TouchableOpacity onPress={() => deleteExercise(exercise.id)}>
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.setLabelRow}>
                  <Text style={styles.setLabelNum}>Set</Text>
                  <Text style={styles.setLabel}>Reps</Text>
                  <Text style={styles.setLabel}>Weight (kg)</Text>
                </View>
                {exercise.sets.map((set, index) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNumber}>{index + 1}</Text>
                    <TextInput style={styles.setInput} placeholder="0" placeholderTextColor={theme.subtext} keyboardType="numeric" value={set.reps} onChangeText={(val) => updateSet(exercise.id, set.id, 'reps', val)} />
                    <TextInput style={styles.setInput} placeholder="0" placeholderTextColor={theme.subtext} keyboardType="numeric" value={set.weight} onChangeText={(val) => updateSet(exercise.id, set.id, 'weight', val)} />
                  </View>
                ))}
                <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
                  <Text style={styles.addSetText}>+ Add Set</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      })}

      {exercises.length > 0 && (
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      )}

      {/* ── Exercise Picker Modal ── */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickerMuscle ? `Add ${getMuscleName(pickerMuscle)} Exercise` : 'Add Exercise'}
              </Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={theme.subtext}
              value={pickerQuery}
              onChangeText={setPickerQuery}
            />

            <FlatList
              data={pickerResults}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={styles.pickerEmpty}>No exercises found</Text>}
              ListFooterComponent={queryIsNew ? (
                <TouchableOpacity style={styles.customAddRow} onPress={addCustomExercise}>
                  <Text style={styles.customAddText}>+ Add "{trimmedQuery}" as custom exercise</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.customHint}>
                  Can't find your exercise? Type its name in the search bar to add your own — it stays saved for next time.
                </Text>
              )}
              renderItem={({ item }) => {
                const added = addedNames.has(item.name.toLowerCase());
                return (
                  <TouchableOpacity
                    style={styles.pickerRow}
                    onPress={() => addExerciseFromPicker(item.name, item.muscle)}
                    disabled={added}
                  >
                    <View style={styles.pickerRowInfo}>
                      <Text style={styles.pickerRowName}>{item.name}</Text>
                      <Text style={styles.pickerRowMuscle}>
                        {String(item.id).startsWith('custom-') ? 'Custom' : getMuscleName(item.muscle)}
                      </Text>
                    </View>
                    <Text style={[styles.pickerRowAdd, added && styles.pickerRowAdded]}>
                      {added ? 'Added ✓' : '+ Add'}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity style={styles.pickerDoneButton} onPress={() => setPickerVisible(false)}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
    scrollView: { flex: 1, backgroundColor: t.bg },
    scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    screenTitle: { fontSize: 32, fontWeight: 'bold', color: t.text, marginBottom: 4 },
    screenSub: { fontSize: 14, color: t.subtext, marginBottom: 24 },
    workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    changeText: { color: t.accentLight, fontSize: 14 },
    workoutTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24, justifyContent: 'center' },
    workoutTypeButton: { backgroundColor: t.card, borderRadius: 10, paddingVertical: 20, paddingHorizontal: 32, minWidth: '40%', alignItems: 'center', borderWidth: 0.5, borderColor: t.border },
    workoutTypeText: { color: t.text, fontSize: 18, fontWeight: 'bold' },
    editSplitButton: { marginTop: 28, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10, borderWidth: 0.5, borderColor: t.border },
    editSplitText: { color: t.accentLight, fontSize: 14, fontWeight: 'bold' },
    exerciseCard: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: t.border },
    exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    exerciseName: { color: t.text, fontSize: 18, fontWeight: 'bold' },
    deleteText: { color: t.subtext, fontSize: 16 },
    setLabelRow: { flexDirection: 'row', marginBottom: 6, paddingHorizontal: 2 },
    setLabelNum: { color: t.subtext, fontSize: 12, width: 32 },
    setLabel: { color: t.subtext, fontSize: 12, flex: 1, textAlign: 'center' },
    setRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    setNumber: { color: t.subtext, fontSize: 14, width: 32, textAlign: 'center' },
    setInput: { flex: 1, backgroundColor: t.inputBg, borderRadius: 8, padding: 8, color: t.text, fontSize: 13, textAlign: 'center', minWidth: 0, borderWidth: 0.5, borderColor: t.border },
    addSetButton: { marginTop: 8, alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 0.5, borderColor: t.border },
    addSetText: { color: t.accentLight, fontSize: 14, fontWeight: 'bold' },
    finishButton: { backgroundColor: t.accent, borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
    finishButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    muscleSection: { marginBottom: 20 },
    muscleSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
    muscleSectionTitle: { color: t.text, fontSize: 17, fontWeight: 'bold' },
    muscleSectionAdd: { color: t.accentLight, fontSize: 14, fontWeight: 'bold' },
    muscleSectionEmpty: { color: t.subtext, fontSize: 13, marginBottom: 8 },
    customAddRow: { paddingVertical: 14, alignItems: 'center' },
    customAddText: { color: t.accentLight, fontSize: 14, fontWeight: 'bold' },
    customHint: { color: t.subtext, fontSize: 12, textAlign: 'center', paddingVertical: 14, lineHeight: 17, paddingHorizontal: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { color: t.text, fontSize: 18, fontWeight: 'bold' },
    modalClose: { color: t.subtext, fontSize: 20 },
    searchInput: { backgroundColor: t.inputBg, borderRadius: 10, padding: 12, color: t.text, fontSize: 14, borderWidth: 0.5, borderColor: t.border, marginBottom: 12 },
    pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: t.border },
    pickerRowInfo: { flex: 1, minWidth: 0 },
    pickerRowName: { color: t.text, fontSize: 14, fontWeight: '600' },
    pickerRowMuscle: { color: t.subtext, fontSize: 12, marginTop: 2 },
    pickerRowAdd: { color: t.accentLight, fontSize: 13, fontWeight: 'bold' },
    pickerRowAdded: { color: t.alreadyWent },
    pickerEmpty: { color: t.subtext, fontSize: 13, textAlign: 'center', marginVertical: 24 },
    pickerDoneButton: { backgroundColor: t.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
    pickerDoneText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  });
}
