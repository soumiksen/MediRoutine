'use client';

import { useAuth } from '@/context/auth';
import { signIn, signUp } from '@/lib/authService.js';
import { db } from '@/lib/firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Input from '../../components/Input.jsx';
import Button from '../../components/button.jsx';

const AuthPage = () => {
  const { user, isProvider, isPatient, loading } = useAuth();
  if (!loading && user) {
    if (isProvider) return redirect('/providerdashboard');
    if (isPatient) return redirect('/dashboard');
  }
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'provider',
    caregiverEmail: '',
  });
  const [caregiverVerifying, setCaregiverVerifying] = useState(false);
  const [caregiverValid, setCaregiverValid] = useState(null);
  const [caregiverName, setCaregiverName] = useState('');
  const [errors, setErrors] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  // Function to verify caregiver exists
  const verifyCaregiver = async (email) => {
    if (!email) {
      setCaregiverValid(null);
      setCaregiverName('');
      return;
    }

    setCaregiverVerifying(true);
    try {
      console.log('Searching for caregiver with email:', email.toLowerCase());

      // Try multiple possible collection paths (simple path first)
      const pathsToTry = [
        'providers',
        '/artifacts/remedyrx/public/data/providers',
      ];

      let found = false;

      for (const path of pathsToTry) {
        console.log('Trying collection path:', path);

        const providersRef = collection(db, path);
        const q = query(
          providersRef,
          where('email', '==', email.toLowerCase())
        );
        const querySnapshot = await getDocs(q);

        console.log(
          `Query result for path ${path} - docs found:`,
          querySnapshot.docs.length
        );

        if (!querySnapshot.empty) {
          const providerDoc = querySnapshot.docs[0];
          const providerData = providerDoc.data();
          console.log('Found provider:', providerData);
          setCaregiverValid(true);
          setCaregiverName(providerData.name || 'Provider');
          found = true;
          break;
        } else {
          // Debug: list all docs in this collection
          const allProvidersSnapshot = await getDocs(providersRef);
          console.log(`All providers in collection ${path}:`);
          allProvidersSnapshot.docs.forEach((doc) => {
            console.log('Provider doc:', doc.id, doc.data());
          });
        }
      }

      if (!found) {
        console.log('No provider found with email:', email.toLowerCase());
        setCaregiverValid(false);
        setCaregiverName('');
      }
    } catch (error) {
      console.error('Error verifying caregiver:', error);
      setCaregiverValid(false);
      setCaregiverName('');
    } finally {
      setCaregiverVerifying(false);
    }
  };

  // Debounced caregiver verification
  useEffect(() => {
    if (formData.caregiverEmail && formData.role === 'patient' && isSignUp) {
      const timeoutId = setTimeout(() => {
        verifyCaregiver(formData.caregiverEmail);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setCaregiverValid(null);
      setCaregiverName('');
    }
  }, [formData.caregiverEmail, formData.role, isSignUp]);

  const handleSubmit = async () => {
    setAuthLoading(true);
    setErrors([]);

    try {
      if (isSignUp) {
        // Validate caregiver for patient signup
        if (formData.role === 'patient') {
          if (!formData.caregiverEmail) {
            setErrors(["Please enter your caregiver's email address."]);
            setAuthLoading(false);
            return;
          }
          if (caregiverValid !== true) {
            setErrors(['Please enter a valid caregiver email address.']);
            setAuthLoading(false);
            return;
          }
        }

        const result = await signUp(
          formData.name,
          formData.email,
          formData.password,
          formData.role,
          formData.caregiverEmail
        );

        if (formData.role === 'provider') {
          router.push('/providerdashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        const result = await signIn(formData.email, formData.password);
        // Determine redirect based on user role after signin
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error.message || 'Authentication failed';
      setErrors([errorMessage]);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      caregiverEmail: '',
    });
    setCaregiverValid(null);
    setCaregiverName('');
  };

  return (
    <div
      className='min-h-screen flex p-4 justify-center'
      style={{ backgroundColor: 'var(--color-remedy-primary)' }}
    >
      <div className='w-full max-w-md' style={{ marginTop: '10vh' }}>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-2' style={{ color: '#3AAFA9' }}>
            RemedyRX
          </h1>
          <p style={{ color: '#555555' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div
          className='rounded-2xl p-8'
          style={{
            backgroundColor: 'var(--color-remedy-primary)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Toggle Tabs */}
          <div
            className='flex mb-8 p-1 rounded-full'
            style={{
              backgroundColor: 'rgba(85, 85, 85, 0.2)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <button
              onClick={() => setIsSignUp(false)}
              className='flex-1 py-2 rounded-full transition-all duration-200 font-medium'
              style={{
                backgroundColor: !isSignUp ? '#3AAFA9' : 'transparent',
                color: !isSignUp ? 'white' : '#555555',
                boxShadow: !isSignUp
                  ? '0 2px 8px rgba(58, 175, 169, 0.4)'
                  : 'none',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className='flex-1 py-2 rounded-full transition-all duration-200 font-medium'
              style={{
                backgroundColor: isSignUp ? '#3AAFA9' : 'transparent',
                color: isSignUp ? 'white' : '#555555',
                boxShadow: isSignUp
                  ? '0 2px 8px rgba(58, 175, 169, 0.4)'
                  : 'none',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-red-500'>❌</span>
                <h3 className='font-medium text-red-800'>
                  Authentication Errors
                </h3>
              </div>
              <ul className='list-disc pl-6 text-red-700 text-sm'>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form */}
          <div>
            {isSignUp && (
              <Input
                label='Full Name'
                type='text'
                placeholder='John Doe'
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            )}

            <Input
              label='Email'
              type='email'
              placeholder='you@example.com'
              value={formData.email}
              onChange={handleInputChange('email')}
              required
            />

            <Input
              label='Password'
              type='password'
              placeholder='••••••••'
              value={formData.password}
              onChange={handleInputChange('password')}
              required
            />

            {isSignUp && (
              <Input
                label='Confirm Password'
                type='password'
                placeholder='••••••••'
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
              />
            )}

            {isSignUp && (
              <div className='mt-4'>
                <label className='block text-sm mb-1'>Role</label>
                <select
                  className='w-full border rounded px-3 py-2'
                  value={formData.role}
                  onChange={handleInputChange('role')}
                >
                  <option value='patient'>Patient</option>
                  <option value='provider'>Provider</option>
                </select>
              </div>
            )}
            {formData.role === 'patient' &&
              isSignUp &&
              formData.role === 'patient' && (
                <div className='mt-4'>
                  <Input
                    label="Caregiver's Email"
                    type='email'
                    placeholder='caregiver@example.com'
                    value={formData.caregiverEmail}
                    onChange={handleInputChange('caregiverEmail')}
                    required
                  />
                  {caregiverVerifying && (
                    <p className='text-sm text-gray-500 mt-1'>
                      <span className='inline-block animate-spin rounded-full h-3 w-3 border-b border-gray-500 mr-2'></span>
                      Verifying caregiver...
                    </p>
                  )}
                  {caregiverValid === true && (
                    <p className='text-sm text-green-600 mt-1'>
                      ✓ Caregiver found: {caregiverName}
                    </p>
                  )}
                  {caregiverValid === false && (
                    <p className='text-sm text-red-600 mt-1'>
                      ✗ Caregiver not found. Please check the email address.
                    </p>
                  )}
                </div>
              )}

            <div className='mt-6'>
              <Button
                type='button'
                variant='primary'
                onClick={handleSubmit}
                disabled={
                  authLoading ||
                  (isSignUp &&
                    formData.role === 'patient' &&
                    caregiverVerifying)
                }
              >
                {authLoading
                  ? 'Processing...'
                  : isSignUp
                  ? 'Create Account'
                  : 'Sign In'}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className='flex items-center my-6'>
            <div
              className='flex-1 h-px'
              style={{ backgroundColor: '#555555', opacity: 0.3 }}
            ></div>
            <span className='px-4 text-sm' style={{ color: '#555555' }}>
              or
            </span>
            <div
              className='flex-1 h-px'
              style={{ backgroundColor: '#555555', opacity: 0.3 }}
            ></div>
          </div>

          {/* Social Login */}
          <button
            className='w-full py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-80'
            style={{
              backgroundColor: 'var(--color-remedy-primary)',
              color: 'var(--color-remedy-secondary)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            Continue with Google
          </button>

          {/* Toggle Link */}
          <p className='text-center mt-6 text-sm' style={{ color: '#555555' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type='button'
              onClick={toggleMode}
              className='font-semibold hover:underline'
              style={{ color: '#3AAFA9' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className='text-center mt-6 text-xs' style={{ color: '#555555' }}>
          By continuing, you agree to Remedy's Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
