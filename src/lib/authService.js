// authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export const signUp = async (
  name,
  email,
  password,
  role = 'patient',
  caregiverEmail = null
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the display name
    await updateProfile(userCredential.user, { displayName: name });
    try {
      if (typeof window !== 'undefined')
        localStorage.setItem('displayName', name || '');
    } catch (_) {}

    // Create role-based record in Firestore under /artifacts/{appId}/public/data
    const appId =
      process.env.NEXT_PUBLIC_APP_ID || globalThis.__app_id || 'remedyrx';
    const base = `/artifacts/${appId}/public/data`;
    const uid = userCredential.user.uid;

    // Always create in users collection with role
    await setDoc(
      doc(db, `${base}/users/${uid}`),
      {
        role: role === 'provider' ? 'care_provider' : 'patient',
        name: name || '',
        email: email.toLowerCase(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Create role-specific collection doc stub
    if (role === 'provider') {
      // Store in both places for compatibility
      await setDoc(
        doc(db, `${base}/providers/${uid}`),
        {
          name: name || '',
          email: email.toLowerCase(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Also store in simple path for easy lookup
      await setDoc(
        doc(db, `providers/${uid}`),
        {
          name: name || '',
          email: email.toLowerCase(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } else {
      // Patient role - find caregiver and add to their patients collection
      if (caregiverEmail) {
        console.log('🔍 Looking for caregiver with email:', caregiverEmail.toLowerCase());
        
        // Find the caregiver provider (use simple path)
        const providersRef = collection(db, 'providers');
        const q = query(
          providersRef,
          where('email', '==', caregiverEmail.toLowerCase())
        );
        const querySnapshot = await getDocs(q);

        console.log('📋 Caregiver query results:', querySnapshot.docs.length, 'providers found');

        if (!querySnapshot.empty) {
          const providerDoc = querySnapshot.docs[0];
          const caregiverId = providerDoc.id;
          
          console.log('✅ Found caregiver:', caregiverId, providerDoc.data());
          console.log('📁 Adding patient to collection: providers/' + caregiverId + '/patients');

          // Add patient to caregiver's patients collection
          const patientData = {
            patientId: uid,
            name: name || '',
            email: email.toLowerCase(),
            dateOfBirth: '',
            phone: '',
            address: '',
            emergencyContact: '',
            medicalHistory: '',
            allergies: '',
            currentMedications: '',
            insuranceInfo: '',
            addedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(), // Add both for compatibility
            caregiverId: caregiverId,
          };

          console.log('💾 Patient data to save:', patientData);
          
          try {
            const docRef = await addDoc(collection(db, `providers/${caregiverId}/patients`), patientData);
            console.log('✅ Patient added successfully with ID:', docRef.id);
          } catch (addError) {
            console.error('❌ Error adding patient to provider collection:', addError);
            throw new Error('Failed to add patient to caregiver dashboard: ' + addError.message);
          }

          // Also create patient record with caregiver reference
          try {
            await setDoc(
              doc(db, `${base}/patients/${uid}`),
              {
                name: name || '',
                email: email.toLowerCase(),
                caregiverId: caregiverId,
                caregiverEmail: caregiverEmail.toLowerCase(),
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
            console.log('✅ Patient profile created successfully');
          } catch (profileError) {
            console.error('❌ Error creating patient profile:', profileError);
            // Don't throw here as the main registration succeeded
          }
        } else {
          console.log('❌ No caregiver found for email:', caregiverEmail);
          throw new Error('Caregiver not found');
        }
      } else {
        // Patient without caregiver (shouldn't happen with new flow)
        await setDoc(
          doc(db, `${base}/patients/${uid}`),
          {
            name: name || '',
            email: email.toLowerCase(),
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
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
