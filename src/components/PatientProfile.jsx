'use client';
import { useState } from 'react';
import Button from './button';

const PatientProfile = ({ patient, onClose, onEdit, routines }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!patient) return null;

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const patientRoutines =
    routines?.filter(
      (routine) =>
        routine.patientId.toString() === patient.id.toString() && routine.active
    ) || [];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'medical', name: 'Medical Info', icon: '🏥' },
    { id: 'contact', name: 'Contact & Insurance', icon: '📞' },
    { id: 'routines', name: 'Routines', icon: '📋' },
  ];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b bg-gray-50'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                {patient.name}
              </h1>
              <div className='flex items-center gap-4 mt-2'>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    patient.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.status}
                </span>
                <span className='text-gray-600'>Patient ID: {patient.id}</span>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button onClick={() => onEdit(patient)}>Edit Profile</Button>
              <button
                onClick={onClose}
                className='text-2xl text-gray-600 hover:text-gray-900'
              >
                ×
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Basic Info */}
                <div className='bg-blue-50 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                    Basic Information
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Age:</span>
                      <span className='font-medium'>
                        {calculateAge(patient.dateOfBirth)} years old
                      </span>
                    </div>
                    {patient.dateOfBirth && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Date of Birth:</span>
                        <span className='font-medium'>
                          {new Date(patient.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {patient.gender && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Gender:</span>
                        <span className='font-medium capitalize'>
                          {patient.gender}
                        </span>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Language:</span>
                      <span className='font-medium'>
                        {patient.preferredLanguage || 'English'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className='bg-green-50 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                    Quick Stats
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Active Routines:</span>
                      <span className='font-medium'>
                        {patientRoutines.length}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Patient Since:</span>
                      <span className='font-medium'>
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Last Updated:</span>
                      <span className='font-medium'>
                        {new Date(patient.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                  Recent Activity
                </h3>
                <div className='space-y-2'>
                  <div className='flex items-center text-sm text-gray-600'>
                    <span className='w-2 h-2 bg-green-400 rounded-full mr-3'></span>
                    Profile created on{' '}
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                  {patient.updatedAt !== patient.createdAt && (
                    <div className='flex items-center text-sm text-gray-600'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-3'></span>
                      Profile updated on{' '}
                      {new Date(patient.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                  {patientRoutines.length > 0 && (
                    <div className='flex items-center text-sm text-gray-600'>
                      <span className='w-2 h-2 bg-purple-400 rounded-full mr-3'></span>
                      {patientRoutines.length} active routine
                      {patientRoutines.length !== 1 ? 's' : ''} assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className='bg-yellow-50 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                  Quick Actions
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  <button className='p-3 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors text-center'>
                    <div className='text-2xl mb-1'>📋</div>
                    <div className='text-sm font-medium text-gray-700'>
                      Create Routine
                    </div>
                  </button>
                  <button className='p-3 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors text-center'>
                    <div className='text-2xl mb-1'>💊</div>
                    <div className='text-sm font-medium text-gray-700'>
                      Add Medication
                    </div>
                  </button>
                  <button className='p-3 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors text-center'>
                    <div className='text-2xl mb-1'>📅</div>
                    <div className='text-sm font-medium text-gray-700'>
                      Schedule Appointment
                    </div>
                  </button>
                  <button className='p-3 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors text-center'>
                    <div className='text-2xl mb-1'>📝</div>
                    <div className='text-sm font-medium text-gray-700'>
                      Add Notes
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Medical Info Tab */}
          {activeTab === 'medical' && (
            <div className='space-y-6'>
              {/* Allergies */}
              <div className='border rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                  ⚠️ Allergies
                </h3>
                {patient.allergies ? (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-red-800'>{patient.allergies}</p>
                  </div>
                ) : (
                  <p className='text-gray-500 italic'>
                    No known allergies reported
                  </p>
                )}
              </div>

              {/* Medical History */}
              <div className='border rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                  🏥 Medical History
                </h3>
                {patient.medicalHistory ? (
                  <div className='bg-gray-50 rounded-lg p-3'>
                    <p className='text-gray-800 whitespace-pre-wrap'>
                      {patient.medicalHistory}
                    </p>
                  </div>
                ) : (
                  <p className='text-gray-500 italic'>
                    No medical history provided
                  </p>
                )}
              </div>

              {/* Current Medications */}
              <div className='border rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                  💊 Current Medications
                </h3>
                {patient.currentMedications ? (
                  <div className='bg-blue-50 rounded-lg p-3'>
                    <p className='text-blue-800 whitespace-pre-wrap'>
                      {patient.currentMedications}
                    </p>
                  </div>
                ) : (
                  <p className='text-gray-500 italic'>
                    No current medications listed
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              {patient.notes && (
                <div className='border rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                    📝 Additional Notes
                  </h3>
                  <div className='bg-yellow-50 rounded-lg p-3'>
                    <p className='text-yellow-800 whitespace-pre-wrap'>
                      {patient.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact & Insurance Tab */}
          {activeTab === 'contact' && (
            <div className='space-y-6'>
              {/* Contact Information */}
              <div className='border rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                  📞 Contact Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>
                      Email
                    </label>
                    <p className='text-gray-800'>{patient.email}</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>
                      Phone
                    </label>
                    <p className='text-gray-800'>{patient.phone}</p>
                  </div>
                </div>
                {patient.address && (
                  <div className='mt-4'>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>
                      Address
                    </label>
                    <p className='text-gray-800 whitespace-pre-wrap'>
                      {patient.address}
                    </p>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className='border rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                  🚨 Emergency Contact
                </h3>
                {patient.emergencyContact.name ? (
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>
                        Name
                      </label>
                      <p className='text-gray-800'>
                        {patient.emergencyContact.name}
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>
                        Phone
                      </label>
                      <p className='text-gray-800'>
                        {patient.emergencyContact.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>
                        Relationship
                      </label>
                      <p className='text-gray-800 capitalize'>
                        {patient.emergencyContact.relationship || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className='text-gray-500 italic'>
                    No emergency contact provided
                  </p>
                )}
              </div>

              {/* Insurance Information */}
              <div className='border rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3 flex items-center'>
                  🛡️ Insurance Information
                </h3>
                {patient?.insurance?.provider ? (
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>
                        Provider
                      </label>
                      <p className='text-gray-800'>
                        {patient.insurance.provider}
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>
                        Policy Number
                      </label>
                      <p className='text-gray-800 font-mono'>
                        {patient.insurance.policyNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-600 mb-1'>
                        Group Number
                      </label>
                      <p className='text-gray-800 font-mono'>
                        {patient.insurance.groupNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className='text-gray-500 italic'>
                    No insurance information provided
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Routines Tab */}
          {activeTab === 'routines' && (
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Active Routines ({patientRoutines.length})
                </h3>
                <Button>Create New Routine</Button>
              </div>

              {patientRoutines.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500 text-lg'>No active routines</p>
                  <p className='text-gray-400'>
                    Create a routine to get started
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {patientRoutines.map((routine) => (
                    <div
                      key={routine.id}
                      className='border rounded-lg p-4 hover:bg-gray-50'
                    >
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <h4 className='font-semibold text-gray-800'>
                            {routine.name}
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Type: {routine.type} | Created:{' '}
                            {new Date(routine.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          <button className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200'>
                            Edit
                          </button>
                          <button className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200'>
                            Deactivate
                          </button>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <h5 className='font-medium text-gray-700'>
                          Routine Items ({routine.items.length})
                        </h5>
                        {routine.items.map((item) => (
                          <div
                            key={item.id}
                            className='bg-gray-50 rounded p-3 text-sm'
                          >
                            <div className='font-medium text-gray-800'>
                              {item.name}
                            </div>
                            {item.dosage && (
                              <div className='text-gray-600'>
                                Dosage: {item.dosage}
                              </div>
                            )}
                            <div className='text-gray-600'>
                              Times:{' '}
                              {item.timeSlots.filter((time) => time).join(', ')}
                            </div>
                            {item.instructions && (
                              <div className='text-gray-600 italic'>
                                "{item.instructions}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
