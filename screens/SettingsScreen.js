import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = makeStyles(theme);
  const [language, setLanguage] = useState('English');

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <TouchableOpacity style={[styles.toggle, isDark && styles.toggleActive]} onPress={toggleTheme}>
            <View style={[styles.toggleKnob, isDark && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.cardLabel, { marginTop: 16 }]}>Language</Text>
        <View style={styles.languageRow}>
          <TouchableOpacity style={[styles.langButton, language === 'English' && styles.langButtonActive]} onPress={() => setLanguage('English')}>
            <Text style={[styles.langText, language === 'English' && styles.langTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.langButton, language === 'Arabic' && styles.langButtonActive]} onPress={() => setLanguage('Arabic')}>
            <Text style={[styles.langText, language === 'Arabic' && styles.langTextActive]}>العربية</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Account</Text>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingText}>Account Info</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingText}>Notifications</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingText}>Privacy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>About</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: t.bg },
    scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    screenTitle: { fontSize: 32, fontWeight: 'bold', color: t.text, marginBottom: 24 },
    card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: t.border },
    cardLabel: { color: t.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    divider: { height: 0.5, backgroundColor: t.border, marginVertical: 4 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    settingText: { color: t.text, fontSize: 14 },
    settingArrow: { color: t.subtext, fontSize: 20 },
    settingValue: { color: t.subtext, fontSize: 14 },
    toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: t.border, justifyContent: 'center', padding: 2 },
    toggleActive: { backgroundColor: t.accent },
    toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#ffffff' },
    toggleKnobActive: { alignSelf: 'flex-end' },
    languageRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 4 },
    langButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 0.5, borderColor: t.border, alignItems: 'center' },
    langButtonActive: { borderColor: t.accent, backgroundColor: t.accent + '22' },
    langText: { color: t.subtext, fontSize: 14 },
    langTextActive: { color: t.accentLight, fontWeight: 'bold' },
  });
}
