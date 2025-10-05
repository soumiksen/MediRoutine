// authService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const signUp = async (name, email, password, role = 'patient') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the display name
    await updateProfile(userCredential.user, { displayName: name });
    try { if (typeof window !== 'undefined') localStorage.setItem('displayName', name || ''); } catch (_) {}

    // Create role-based record in Firestore under /artifacts/{appId}/public/data
    const appId = process.env.NEXT_PUBLIC_APP_ID || globalThis.__app_id || 'remedyrx';
    const base = `/artifacts/${appId}/public/data`;
    const uid = userCredential.user.uid;

    // Always create in users collection with role
    await setDoc(doc(db, `${base}/users/${uid}`), {
      role: role === 'provider' ? 'care_provider' : 'patient',
      name: name || '',
      createdAt: new Date().toISOString(),
    }, { merge: true });

    // Create role-specific collection doc stub
    if (role === 'provider') {
      await setDoc(doc(db, `${base}/providers/${uid}`), {
        name: name || '',
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      await setDoc(doc(db, `${base}/patients/${uid}`), {
        name: name || '',
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }

    return { user: userCredential.user };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} - Returns the user object
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};
