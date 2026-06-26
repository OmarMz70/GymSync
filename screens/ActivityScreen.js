import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';

const splitDays = ['Push', 'Pull', 'Legs'];

export default function ActivityScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { addPost } = useWorkout();
  const { profile } = useAuth();

  const [workoutType, setWorkoutType] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState('');

  const addExercise = () => {
    if (!exerciseName.trim()) return;
    setExercises([...exercises, { id: Date.now(), name: exerciseName, sets: [] }]);
    setExerciseName('');
  };

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

  const handleFinish = () => {
    addPost({
      name: profile?.name || 'Me',
      workout: workoutType,
      exercises: exercises.map(ex => ({ name: ex.name, sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight })) })),
    });
    setWorkoutType(null);
    setExercises([]);
    navigation.navigate('Home');
  };

  if (!workoutType) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>Today's Workout</Text>
        <Text style={styles.screenSub}>What are you training today?</Text>
        <View style={styles.workoutTypeGrid}>
          {splitDays.map(type => (
            <TouchableOpacity key={type} style={styles.workoutTypeButton} onPress={() => setWorkoutType(type)}>
              <Text style={styles.workoutTypeText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.workoutHeader}>
        <Text style={styles.screenTitle}>{workoutType} Day</Text>
        <TouchableOpacity onPress={() => { setWorkoutType(null); setExercises([]); }}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {exercises.map((exercise) => (
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

      <View style={styles.addExerciseRow}>
        <TextInput style={styles.exerciseInput} placeholder="Exercise name..." placeholderTextColor={theme.subtext} value={exerciseName} onChangeText={setExerciseName} />
        <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
          <Text style={styles.addExerciseText}>Add</Text>
        </TouchableOpacity>
      </View>

      {exercises.length > 0 && (
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      )}
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
    addExerciseRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 16 },
    exerciseInput: { flex: 1, backgroundColor: t.card, borderRadius: 10, padding: 14, color: t.text, fontSize: 15, borderWidth: 0.5, borderColor: t.border },
    addExerciseButton: { backgroundColor: t.accent, borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
    addExerciseText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
    finishButton: { backgroundColor: t.accent, borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
    finishButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  });
}
