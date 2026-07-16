import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SPLIT_PRESETS } from '../src/data/splitPresets';
import { getMuscleName } from '../src/data/exercises';

export default function ChooseSplitScreen({ navigation }) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { profile } = useAuth();

  const currentSplit = Array.isArray(profile?.split) && profile.split.length > 0
    ? profile.split
    : null;

  const muscleSummary = (days) =>
    [...new Set(days.flatMap(d => d.muscles))].map(getMuscleName).join(', ');

  const dayCount = (n) => `${n} ${n === 1 ? 'day' : 'days'}`;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Choose Your Split</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.hint}>
          Pick a template to start from — you can rename days, change muscles, and add or remove days in the next step.
        </Text>

        {currentSplit && (
          <TouchableOpacity
            style={[s.presetCard, s.currentCard]}
            onPress={() => navigation.navigate('SplitBuilder', { days: currentSplit, title: 'Edit Split' })}
          >
            <View style={s.presetTopRow}>
              <Text style={s.presetName}>Your Current Split</Text>
              <Text style={s.presetDayCount}>{dayCount(currentSplit.length)}</Text>
            </View>
            <Text style={s.presetSummary} numberOfLines={1}>
              {currentSplit.map(d => d.name).join(' · ')}
            </Text>
            <Text style={s.editHint}>Tap to edit</Text>
          </TouchableOpacity>
        )}

        {SPLIT_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset.id}
            style={s.presetCard}
            onPress={() => navigation.navigate('SplitBuilder', { days: preset.days, title: preset.name })}
          >
            <View style={s.presetTopRow}>
              <Text style={s.presetName}>{preset.name}</Text>
              <Text style={s.presetDayCount}>
                {preset.days.length > 0 ? dayCount(preset.days.length) : 'Blank'}
              </Text>
            </View>
            <Text style={s.presetSummary} numberOfLines={2}>
              {preset.days.length > 0 ? muscleSummary(preset.days) : preset.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    hint: { color: t.subtext, fontSize: 13, marginBottom: 20, lineHeight: 19 },
    presetCard: {
      backgroundColor: t.card, borderRadius: 12, padding: 16,
      marginBottom: 14, borderWidth: 0.5, borderColor: t.border,
    },
    currentCard: { borderColor: t.accentLight, borderWidth: 1 },
    presetTopRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 6,
    },
    presetName: { color: t.text, fontSize: 16, fontWeight: 'bold' },
    presetDayCount: { color: t.accentLight, fontSize: 13, fontWeight: '600' },
    presetSummary: { color: t.subtext, fontSize: 12, lineHeight: 17 },
    editHint: { color: t.accentLight, fontSize: 12, marginTop: 8 },
  });
}
