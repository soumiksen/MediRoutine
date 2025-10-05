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

        console.log('✅ Processed patients:', patientsData.length, 'total');

        setPatients(patientsData);
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

  // Generate schedule for selected date whenever routines, patients, or selected date changes
  useEffect(() => {
    if (routines.length >= 0 && patients.length >= 0) {
      generateScheduleForDate(selectedDate);
    }
  }, [routines, patients, selectedDate]);

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Function to generate schedule for any selected date from routines
  const generateScheduleForDate = (targetDate = selectedDate) => {
    console.log('📅 Generating schedule for date:', targetDate.toDateString());
    console.log('🔄 Available routines:', routines.length);
    console.log('👥 Available patients:', patients.length);

    const scheduleItems = [];

    // Format target date for comparison (YYYY-MM-DD)
    const targetDateString = targetDate.toISOString().split('T')[0];

    // Process each active routine
    routines.forEach((routine) => {
      if (!routine.active) return;

      console.log(
        '🔍 Processing routine:',
        routine.name,
        'for patient:',
        routine.patientName
      );

      // Process each item in the routine
      routine.items?.forEach((item) => {
        if (!item.timeSlots || item.timeSlots.length === 0) return;

        // Generate schedule items for each time slot
        item.timeSlots.forEach((time, index) => {
          if (!time) return;

          const scheduleItem = {
            id: `${routine.id}_${item.id}_${index}`,
            patient: routine.patientName || 'Unknown Patient',
            patientId: routine.patientId,
            medication:
              item.type === 'medication'
                ? `${item.name} ${item.dosage || ''}`.trim()
                : item.name,
            activity: item.type !== 'medication' ? item.name : null,
            type: item.type,
            time: formatTime12Hour(time),
            timeValue: time, // Keep 24-hour format for sorting
            instructions: item.instructions,
            frequency: item.frequency,
            routineId: routine.id,
            routineName: routine.name,
            status: 'pending', // Default status, could be enhanced with completion tracking
            withFood: item.withFood,
            beforeFood: item.beforeFood,
            afterFood: item.afterFood,
          };

          scheduleItems.push(scheduleItem);
        });
      });
    });

    // Sort by time
    scheduleItems.sort((a, b) => {
      return a.timeValue.localeCompare(b.timeValue);
    });

    console.log('✅ Generated schedule items:', scheduleItems.length);
    console.log('📋 Schedule items:', scheduleItems);

    setTodaySchedule(scheduleItems);
    setScheduleLoading(false);
  };

  // Helper function to format time to 12-hour format
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Function to mark schedule item as completed
  const markScheduleItemCompleted = (itemId) => {
    console.log('✅ Marking schedule item as completed:', itemId);

    setTodaySchedule((prevSchedule) =>
      prevSchedule.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'completed',
              completedAt: new Date().toISOString(),
            }
          : item
      )
    );

    // Here you could also save the completion to Firestore for persistence
    // For now, we'll just update local state
  };

  // Function to get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'medication':
        return '💊';
      case 'meal':
        return '🍽️';
      case 'exercise':
        return '🏃';
      case 'general':
        return '📝';
      default:
        return '📋';
    }
  };

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

  const isSelectedDate = (day) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      selectedDate.getMonth() === selectedDate.getMonth() &&
      selectedDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    console.log('📅 Date selected:', newDate.toDateString());
  };

  const hasActivitiesOnDate = (day) => {
    if (!day || routines.length === 0) return false;

    // Check if any routine has activities (simple check for demo)
    // In a real implementation, you might want to check actual scheduled items
    return routines.some(
      (routine) => routine.active && routine.items?.length > 0
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
                  <button
                    onClick={() => changeMonth(-1)}
                    className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition'
                  >
                    ←
                  </button>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                    {monthNames[selectedDate.getMonth()]}{' '}
                    {selectedDate.getFullYear()}
                  </h3>
                  <button
                    onClick={() => changeMonth(1)}
                    className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition'
                  >
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
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg cursor-pointer relative transition-all
                    ${!day ? 'invisible' : ''}
                    ${
                      isToday(day)
                        ? 'bg-[#3AAFA9] text-white font-bold shadow-lg'
                        : isSelectedDate(day)
                        ? 'bg-[#2B7A78] text-white font-semibold shadow-md'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                    ${
                      hasActivitiesOnDate(day) &&
                      !isToday(day) &&
                      !isSelectedDate(day)
                        ? 'border-2 border-remedy-teal'
                        : ''
                    }`}
                    >
                      <span>{day}</span>
                      {hasActivitiesOnDate(day) && (
                        <div className='absolute bottom-1 w-1 h-1 bg-current rounded-full opacity-70'></div>
                      )}
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
                <div className='flex justify-between items-center mb-4'>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                      {isToday(selectedDate.getDate())
                        ? "Today's Schedule"
                        : 'Schedule'}
                    </h2>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year:
                          selectedDate.getFullYear() !==
                          new Date().getFullYear()
                            ? 'numeric'
                            : undefined,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => generateScheduleForDate(selectedDate)}
                    disabled={scheduleLoading}
                    className='px-3 py-1 bg-[#3AAFA9] hover:bg-[#2B7A78] text-white rounded-lg text-sm transition disabled:opacity-50'
                  >
                    {scheduleLoading ? '🔄' : '🔄 Refresh'}
                  </button>
                </div>

                <div className='space-y-3 max-h-[600px] overflow-y-auto'>
                  {scheduleLoading ? (
                    <div className='text-center py-8 text-gray-500'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#3AAFA9] mx-auto mb-2'></div>
                      <p className='text-sm'>Generating today's schedule...</p>
                    </div>
                  ) : todaySchedule.filter((i) => i.status === 'pending')
                      .length === 0 ? (
                    <div className='text-center py-8 text-[#3AAFA9]'>
                      <p className='text-lg mb-2'>🎉 All done for today!</p>
                      <p className='text-sm'>
                        {todaySchedule.length === 0
                          ? 'No activities scheduled for today'
                          : 'No pending activities'}
                      </p>
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
                              <div className='flex items-center gap-2'>
                                <span className='text-lg'>
                                  {getActivityIcon(item.type)}
                                </span>
                                <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                                  {item.patient}
                                </h4>
                              </div>
                              <p className='text-sm text-gray-600 dark:text-gray-300'>
                                {item.medication || item.activity}
                              </p>
                              {item.instructions && (
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                  {item.instructions}
                                </p>
                              )}
                              {(item.withFood ||
                                item.beforeFood ||
                                item.afterFood) && (
                                <div className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                                  {item.withFood && '🍽️ With food '}
                                  {item.beforeFood && '⏰ Before food '}
                                  {item.afterFood && '🕐 After food '}
                                </div>
                              )}
                            </div>
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
