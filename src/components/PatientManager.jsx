'use client';
import { useState } from 'react';

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
      {/* Patient List */}
      <div className=' rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-semibold'>
            Patients ({filteredPatients.length})
          </h3>
        </div>

        {filteredPatients.length === 0 ? (
          <div className='text-center py-8'>
            <p>No patients found</p>
            <p>Add your first patient to get started</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className='p-4 hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start mb-3'>
                  <h4 className='font-semibold'>
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

                <div className='space-y-2 text-sm'>
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
                    <span> {patient.allergies}</span>
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

                <p className='text-xs  mt-2'>
                  Added: {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientManager;
