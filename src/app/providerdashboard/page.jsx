'use client';
import PatientManager from '@/components/PatientManager';
import PatientProfile from '@/components/PatientProfile';
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
  updateDoc,
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

  // Single routine state
  const [routine, setRoutine] = useState(null);

  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    time: '',
  });

  // Load patients
  useEffect(() => {
    if (!user) return;

    const patientsRef = collection(db, `providers/${user.uid}/patients`);
    const unsubscribe = onSnapshot(
      patientsRef,
      (snapshot) => {
        const patientsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(patientsData);
        setPatientsLoading(false);
        setError(null);
      },
      (error) => {
        console.error(error);
        setError('Failed to load patients');
        setPatientsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load single routine (if exists)
  useEffect(() => {
    if (!user) return;

    const routinesRef = collection(db, `providers/${user.uid}/routines`);
    const unsubscribe = onSnapshot(routinesRef, (snapshot) => {
      const data = snapshot.docs[0]?.data();
      if (data) {
        setRoutine({ id: snapshot.docs[0].id, ...data });
      } else {
        setRoutine(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Generate schedule for selected date
  useEffect(() => {
    generateScheduleForDate(selectedDate);
  }, [routine, selectedDate]);

  const generateScheduleForDate = (targetDate = selectedDate) => {
    setScheduleLoading(true);
    const scheduleItems = [];

    if (routine?.active && routine.item?.time) {
      const item = routine.item;
      scheduleItems.push({
        id: routine.id + '_item',
        patient: routine.patientName || 'Unknown Patient',
        patientId: routine.patientId,
        medication:
          item.type === 'medication'
            ? `${item.name} ${item.dosage || ''}`.trim()
            : item.name,
        activity: item.type !== 'medication' ? item.name : null,
        type: item.type,
        time: formatTime12Hour(item.time),
        timeValue: item.time,
        instructions: item.instructions,
        frequency: item.frequency,
        routineId: routine.id,
        routineName: routine.name,
        status: 'pending',
        withFood: item.withFood,
        beforeFood: item.beforeFood,
        afterFood: item.afterFood,
      });
    }

    setTodaySchedule(
      scheduleItems.sort((a, b) => a.timeValue.localeCompare(b.timeValue))
    );
    setScheduleLoading(false);
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const markScheduleItemCompleted = (itemId) => {
    setTodaySchedule((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: 'completed', completedAt: new Date().toISOString() }
          : item
      )
    );
  };

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
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
  };

  const hasActivitiesOnDate = (day) => {
    if (!day || !routine) return false;
    return routine.active;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'patients', name: 'Manage Patients', icon: '👥' },
    { id: 'manage', name: 'Manage Routine', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Hi {user?.displayName || user?.email || 'Provider'}
          </h1>
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-700 p-1 rounded-lg mt-4">
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</h2>
                <button
                  onClick={() => setShowAddPrescription(true)}
                  className="px-3 py-1 rounded-lg text-white text-sm bg-[#3AAFA9] hover:bg-[#2B7A78] transition"
                >
                  + Add
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition">←</button>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition">→</button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold py-2 text-[#2B7A78]">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(selectedDate).map((day,i) => (
                  <div
                    key={i}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg cursor-pointer relative transition-all
                      ${!day ? 'invisible' : ''}
                      ${isToday(day) ? 'bg-[#3AAFA9] text-white font-bold shadow-lg'
                      : isSelectedDate(day) ? 'bg-[#2B7A78] text-white font-semibold shadow-md'
                      : 'text-gray-700 dark:text-gray-300'}
                      ${hasActivitiesOnDate(day) && !isToday(day) && !isSelectedDate(day) ? 'border-2 border-remedy-teal' : ''}`}
                  >
                    <span>{day}</span>
                    {hasActivitiesOnDate(day) && <div className="absolute bottom-1 w-1 h-1 bg-current rounded-full opacity-70"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {isToday(selectedDate.getDate()) ? "Today's Schedule" : 'Schedule'}
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {scheduleLoading ? (
                  <p>Loading...</p>
                ) : todaySchedule.length === 0 ? (
                  <p>No activities scheduled</p>
                ) : (
                  todaySchedule.map(item => (
                    <div key={item.id} className="p-4 rounded-xl border-2 border-[#3AAFA9] bg-[#f8fffe] dark:bg-zinc-800 transition">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold">{item.time}</span>
                        <span className="text-xs text-[#3AAFA9]">⏰</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getActivityIcon(item.type)}</span>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.patient}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.medication || item.activity}</p>
                      {item.instructions && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.instructions}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manage Routine Tab */}
        {activeTab === 'manage' && (
          <RoutineManager
            patients={patients}
            routine={routine}
            onRoutineUpdate={(newRoutine) => setRoutine(newRoutine)}
          />
        )}

        {/* Manage Patients Tab */}
        {activeTab === 'patients' && (
          <PatientManager
            patients={patients}
            onPatientAdd={(p) => setPatients([...patients, p])}
            onPatientUpdate={(p) => setPatients(patients.map(pt => pt.id === p.id ? p : pt))}
            onPatientDelete={(id) => setPatients(patients.filter(pt => pt.id !== id))}
          />
        )}
      </div>

      {/* Patient Profile Modal */}
      {selectedPatientProfile && (
        <PatientProfile
          patient={selectedPatientProfile}
          onClose={() => setSelectedPatientProfile(null)}
        />
      )}
    </div>
  );
};

export default ProviderDashboard;
