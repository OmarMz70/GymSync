import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';

const WorkoutContext = createContext(null);

function formatTime(date) {
  if (!date) return 'Just now';
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function WorkoutProvider({ children }) {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    let unsubscribeFirestore = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeFirestore();
      if (!user) { setFeed([]); return; }

      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribeFirestore = onSnapshot(q, (snap) => {
        setFeed(snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          time: formatTime(d.data().createdAt?.toDate()),
        })));
      });
    });

    return () => { unsubscribeAuth(); unsubscribeFirestore(); };
  }, []);

  const addPost = ({ name, workout, exercises }) =>
    addDoc(collection(db, 'posts'), {
      name,
      workout,
      exercises,
      createdAt: serverTimestamp(),
    });

  return (
    <WorkoutContext.Provider value={{ feed, addPost }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  return useContext(WorkoutContext);
}
