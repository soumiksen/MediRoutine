'use client';
import PatientManager from '@/components/PatientManager';
import PatientProfile from '@/components/PatientProfile';
import RoutineList from '@/components/RoutineList';
import RoutineManager from '@/components/RoutineManager';
import { useAuth } from '@/context/auth';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProviderDashboard = () => {
  const { user, isProvider, loading } = useAuth();
  if (!loading && (!user || !isProvider)) {
    if (!user) redirect('/authentication');
    else redirect('/dashboard');
  }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [routines, setRoutines] = useState([]);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPatientNotifications, setNewPatientNotifications] = useState([]);

  // Firestore integration for real-time patient data
  useEffect(() => {
    if (!user) return;

    console.log('🏥 Provider dashboard loading patients for user:', user.uid);

    const basePath = process.env.NEXT_PUBLIC_APP_ID || 'remedyrx';
    const patientsRef = collection(db, `providers/${user.uid}/patients`);

    // Don't use orderBy initially to avoid missing field errors
    const patientsQuery = query(patientsRef);

    const unsubscribe = onSnapshot(
      patientsQuery,
      (snapshot) => {
        console.log(
          '📊 Received patient data snapshot:',
          snapshot.docs.length,
          'documents'
        );

        const patientsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('👤 Patient document:', doc.id, data);
          return {
            id: doc.id,
            ...data,
          };
        });

        // Sort manually by createdAt or addedAt (most recent first)
        patientsData.sort((a, b) => {
          const aTime = a.createdAt || a.addedAt || '';
          const bTime = b.createdAt || b.addedAt || '';
          return bTime.localeCompare(aTime);
        });

        // Check for new patients (added in last 24 hours)
        const twentyFourHoursAgo = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString();
        const newPatients = patientsData.filter((patient) => {
          const patientTime = patient.addedAt || patient.createdAt;
          return patientTime && patientTime > twentyFourHoursAgo;
        });

        console.log(
          '✅ Processed patients:',
          patientsData.length,
          'total,',
          newPatients.length,
          'new'
        );

        setPatients(patientsData);
        setNewPatientNotifications(newPatients);
        setPatientsLoading(false);
        setError(null);
      },
      (error) => {
        console.error('❌ Error fetching patients:', error);
        console.error('❌ Error details:', error.message, error.code);
        setError('Failed to load patients: ' + error.message);
        setPatientsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Firestore integration for routines
  useEffect(() => {
    if (!user) return;

    console.log('🩺 Provider dashboard loading routines for user:', user.uid);

    const routinesRef = collection(db, `providers/${user.uid}/routines`);
    // Remove orderBy to avoid missing field errors initially
    const routinesQuery = query(routinesRef);

    const unsubscribe = onSnapshot(
      routinesQuery,
      (snapshot) => {
        console.log(
          '📋 Received routines snapshot:',
          snapshot.docs.length,
          'documents'
        );

        const routinesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('🔄 Routine document:', doc.id, data);
          return {
            id: doc.id,
            ...data,
          };
        });

        // Sort manually to handle missing createdAt fields
        routinesData.sort((a, b) => {
          const aTime = a.createdAt || a.updatedAt || '';
          const bTime = b.createdAt || b.updatedAt || '';
          return bTime.localeCompare(aTime);
        });

        console.log('✅ Processed routines:', routinesData.length, 'total');
        setRoutines(routinesData);
      },
      (error) => {
        console.error('❌ Error fetching routines:', error);
        console.error('❌ Error details:', error.message, error.code);
        setRoutines([]);
      }
    );

    return () => {
      console.log('🧹 Cleaning up provider routines listener');
      unsubscribe();
    };
  }, [user]);

  const [todaySchedule] = useState([
    {
      id: 1,
      patient: 'Tanzid Rahman',
      medication: 'Lisinopril 10mg',
      time: '8:00 AM',
      status: 'completed',
    },
    {
      id: 2,
      patient: 'Sarah Johnson',
      medication: 'Aspirin 81mg',
      time: '9:00 AM',
      status: 'completed',
    },
    {
      id: 3,
      patient: 'Sarah Johnson',
      medication: 'Amlodipine 5mg',
      time: '9:00 AM',
      status: 'completed',
    },
    {
      id: 4,
      patient: 'Michael Chen',
      medication: 'Omeprazole 20mg',
      time: '7:00 AM',
      status: 'completed',
    },
    {
      id: 5,
      patient: 'Tanzid Rahman',
      medication: 'Metformin 500mg',
      time: '8:00 PM',
      status: 'pending',
    },
    {
      id: 6,
      patient: 'Sarah Johnson',
      medication: 'Atorvastatin 40mg',
      time: '9:00 PM',
      status: 'pending',
    },
  ]);

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    time: '',
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const changeMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const handleAddPrescription = () => {
    if (
      newPrescription.patientId &&
      newPrescription.medication &&
      newPrescription.dosage
    ) {
      setShowAddPrescription(false);
      setNewPrescription({
        patientId: '',
        medication: '',
        dosage: '',
        frequency: 'Once daily',
        time: '',
      });
    }
  };

  // Routine management functions with Firestore
  const handleRoutineUpdate = async (newRoutine) => {
    try {
      const routinesRef = collection(db, `providers/${user.uid}/routines`);
      const routineData = {
        ...newRoutine,
        providerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      delete routineData.id; // Remove local ID as Firestore will generate one

      await addDoc(routinesRef, routineData);
      console.log('Routine added successfully');
    } catch (error) {
      console.error('Error adding routine:', error);
      alert('Failed to add routine. Please try again.');
    }
  };

  const handleEditRoutine = (routine) => {
    // For now, just switch to the manage tab
    setActiveTab('manage');
  };

  const handleDeleteRoutine = async (routineId) => {
    if (confirm('Are you sure you want to delete this routine?')) {
      try {
        const routineRef = doc(db, `providers/${user.uid}/routines`, routineId);
        await deleteDoc(routineRef);
        console.log('Routine deleted successfully');
      } catch (error) {
        console.error('Error deleting routine:', error);
        alert('Failed to delete routine. Please try again.');
      }
    }
  };

  const handleToggleActive = async (routineId) => {
    try {
      const routineRef = doc(db, `providers/${user.uid}/routines`, routineId);
      const routine = routines.find((r) => r.id === routineId);

      await updateDoc(routineRef, {
        active: !routine.active,
        updatedAt: new Date().toISOString(),
      });

      console.log('Routine status updated successfully');
    } catch (error) {
      console.error('Error updating routine status:', error);
      alert('Failed to update routine status. Please try again.');
    }
  };

  // Patient management functions with Firestore
  const handlePatientAdd = async (newPatient) => {
    try {
      const patientsRef = collection(db, `providers/${user.uid}/patients`);
      const patientData = {
        ...newPatient,
        providerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
      };
      delete patientData.id; // Remove local ID as Firestore will generate one

      await addDoc(patientsRef, patientData);
      console.log('Patient added successfully');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. Please try again.');
    }
  };

  const handlePatientUpdate = async (updatedPatient) => {
    try {
      const patientRef = doc(
        db,
        `providers/${user.uid}/patients`,
        updatedPatient.id
      );
      const patientData = {
        ...updatedPatient,
        updatedAt: new Date().toISOString(),
      };
      delete patientData.id; // Remove ID from update data

      await updateDoc(patientRef, patientData);
      console.log('Patient updated successfully');
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient. Please try again.');
    }
  };

  const handlePatientDelete = async (patientId) => {
    try {
      // Delete patient document
      const patientRef = doc(db, `providers/${user.uid}/patients`, patientId);
      await deleteDoc(patientRef);

      // Also delete any routines for this patient
      const routinesRef = collection(db, `providers/${user.uid}/routines`);
      const routinesQuery = query(
        routinesRef,
        where('patientId', '==', patientId)
      );
      const routinesSnapshot = await getDocs(routinesQuery);

      const deletePromises = routinesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      console.log('Patient and associated routines deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient. Please try again.');
    }
  };

  const handleViewPatientProfile = (patient) => {
    setSelectedPatientProfile(patient);
  };

  const handleEditPatientProfile = (patient) => {
    setSelectedPatientProfile(null);
    setActiveTab('patients');
    // The PatientManager component will handle the edit
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'patients', name: 'Manage Patients', icon: '👥' },
    { id: 'manage', name: 'Manage Routines', icon: '⚙️' },
    { id: 'routines', name: 'View Routines', icon: '📋' },
  ];

  return (
    <div className='min-h-screen transition-colors duration-300 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100'>
            Hi{' '}
            {(typeof window !== 'undefined' &&
              window.localStorage.getItem('displayName')) ||
              user?.displayName ||
              user?.email ||
              'Provider'}
          </h1>

          {/* Tab Navigation */}
          <div className='flex space-x-1 bg-gray-100 dark:bg-zinc-700 p-1 rounded-lg mt-4'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* New Patient Notifications */}
        {newPatientNotifications.length > 0 && (
          <div className='mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border-l-4 border-green-500'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2 bg-green-100 dark:bg-green-900/50 rounded-lg'>
                <span className='text-2xl'>🎉</span>
              </div>
              <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>
                New Patient Registrations
              </h2>
            </div>
            <div className='space-y-3'>
              {newPatientNotifications.map((patient) => (
                <div
                  key={patient.id}
                  className='flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm'
                >
                  <div>
                    <p className='font-medium text-gray-900 dark:text-gray-100'>
                      {patient.name}
                    </p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {patient.email}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-500'>
                      Registered:{' '}
                      {new Date(patient.addedAt).toLocaleDateString()} at{' '}
                      {new Date(patient.addedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setSelectedPatientProfile(patient)}
                      className='px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/70 transition'
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setActiveTab('manage')}
                      className='px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-900/70 transition'
                    >
                      Create Routine
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
              {/* Calendar */}
              <div className='bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                    Calendar
                  </h2>
                  <button
                    onClick={() => setShowAddPrescription(true)}
                    className='px-3 py-1 rounded-lg text-white text-sm bg-[#3AAFA9] hover:bg-[#2B7A78] transition'
                  >
                    + Add
                  </button>
                </div>

                <div className='flex items-center justify-between mb-4'>
                  <button className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition'>
                    ←
                  </button>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                    {monthNames[selectedDate.getMonth()]}{' '}
                    {selectedDate.getFullYear()}
                  </h3>
                  <button className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition'>
                    →
                  </button>
                </div>

                <div className='grid grid-cols-7 gap-1 mb-2'>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div
                      key={day}
                      className='text-center text-xs font-semibold py-2 text-[#2B7A78]'
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className='grid grid-cols-7 gap-1'>
                  {getDaysInMonth(selectedDate).map((day, i) => (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer 
                    ${!day ? 'invisible' : ''}
                    ${
                      isToday(day)
                        ? 'bg-[#3AAFA9] text-white font-bold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
                  <h3 className='font-semibold mb-3 text-gray-900 dark:text-gray-100'>
                    Quick Stats
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Total Patients
                      </span>
                      <span className='font-semibold text-gray-900 dark:text-gray-100'>
                        {patients.length}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Today's Doses
                      </span>
                      <span className='font-semibold text-gray-900 dark:text-gray-100'>
                        {todaySchedule.length}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Completed
                      </span>
                      <span className='font-semibold text-[#80CFA9]'>
                        {
                          todaySchedule.filter((s) => s.status === 'completed')
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className='bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors'>
                <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100'>
                  Today's Schedule
                </h2>
                <p className='text-sm mb-4 text-gray-600 dark:text-gray-400'>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <div className='space-y-3 max-h-[600px] overflow-y-auto'>
                  {todaySchedule.filter((i) => i.status === 'pending')
                    .length === 0 ? (
                    <div className='text-center py-8 text-[#3AAFA9]'>
                      <p className='text-lg mb-2'>🎉 All done for today!</p>
                      <p className='text-sm'>No pending medications</p>
                    </div>
                  ) : (
                    todaySchedule
                      .filter((i) => i.status === 'pending')
                      .map((item) => (
                        <div
                          key={item.id}
                          className='p-4 rounded-xl border-2 border-[#3AAFA9] bg-[#f8fffe] dark:bg-zinc-800 transition'
                        >
                          <div className='flex justify-between items-start'>
                            <div>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-sm font-bold text-gray-900 dark:text-gray-100'>
                                  {item.time}
                                </span>
                                <span className='text-xs text-[#3AAFA9]'>
                                  ⏰
                                </span>
                              </div>
                              <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                                {item.patient}
                              </h4>
                              <p className='text-sm text-gray-600 dark:text-gray-300'>
                                {item.medication}
                              </p>
                            </div>
                            <button className='bg-[#3AAFA9] hover:bg-[#2B7A78] text-white px-3 py-1 rounded-lg text-xs transition'>
                              Mark Done
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Patient List */}
            <div className='bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors'>
              <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100'>
                Patient Medications
              </h2>

              {patientsLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                  <span className='ml-2 text-gray-600'>
                    Loading patients...
                  </span>
                </div>
              ) : error ? (
                <div className='text-center py-8'>
                  <p className='text-red-600 mb-2'>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className='text-blue-600 hover:underline'
                  >
                    Try again
                  </button>
                </div>
              ) : patients.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500 mb-2'>No patients added yet</p>
                  <button
                    onClick={() => setActiveTab('patients')}
                    className='text-blue-600 hover:underline'
                  >
                    Add your first patient
                  </button>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {patients.map((p) => (
                    <div
                      key={p.id}
                      className='p-4 rounded-xl border border-gray-200 dark:border-zinc-700 transition'
                    >
                      <div className='flex justify-between mb-3'>
                        <h3 className='font-bold text-gray-900 dark:text-gray-100'>
                          {p.name}
                        </h3>
                        <span className='px-2 py-1 text-xs rounded-full bg-[#e6f7f6] dark:bg-zinc-800 text-[#2B7A78]'>
                          {p?.medications?.length} meds
                        </span>
                      </div>
                      <div className='space-y-2'>
                        {p?.medications?.map((m, i) => (
                          <div
                            key={i}
                            className='p-3 rounded-lg bg-[#f8fffe] dark:bg-zinc-700'
                          >
                            <p className='font-semibold text-sm text-gray-900 dark:text-gray-100'>
                              {m.name}
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-300'>
                              {m.dosage} • {m.frequency}
                            </p>
                            <p className='text-xs mt-1 text-[#2B7A78]'>
                              ⏰ {m.time}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleViewPatientProfile(p)}
                        className='w-full mt-3 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Routines Tab */}
        {activeTab === 'manage' && (
          <RoutineManager
            patients={patients}
            onRoutineUpdate={handleRoutineUpdate}
          />
        )}

        {/* Manage Patients Tab */}
        {activeTab === 'patients' && (
          <PatientManager
            patients={patients}
            onPatientAdd={handlePatientAdd}
            onPatientUpdate={handlePatientUpdate}
            onPatientDelete={handlePatientDelete}
          />
        )}

        {/* View Routines Tab */}
        {activeTab === 'routines' && (
          <RoutineList
            routines={routines}
            patients={patients}
            onEditRoutine={handleEditRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      {/* Patient Profile Modal */}
      {selectedPatientProfile && (
        <PatientProfile
          patient={selectedPatientProfile}
          routines={routines}
          onClose={() => setSelectedPatientProfile(null)}
          onEdit={handleEditPatientProfile}
        />
      )}

      {/* Modal */}
      {showAddPrescription && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full'>
            <div className='p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  New Prescription
                </h2>
                <button
                  onClick={() => setShowAddPrescription(false)}
                  className='text-2xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                >
                  ×
                </button>
              </div>

              <div className='space-y-4'>
                {[
                  'Patient',
                  'Medication Name',
                  'Dosage',
                  'Frequency',
                  'Time',
                ].map((label, idx) => (
                  <div key={idx}>
                    <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
                      {label}
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3AAFA9]'
                      placeholder={
                        label === 'Medication Name'
                          ? 'e.g., Lisinopril'
                          : label === 'Dosage'
                          ? 'e.g., 10mg'
                          : label === 'Time'
                          ? 'e.g., 8:00 AM'
                          : ''
                      }
                    />
                  </div>
                ))}

                <div className='flex gap-3 pt-4'>
                  <button
                    onClick={handleAddPrescription}
                    className='flex-1 px-6 py-3 bg-[#3AAFA9] hover:bg-[#2B7A78] text-white rounded-lg font-semibold transition'
                  >
                    Add Prescription
                  </button>
                  <button
                    onClick={() => setShowAddPrescription(false)}
                    className='px-6 py-3 bg-[#e6f7f6] dark:bg-gray-700 text-[#2B7A78] rounded-lg font-semibold transition'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
