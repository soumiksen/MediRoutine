'use client';
import { useState } from 'react';

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('patients');
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample patients data
  const [patients] = useState([
    {
      id: 1,
      name: 'Tanzid Rahman',
      age: 45,
      lastVisit: 'Oct 1, 2025',
      activeMeds: 4,
      conditions: ['Hypertension', 'Type 2 Diabetes'],
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      age: 62,
      lastVisit: 'Sept 28, 2025',
      activeMeds: 6,
      conditions: ['Heart Disease', 'High Cholesterol'],
    },
    {
      id: 3,
      name: 'Michael Chen',
      age: 58,
      lastVisit: 'Oct 3, 2025',
      activeMeds: 3,
      conditions: ['Arthritis'],
    },
  ]);

  // Sample prescriptions data
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientName: 'Tanzid Rahman',
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: 'Oct 1, 2025',
      duration: '90 days',
      refills: 3,
    },
    {
      id: 2,
      patientName: 'Sarah Johnson',
      medication: 'Atorvastatin',
      dosage: '40mg',
      frequency: 'Once daily',
      startDate: 'Sept 28, 2025',
      duration: '90 days',
      refills: 2,
    },
  ]);

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    startDate: '',
    duration: '30 days',
    refills: 0,
    instructions: '',
  });

  const handleAddPrescription = (e) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === parseInt(newPrescription.patientId));
    
    if (patient) {
      const prescription = {
        id: prescriptions.length + 1,
        patientName: patient.name,
        ...newPrescription,
      };
      
      setPrescriptions([prescription, ...prescriptions]);
      setShowAddPrescription(false);
      setNewPrescription({
        patientId: '',
        medication: '',
        dosage: '',
        frequency: 'Once daily',
        startDate: '',
        duration: '30 days',
        refills: 0,
        instructions: '',
      });
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>Care Provider Dashboard</h1>
          <p className='text-gray-600'>Manage patient prescriptions and medications</p>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-xl shadow-md p-6'>
            <div className='text-3xl font-bold text-indigo-600 mb-2'>{patients.length}</div>
            <div className='text-sm text-gray-600'>Total Patients</div>
          </div>
          <div className='bg-white rounded-xl shadow-md p-6'>
            <div className='text-3xl font-bold text-green-600 mb-2'>{prescriptions.length}</div>
            <div className='text-sm text-gray-600'>Active Prescriptions</div>
          </div>
          <div className='bg-white rounded-xl shadow-md p-6'>
            <div className='text-3xl font-bold text-purple-600 mb-2'>2</div>
            <div className='text-sm text-gray-600'>Pending Reviews</div>
          </div>
          <div className='bg-white rounded-xl shadow-md p-6'>
            <div className='text-3xl font-bold text-orange-600 mb-2'>5</div>
            <div className='text-sm text-gray-600'>Expiring Soon</div>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6'>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'patients'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'prescriptions'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Prescriptions
          </button>
        </div>

        {/* Main Content */}
        <div className='bg-white rounded-2xl shadow-lg p-6'>
          {activeTab === 'patients' && (
            <div>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Patient List</h2>
                <input
                  type='text'
                  placeholder='Search patients...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
              </div>

              <div className='space-y-4'>
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className='p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all cursor-pointer'
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                      <div className='flex-1'>
                        <h3 className='text-xl font-semibold text-gray-800'>{patient.name}</h3>
                        <div className='flex flex-wrap gap-2 mt-2'>
                          {patient.conditions.map((condition, idx) => (
                            <span
                              key={idx}
                              className='px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
                        <div>
                          <span className='font-medium'>Age:</span> {patient.age}
                        </div>
                        <div>
                          <span className='font-medium'>Active Meds:</span> {patient.activeMeds}
                        </div>
                        <div>
                          <span className='font-medium'>Last Visit:</span> {patient.lastVisit}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewPrescription({ ...newPrescription, patientId: patient.id.toString() });
                          setShowAddPrescription(true);
                        }}
                        className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
                      >
                        Add Prescription
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Recent Prescriptions</h2>
                <button
                  onClick={() => setShowAddPrescription(true)}
                  className='px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold'
                >
                  + New Prescription
                </button>
              </div>

              <div className='space-y-4'>
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className='p-5 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all'
                  >
                    <div className='flex flex-col lg:flex-row justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-xl font-semibold text-gray-800'>
                            {prescription.medication}
                          </h3>
                          <span className='px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium'>
                            Active
                          </span>
                        </div>
                        <p className='text-gray-600 mb-2'>
                          Patient: <span className='font-medium'>{prescription.patientName}</span>
                        </p>
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm'>
                          <div>
                            <span className='text-gray-500'>Dosage:</span>
                            <div className='font-medium'>{prescription.dosage}</div>
                          </div>
                          <div>
                            <span className='text-gray-500'>Frequency:</span>
                            <div className='font-medium'>{prescription.frequency}</div>
                          </div>
                          <div>
                            <span className='text-gray-500'>Duration:</span>
                            <div className='font-medium'>{prescription.duration}</div>
                          </div>
                          <div>
                            <span className='text-gray-500'>Refills:</span>
                            <div className='font-medium'>{prescription.refills}</div>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-col justify-center gap-2'>
                        <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm'>
                          Edit
                        </button>
                        <button className='px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm'>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Prescription Modal */}
      {showAddPrescription && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>New Prescription</h2>
                <button
                  onClick={() => setShowAddPrescription(false)}
                  className='text-gray-500 hover:text-gray-700 text-2xl'
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddPrescription} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Patient *
                  </label>
                  <select
                    required
                    value={newPrescription.patientId}
                    onChange={(e) => setNewPrescription({ ...newPrescription, patientId: e.target.value })}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  >
                    <option value=''>Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Medication Name *
                    </label>
                    <input
                      type='text'
                      required
                      value={newPrescription.medication}
                      onChange={(e) => setNewPrescription({ ...newPrescription, medication: e.target.value })}
                      placeholder='e.g., Lisinopril'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Dosage *
                    </label>
                    <input
                      type='text'
                      required
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                      placeholder='e.g., 10mg'
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Frequency *
                    </label>
                    <select
                      required
                      value={newPrescription.frequency}
                      onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    >
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Four times daily</option>
                      <option>Every 12 hours</option>
                      <option>Every 8 hours</option>
                      <option>As needed</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Start Date *
                    </label>
                    <input
                      type='date'
                      required
                      value={newPrescription.startDate}
                      onChange={(e) => setNewPrescription({ ...newPrescription, startDate: e.target.value })}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Duration *
                    </label>
                    <select
                      required
                      value={newPrescription.duration}
                      onChange={(e) => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    >
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                      <option>6 months</option>
                      <option>1 year</option>
                      <option>Ongoing</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Number of Refills
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='12'
                      value={newPrescription.refills}
                      onChange={(e) => setNewPrescription({ ...newPrescription, refills: parseInt(e.target.value) || 0 })}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Special Instructions
                  </label>
                  <textarea
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                    placeholder='e.g., Take with food, avoid alcohol...'
                    rows='3'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>

                <div className='flex gap-3 pt-4'>
                  <button
                    type='submit'
                    className='flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold'
                  >
                    Create Prescription
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowAddPrescription(false)}
                    className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold'
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

export default ProviderDashboard;