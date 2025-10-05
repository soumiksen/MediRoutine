'use client';

import { useState } from 'react';
import Input from '../../components/Input.jsx';
import Button from '../../components/largebutton.jsx';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      console.log('Sign up submitted:', formData);
    } else {
      console.log('Sign in submitted:', {
        email: formData.email,
        password: formData.password,
      });
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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

            {!isSignUp && (
              <div className='flex justify-end mb-6'>
                <a
                  href='#'
                  className='text-sm hover:underline'
                  style={{ color: '#3AAFA9' }}
                >
                  Forgot password?
                </a>
              </div>
            )}

            <div className='mt-6'>
              <Button type='button' variant='primary' onClick={handleSubmit}>
                {isSignUp ? 'Create Account' : 'Sign In'}
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
