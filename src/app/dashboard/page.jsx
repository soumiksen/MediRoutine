'use client';
import Button from '@/components/button';
import PatientRoutineViewer from '@/components/PatientRoutineViewer';
import { useAuth } from '@/context/auth';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

const DashboardPage = () => {
  const { user, isPatient, loading } = useAuth();
  if (!loading && (!user || !isPatient)) {
    if (!user) redirect('/authentication');
    else redirect('/providerdashboard');
  }
  const [greeting, setGreeting] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [routines, setRoutines] = useState([]);
  const [routinesLoading, setRoutinesLoading] = useState(true);
  const [caregiverInfo, setCaregiverInfo] = useState(null);
  const [caregiverLoading, setCaregiverLoading] = useState(true);

  // Fetch patient's routines from Firestore
  useEffect(() => {
    if (!user) return;

    console.log('🏥 Patient dashboard loading routines for user:', user.uid);

    // Simplify query to avoid complex index requirements
    // We'll filter client-side instead of using complex server queries
    const routinesRef = collection(db, 'routines');
    const routinesQuery = query(
      routinesRef,
      where('patientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      routinesQuery,
      (snapshot) => {
        console.log('📋 Received routines snapshot:', snapshot.docs.length, 'documents');
        
        const routinesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('📝 Routine document:', doc.id, data);
          return {
            id: doc.id,
            ...data,
          };
        });

        // Filter active routines client-side and sort manually
        const activeRoutines = routinesData
          .filter(routine => routine.active !== false) // Include undefined as active
          .sort((a, b) => {
            const aTime = a.createdAt || '';
            const bTime = b.createdAt || '';
            return bTime.localeCompare(aTime);
          });

        console.log('✅ Processed routines:', activeRoutines.length, 'active routines');
        
        setRoutines(activeRoutines);
        setRoutinesLoading(false);
      },
      (error) => {
        console.error('❌ Error fetching patient routines:', error);
        console.error('❌ Error details:', error.message, error.code);
        setRoutines([]);
        setRoutinesLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up patient routines listener');
      unsubscribe();
    };
  }, [user]);

  // Fetch caregiver information
  useEffect(() => {
    const fetchCaregiverInfo = async () => {
      if (!user) return;

      try {
        const appId = process.env.NEXT_PUBLIC_APP_ID || 'remedyrx';
        const base = `/artifacts/${appId}/public/data`;

        // Get patient's caregiver info
        const patientDocRef = doc(db, `${base}/patients/${user.uid}`);
        const patientDoc = await getDoc(patientDocRef);

        if (patientDoc.exists() && patientDoc.data().caregiverId) {
          const caregiverId = patientDoc.data().caregiverId;

          // Get caregiver details
          const caregiverDocRef = doc(db, `${base}/providers/${caregiverId}`);
          const caregiverDoc = await getDoc(caregiverDocRef);

          if (caregiverDoc.exists()) {
            setCaregiverInfo({
              id: caregiverId,
              ...caregiverDoc.data(),
            });
          }
        }
      } catch (error) {
        console.error('Error fetching caregiver info:', error);
      } finally {
        setCaregiverLoading(false);
      }
    };

    fetchCaregiverInfo();
  }, [user]);

  // Sample data - replace with your actual data
  const todayMedications = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', taken: true },
    {
      id: 2,
      name: 'Metformin',
      dosage: '500mg',
      time: '12:00 PM',
      taken: false,
    },
    {
      id: 3,
      name: 'Atorvastatin',
      dosage: '20mg',
      time: '8:00 PM',
      taken: false,
    },
    { id: 4, name: 'Aspirin', dosage: '81mg', time: '8:00 AM', taken: true },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: 'Oct 8, 2025',
      time: '10:30 AM',
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Primary Care',
      date: 'Oct 15, 2025',
      time: '2:00 PM',
    },
    {
      id: 3,
      doctor: 'Dr. Emily Rodriguez',
      specialty: 'Endocrinologist',
      date: 'Oct 22, 2025',
      time: '9:00 AM',
    },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = '';

    if (hour < 12) {
      greetingText = 'Good morning';
    } else if (hour < 18) {
      greetingText = 'Good afternoon';
    } else {
      greetingText = 'Good evening';
    }

    const name =
      (typeof window !== 'undefined' &&
        window.localStorage.getItem('displayName')) ||
      '';
    setGreeting(`${greetingText}${name ? `, ${name}` : ''}`);
  }, []);

  const handleChatSubmit = (e) => {
    if (e) e.preventDefault();
    // Handle chat submission here
    console.log('Chat input:', chatInput);
    setChatInput('');
  };

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Greeting */}
        {/* Greeting */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>{greeting}</h1>
          <p>Here's your medication overview for today</p>

          {/* Tab Navigation */}
          <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4'>
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'routines', name: 'My Routines', icon: '📋' },
            ].map((tab) => (
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
        {activeTab === 'overview' && (
          <div>
            {/* Chat Input */}
            <div className='mb-8 rounded-2xl shadow-lg p-6'>
              <div className='flex flex-col sm:flex-row gap-3'>
                <input
                  type='text'
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleChatSubmit(e);
                    }
                  }}
                  placeholder='Ask me anything about your medications or appointments...'
                  className='flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                />
                <Button onClick={handleChatSubmit}>Send</Button>
              </div>
            </div>

            {/* Caregiver Information */}
            {caregiverLoading ? (
              <div className='mb-8 rounded-2xl shadow-lg p-6'>
                <div className='animate-pulse'>
                  <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                </div>
              </div>
            ) : caregiverInfo ? (
              <div className='mb-8 rounded-2xl shadow-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <span className='text-2xl'>👨‍⚕️</span>
                  </div>
                  <h2 className='text-xl font-bold text-gray-800'>
                    Your Healthcare Provider
                  </h2>
                </div>
                <div className='space-y-2 text-gray-700'>
                  <p>
                    <span className='font-medium'>Name:</span>{' '}
                    {caregiverInfo.name}
                  </p>
                  <p>
                    <span className='font-medium'>Email:</span>{' '}
                    {caregiverInfo.email}
                  </p>
                  <p className='text-sm text-gray-600 mt-3'>
                    Your caregiver manages your medication routines and can view
                    your progress.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Two Column Layout */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Today's Medications */}
              <div className='rounded-2xl shadow-lg'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2 rounded-lg'></div>
                  <h2 className='text-2xl font-bold'>Today's Medications</h2>
                </div>

                <div className='space-y-4'>
                  {todayMedications.map((med) => (
                    <div
                      key={med.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        med.taken
                          ? ' border-green-200'
                          : ' border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-lg'>{med.name}</h3>
                          <p className='text-sm mt-1'>{med.dosage}</p>
                        </div>
                        <div className='flex items-center gap-2 text-sm '>
                          <span>{med.time}</span>
                        </div>
                      </div>
                      <div className='mt-3'>
                        {med.taken ? (
                          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium'>
                            ✓ Taken
                          </span>
                        ) : (
                          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium '>
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className='rounded-2xl shadow-lg'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2 rounded-lg'></div>
                  <h2 className='text-2xl font-bold'>Upcoming Appointments</h2>
                </div>

                <div className='space-y-4'>
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className='p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <h3 className='font-semibold text-lg'>
                            {appointment.doctor}
                          </h3>
                          <p className='text-sm'>{appointment.specialty}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 mt-3 text-sm'>
                        <div className='flex items-center gap-1'>
                          <span>{appointment.date}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Routines Tab */}
        {activeTab === 'routines' && (
          <PatientRoutineViewer
            patientId={user?.uid || 'current-patient'}
            routines={routines}
            loading={routinesLoading}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
