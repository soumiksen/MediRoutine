'use client';
import { useState } from 'react';
import Button from './button';

const PatientManager = ({
  patients,
  onPatientAdd,
  onPatientUpdate,
  onPatientDelete,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    insurance: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    },
    preferredLanguage: 'English',
    notes: '',
  });

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const relationshipOptions = [
    { value: '', label: 'Select Relationship' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' },
  ];

  const resetForm = () => {
    setPatientForm({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
      insurance: {
        provider: '',
        policyNumber: '',
        groupNumber: '',
      },
      preferredLanguage: 'English',
      notes: '',
    });
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPatientForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setPatientForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientForm.name || !patientForm.email || !patientForm.phone) {
      alert('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    setIsSubmitting(true);

    try {
      const patientData = {
        ...patientForm,
        // Keep ID for updates, remove for new patients (Firestore will generate)
        ...(editingPatient && { id: editingPatient.id }),
        // Keep creation date for updates
        ...(editingPatient && { createdAt: editingPatient.createdAt }),
      };

      if (editingPatient) {
        await onPatientUpdate(patientData);
      } else {
        await onPatientAdd(patientData);
      }

      resetForm();
      setShowAddForm(false);
      setEditingPatient(null);
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (patient) => {
    setPatientForm(patient);
    setEditingPatient(patient);
    setShowAddForm(true);
  };

  const handleDelete = async (patientId) => {
    if (
      confirm(
        'Are you sure you want to delete this patient? This action cannot be undone.'
      )
    ) {
      setDeletingId(patientId);
      try {
        await onPatientDelete(patientId);
      } catch (error) {
        console.error('Error deleting patient:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

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

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-gray-800'>
            Patient Management
          </h2>
          <Button onClick={() => setShowAddForm(true)}>
            + Add New Patient
          </Button>
        </div>

        {/* Search */}
        <div className='max-w-md'>
          <input
            type='text'
            placeholder='Search patients by name, email, or phone...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Patient List */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-semibold text-gray-800'>
            Patients ({filteredPatients.length})
          </h3>
        </div>

        {filteredPatients.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-gray-500 text-lg'>No patients found</p>
            <p className='text-gray-400'>
              Add your first patient to get started
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start mb-3'>
                  <h4 className='font-semibold text-gray-800'>
                    {patient.name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div className='space-y-2 text-sm text-gray-600'>
                  <p>📧 {patient.email}</p>
                  <p>📞 {patient.phone}</p>
                  {patient.dateOfBirth && (
                    <p>🎂 Age: {calculateAge(patient.dateOfBirth)}</p>
                  )}
                  {patient.gender && (
                    <p>
                      👤{' '}
                      {patient.gender.charAt(0).toUpperCase() +
                        patient.gender.slice(1)}
                    </p>
                  )}
                </div>

                {patient.allergies && (
                  <div className='mt-3 p-2 bg-red-50 rounded text-xs'>
                    <span className='font-medium text-red-800'>
                      ⚠️ Allergies:
                    </span>
                    <span className='text-red-700'> {patient.allergies}</span>
                  </div>
                )}

                <div className='mt-4 flex gap-2'>
                  <button
                    onClick={() => handleEdit(patient)}
                    className='flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    disabled={deletingId === patient.id}
                    className='px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50'
                  >
                    {deletingId === patient.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

                <p className='text-xs text-gray-400 mt-2'>
                  Added: {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Patient Modal */}
      {showAddForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>
                  {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPatient(null);
                    resetForm();
                  }}
                  className='text-2xl text-gray-600 hover:text-gray-900'
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Basic Information */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Basic Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Full Name *
                      </label>
                      <input
                        type='text'
                        required
                        value={patientForm.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Email *
                      </label>
                      <input
                        type='email'
                        required
                        value={patientForm.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Phone Number *
                      </label>
                      <input
                        type='tel'
                        required
                        value={patientForm.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Date of Birth
                      </label>
                      <input
                        type='date'
                        value={patientForm.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange('dateOfBirth', e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Gender
                      </label>
                      <select
                        value={patientForm.gender}
                        onChange={(e) =>
                          handleInputChange('gender', e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      >
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Preferred Language
                      </label>
                      <input
                        type='text'
                        value={patientForm.preferredLanguage}
                        onChange={(e) =>
                          handleInputChange('preferredLanguage', e.target.value)
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>

                  <div className='mt-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Address
                    </label>
                    <textarea
                      value={patientForm.address}
                      onChange={(e) =>
                        handleInputChange('address', e.target.value)
                      }
                      rows='2'
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Emergency Contact
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Contact Name
                      </label>
                      <input
                        type='text'
                        value={patientForm.emergencyContact.name}
                        onChange={(e) =>
                          handleInputChange(
                            'emergencyContact.name',
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Contact Phone
                      </label>
                      <input
                        type='tel'
                        value={patientForm.emergencyContact.phone}
                        onChange={(e) =>
                          handleInputChange(
                            'emergencyContact.phone',
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Relationship
                      </label>
                      <select
                        value={patientForm.emergencyContact.relationship}
                        onChange={(e) =>
                          handleInputChange(
                            'emergencyContact.relationship',
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      >
                        {relationshipOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Medical Information
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Medical History
                      </label>
                      <textarea
                        value={patientForm.medicalHistory}
                        onChange={(e) =>
                          handleInputChange('medicalHistory', e.target.value)
                        }
                        rows='3'
                        placeholder='Previous surgeries, chronic conditions, etc.'
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Allergies
                      </label>
                      <textarea
                        value={patientForm.allergies}
                        onChange={(e) =>
                          handleInputChange('allergies', e.target.value)
                        }
                        rows='2'
                        placeholder='Drug allergies, food allergies, etc.'
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Current Medications
                      </label>
                      <textarea
                        value={patientForm.currentMedications}
                        onChange={(e) =>
                          handleInputChange(
                            'currentMedications',
                            e.target.value
                          )
                        }
                        rows='3'
                        placeholder='List current medications, dosages, and frequencies'
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Insurance Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Insurance Provider
                      </label>
                      <input
                        type='text'
                        value={patientForm.insurance.provider}
                        onChange={(e) =>
                          handleInputChange(
                            'insurance.provider',
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Policy Number
                      </label>
                      <input
                        type='text'
                        value={patientForm.insurance.policyNumber}
                        onChange={(e) =>
                          handleInputChange(
                            'insurance.policyNumber',
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Group Number
                      </label>
                      <input
                        type='text'
                        value={patientForm.insurance.groupNumber}
                        onChange={(e) =>
                          handleInputChange(
                            'insurance.groupNumber',
                            e.target.value
                          )
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Additional Notes
                  </h3>
                  <textarea
                    value={patientForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows='3'
                    placeholder='Any additional notes about the patient...'
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                {/* Form Actions */}
                <div className='flex gap-4 pt-6 border-t'>
                  <Button
                    type='submit'
                    className='flex-1'
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? editingPatient
                        ? 'Updating...'
                        : 'Adding...'
                      : editingPatient
                      ? 'Update Patient'
                      : 'Add Patient'}
                  </Button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingPatient(null);
                      resetForm();
                    }}
                    className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManager;
