import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import COLORS from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (isSignUp) {
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const gymSyncId = Math.floor(10000 + Math.random() * 90000);
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          gym: '',
          split: 'PPL',
          uid: user.uid,
          gymSyncId,
          createdAt: new Date(),
        });
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      try {
        setLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>GymSync</Text>
      <Text style={styles.tagline}>Train together. Stay accountable.</Text>

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#4a5a8a"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#4a5a8a"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#4a5a8a"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#4a5a8a"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.secondaryButtonText}>
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.darkBg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 42, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  tagline: { fontSize: 14, color: COLORS.darkSubtext, marginBottom: 48 },
  input: { width: '100%', backgroundColor: COLORS.darkCard, borderRadius: 10, padding: 16, color: COLORS.text, marginBottom: 12, fontSize: 16, borderWidth: 0.5, borderColor: COLORS.darkBorder },
  button: { width: '100%', backgroundColor: COLORS.accent, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { marginTop: 16 },
  secondaryButtonText: { color: COLORS.darkSubtext, fontSize: 14 },
});