import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const splits = ['PPL', 'Upper/Lower', 'Bro Split', 'Full Body', 'Arnold Split', '5/3/1', 'Custom'];

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { profile, logout, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [gym, setGym] = useState('');
  const [split, setSplit] = useState('PPL');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setGym(profile.gym || '');
      setSplit(profile.split || 'PPL');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), gym: gym.trim(), split });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.screenTitle}>Profile</Text>

      <View style={styles.profileAvatarContainer}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{name ? name[0].toUpperCase() : '?'}</Text>
        </View>
        {profile?.gymSyncId && (
          <Text style={styles.gymSyncId}>ID #{profile.gymSyncId}</Text>
        )}
        <TouchableOpacity>
          <Text style={styles.changePfpText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Name</Text>
        {editing ? (
          <TextInput style={styles.profileInputFull} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={theme.subtext} />
        ) : (
          <Text style={styles.profileValue}>{name || '—'}</Text>
        )}
        <Text style={[styles.profileLabel, { marginTop: 16 }]}>Gym(s)</Text>
        {editing ? (
          <TextInput style={styles.profileInputFull} value={gym} onChangeText={setGym} placeholder="e.g. GymNation, B Fit" placeholderTextColor={theme.subtext} />
        ) : (
          <Text style={styles.profileValue}>{gym || '—'}</Text>
        )}
        <Text style={[styles.profileLabel, { marginTop: 16 }]}>Current Split</Text>
        <Text style={styles.profileValue}>{split}</Text>
      </View>

      {editing && (
        <View style={styles.splitGrid}>
          <Text style={styles.splitLabel}>Choose your split:</Text>
          {splits.map(s => (
            <TouchableOpacity key={s} style={[styles.splitOption, split === s && styles.splitOptionActive]} onPress={() => setSplit(s)}>
              <Text style={[styles.splitOptionText, split === s && styles.splitOptionTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.editButton, saving && styles.editButtonDisabled]}
        onPress={editing ? handleSave : () => setEditing(true)}
        disabled={saving}
      >
        <Text style={styles.editButtonText}>{saving ? 'Saving...' : editing ? 'Save' : 'Edit Profile'}</Text>
      </TouchableOpacity>

      {editing && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => {
          setName(profile?.name || '');
          setGym(profile?.gym || '');
          setSplit(profile?.split || 'PPL');
          setEditing(false);
        }}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: t.bg },
    scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    screenTitle: { fontSize: 32, fontWeight: 'bold', color: t.text, marginBottom: 4 },
    profileAvatarContainer: { alignItems: 'center', marginBottom: 24 },
    profileAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    profileAvatarText: { color: '#ffffff', fontSize: 36, fontWeight: 'bold' },
    gymSyncId: { color: t.subtext, fontSize: 13, marginBottom: 6 },
    changePfpText: { color: t.accentLight, fontSize: 14 },
    profileCard: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: t.border },
    profileLabel: { color: t.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    profileValue: { color: t.subtext, fontSize: 13 },
    profileInputFull: { color: t.text, fontSize: 15, backgroundColor: t.inputBg, borderRadius: 8, padding: 10, marginTop: 4, borderWidth: 0.5, borderColor: t.border },
    splitGrid: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: t.border },
    splitLabel: { color: t.subtext, fontSize: 13, marginBottom: 12 },
    splitOption: { padding: 12, borderRadius: 8, borderWidth: 0.5, borderColor: t.border, marginBottom: 8 },
    splitOptionActive: { borderColor: t.accent, backgroundColor: t.accent + '22' },
    splitOptionText: { color: t.subtext, fontSize: 14 },
    splitOptionTextActive: { color: t.accentLight, fontWeight: 'bold' },
    editButton: { backgroundColor: t.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
    editButtonDisabled: { opacity: 0.6 },
    editButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    cancelButton: { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 },
    cancelButtonText: { color: t.subtext, fontSize: 15 },
    logoutButton: { borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 0.5, borderColor: t.border, marginTop: 8 },
    logoutButtonText: { color: '#e63946', fontSize: 16, fontWeight: 'bold' },
  });
}
