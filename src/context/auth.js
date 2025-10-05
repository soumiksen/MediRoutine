// contexts/AuthContext.tsx
'use client';

import { auth, db } from '@/lib/firebase';
import { signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  user: null,
  userData: null,
  isProvider: false,
  isPatient: false,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const basePath = useMemo(() => {
    const appId =
      process.env.NEXT_PUBLIC_APP_ID || globalThis.__app_id || 'remedyrx';
    return `/artifacts/${appId}/public/data`;
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      if (!u) {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(db, `${basePath}/users/${user.uid}`);
    const unsub = onSnapshot(ref, (snap) => {
      setUserData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [db, basePath, user]);

  const signOut = async () => {
    try {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('displayName');
        localStorage.clear();
      }

      // Clear state immediately
      setUser(null);
      setUserData(null);
      setLoading(false);

      // Sign out from Firebase
      await firebaseSignOut(auth);

      return true;
    } catch (error) {
      console.error('Sign out error:', error);

      // Clear state even on error
      setUser(null);
      setUserData(null);
      setLoading(false);

      // Clear localStorage on error too
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }

      return false;
    }
  };

  const value = {
    user,
    userData,
    isProvider: userData?.role === 'care_provider',
    isPatient: userData?.role === 'patient',
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
