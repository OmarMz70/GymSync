import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Paste your Firebase project config here.
// Firebase console → Project settings → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC6XQezGcBqZgMsRBUCdj6lPgbRUzUh9iY',
  authDomain: 'gymsync-f8e2f.firebaseapp.com',
  projectId: 'gymsync-f8e2f',
  storageBucket: 'gymsync-f8e2f.firebasestorage.app',
  messagingSenderId: '1036875358803',
  appId: '1:1036875358803:web:0c5fa4fbb6f8cce2f7dca6',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
