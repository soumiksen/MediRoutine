'use client';
import { useState } from 'react';
import Input from '../../components/Input.jsx';
import Button from '../../components/largebutton.jsx';

const PatientProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Arlington, TX 76010',
    dateOfBirth: '1990-01-15',
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceNumber: 'BCBS123456789',
  });

  const handleInputChange = (field) => (e) => {
    setProfileData({ ...profileData, [field]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile updated:', profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div
      className='min-h-screen p-4'
      style={{ backgroundColor: 'var(--color-remedy-primary)' }}
    >
      {/* Main Content */}
      <div className='max-w-4xl mx-auto pt-8'>
        {/* Profile Header */}
        <div className='text-center mb-8'>
          <div className='inline-block mb-4'>
            <div
              className='w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white'
              style={{
                backgroundColor: '#3AAFA9',
                boxShadow: '0 8px 20px rgba(58, 175, 169, 0.3)',
              }}
            >
              {profileData.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          </div>
          <h2
            className='text-3xl font-bold mb-2'
            style={{ color: 'var(--color-remedy-secondary)' }}
          >
            {profileData.name}
          </h2>
          <p style={{ color: '#555555' }}>Patient Profile</p>
        </div>

        {/* Profile Information Card */}
        <div
          className='rounded-2xl p-8 mb-6'
          style={{
            backgroundColor: 'var(--color-remedy-primary)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Section Header */}
          <div className='flex justify-between items-center mb-6'>
            <h3
              className='text-2xl font-semibold'
              style={{ color: 'var(--color-remedy-secondary)' }}
            >
              Personal Information
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className='px-4 py-2 rounded-full font-medium transition-all duration-200'
                style={{
                  color: '#3AAFA9',
                  backgroundColor: 'rgba(58, 175, 169, 0.1)',
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Full Name'
              value={profileData.name}
              onChange={handleInputChange('name')}
              disabled={!isEditing}
            />
            <Input
              label='Email'
              type='email'
              value={profileData.email}
              onChange={handleInputChange('email')}
              disabled={!isEditing}
            />
            <Input
              label='Phone Number'
              type='tel'
              value={profileData.phone}
              onChange={handleInputChange('phone')}
              disabled={!isEditing}
            />
            <Input
              label='Date of Birth'
              type='date'
              value={profileData.dateOfBirth}
              onChange={handleInputChange('dateOfBirth')}
              disabled={!isEditing}
            />
          </div>

          <div className='mt-4'>
            <Input
              label='Address'
              value={profileData.address}
              onChange={handleInputChange('address')}
              disabled={!isEditing}
            />
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className='flex gap-4 mt-6'>
              <Button onClick={handleSave}>Save Changes</Button>
              <button
                onClick={handleCancel}
                className='px-4 py-2 rounded-full font-medium transition-all duration-200'
                style={{
                  color: '#555555',
                  backgroundColor: 'rgba(85, 85, 85, 0.1)',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Insurance Information Card */}
        <div
          className='rounded-2xl p-8 mb-6'
          style={{
            backgroundColor: 'var(--color-remedy-primary)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          <h3
            className='text-2xl font-semibold mb-6'
            style={{ color: 'var(--color-remedy-secondary)' }}
          >
            Insurance Information
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Insurance Provider'
              value={profileData.insuranceProvider}
              onChange={handleInputChange('insuranceProvider')}
              disabled={!isEditing}
            />
            <Input
              label='Insurance Number'
              value={profileData.insuranceNumber}
              onChange={handleInputChange('insuranceNumber')}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className='rounded-2xl p-8'
          style={{
            backgroundColor: 'var(--color-remedy-primary)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          <h3
            className='text-2xl font-semibold mb-6'
            style={{ color: 'var(--color-remedy-secondary)' }}
          >
            Account Settings
          </h3>

          <div className='space-y-4'>
            <button
              className='w-full text-left px-4 py-3 rounded-lg transition-all duration-200'
              style={{
                backgroundColor: 'rgba(58, 175, 169, 0.1)',
                color: 'var(--color-remedy-secondary)',
              }}
            >
              Change Password
            </button>
            <button
              className='w-full text-left px-4 py-3 rounded-lg transition-all duration-200'
              style={{
                backgroundColor: 'rgba(58, 175, 169, 0.1)',
                color: 'var(--color-remedy-secondary)',
              }}
            >
              Notification Settings
            </button>
            <button
              className='w-full text-left px-4 py-3 rounded-lg transition-all duration-200'
              style={{
                backgroundColor: 'rgba(196, 69, 54, 0.1)',
                color: '#C44536',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfilePage;
