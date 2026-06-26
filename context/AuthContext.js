import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => { clearTimeout(timeout); unsubscribe(); };
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUp = async (email, password, name) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    const gymSyncId = Math.floor(10000 + Math.random() * 90000);
    const profileData = { name, email, gym: '', split: 'PPL', gymSyncId };
    await setDoc(doc(db, 'users', newUser.uid), {
      ...profileData,
      createdAt: serverTimestamp(),
    });
    setProfile(profileData);
    return newUser;
  };

  const logout = () => signOut(auth);

  const updateProfile = async (data) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    setProfile(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signUp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
