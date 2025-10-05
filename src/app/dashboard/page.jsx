'use client';
import Button from '@/components/button';
import PatientRoutineViewer from '@/components/PatientRoutineViewer';
import { useAuth } from '@/context/auth';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
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
  const [todayMedications, setTodayMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  // Fetch patient's routines from multiple possible locations in Firestore
  useEffect(() => {
    if (!user) return;

    console.log('🏥 Patient dashboard loading routines for user:', user.uid);

    // Set up listeners for routines from different possible locations
    const unsubscribers = [];

    // Method 1: Check direct routines collection (legacy)
    const directRoutinesRef = collection(db, 'routines');
    const directQuery = query(
      directRoutinesRef,
      where('patientId', '==', user.uid)
    );

    const directUnsubscribe = onSnapshot(
      directQuery,
      (snapshot) => {
        console.log('📋 Direct routines found:', snapshot.docs.length);
        processRoutineSnapshot(snapshot, 'direct');
      },
      (error) => {
        console.log('📋 No direct routines found or error:', error.message);
      }
    );
    unsubscribers.push(directUnsubscribe);

    // Method 2: Check provider-based routines (current structure)
    // We need to find all providers and check their routines collections
    const fetchProviderRoutines = async () => {
      try {
        // First, find which providers have this patient
        const providersRef = collection(db, 'providers');
        const providersSnapshot = await getDocs(providersRef);

        for (const providerDoc of providersSnapshot.docs) {
          const providerId = providerDoc.id;

          // Check if this provider has routines for our patient
          const providerRoutinesRef = collection(
            db,
            `providers/${providerId}/routines`
          );

          const providerUnsubscribe = onSnapshot(
            providerRoutinesRef,
            (snapshot) => {
              // Filter routines for this specific patient
              const patientRoutines = snapshot.docs.filter((doc) => {
                const data = doc.data();
                return data.patientId === user.uid;
              });

              if (patientRoutines.length > 0) {
                console.log(
                  `📋 Provider ${providerId} routines for patient:`,
                  patientRoutines.length
                );
                processRoutineSnapshot(
                  { docs: patientRoutines },
                  `provider-${providerId}`
                );
              }
            },
            (error) => {
              console.log(
                `📋 No routines found in provider ${providerId}:`,
                error.message
              );
            }
          );

          unsubscribers.push(providerUnsubscribe);
        }
      } catch (error) {
        console.error('❌ Error fetching provider routines:', error);
      }
    };

    fetchProviderRoutines();

    // Process routine snapshots from any source
    const processRoutineSnapshot = (snapshot, source) => {
      console.log(
        `📋 Processing ${snapshot.docs.length} routines from ${source}`
      );

      const routinesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('📝 Routine document from', source, ':', doc.id, data);
        return {
          id: doc.id,
          source: source,
          ...data,
        };
      });

      // Filter active routines and sort
      const activeRoutines = routinesData
        .filter((routine) => routine.active !== false)
        .sort((a, b) => {
          const aTime = a.createdAt || '';
          const bTime = b.createdAt || '';
          return bTime.localeCompare(aTime);
        });

      console.log(
        `✅ Processed ${activeRoutines.length} active routines from ${source}`
      );

      // Update state (merge with existing routines from other sources)
      setRoutines((prevRoutines) => {
        // Remove routines from the same source first
        const filteredPrev = prevRoutines.filter((r) => r.source !== source);
        const merged = [...filteredPrev, ...activeRoutines];

        console.log('🔄 Total routines after merge:', merged.length);

        // Generate today's medications from all merged routines
        const todayMeds = generateTodayMedications(merged);
        setTodayMedications(todayMeds);

        return merged;
      });

      setRoutinesLoading(false);
    };

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up routine listeners');
      unsubscribers.forEach((unsubscribe) => unsubscribe());
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

  // Fetch appointments from Firebase
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        console.log('📅 Fetching appointments for patient:', user.uid);

        // Try to find appointments in the provider's collection
        // Since we don't have a direct appointments collection, we'll show a message
        // In a real app, you'd have an appointments collection

        setAppointments([]);
        setAppointmentsLoading(false);
      } catch (error) {
        console.error('❌ Error fetching appointments:', error);
        setAppointments([]);
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Function to generate today's medications from routines based on actual RoutineManager structure
  const generateTodayMedications = (routines) => {
    if (!routines || routines.length === 0) {
      console.log('📋 No routines available for medication generation');
      return [];
    }

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const todayName = dayNames[dayOfWeek];
    const todayDateStr = today.toISOString().split('T')[0];

    console.log('🗓️ Generating medications for:', {
      todayName,
      todayDateStr,
      totalRoutines: routines.length,
    });

    const medications = [];

    routines.forEach((routine) => {
      console.log('🔍 Processing routine:', {
        id: routine.id,
        name: routine.name,
        type: routine.type,
        active: routine.active,
        itemsCount: routine.items?.length || 0,
      });

      // Skip non-medication routines or inactive routines
      if (routine.type !== 'medication' || routine.active === false) {
        console.log(
          '⏭️ Skipping routine:',
          routine.id,
          'type:',
          routine.type,
          'active:',
          routine.active
        );
        return;
      }

      // Process each item in the routine (this is how RoutineManager structures data)
      if (routine.items && Array.isArray(routine.items)) {
        routine.items.forEach((item, itemIndex) => {
          console.log('💊 Processing medication item:', {
            name: item.name,
            frequency: item.frequency,
            time: item.time,
            timeSlots: item.timeSlots,
          });

          // Determine if this medication should be taken today based on frequency
          let shouldTakeToday = false;

          switch (item.frequency?.toLowerCase()) {
            case 'daily':
              shouldTakeToday = true;
              break;

            case 'twice-daily':
            case 'three-times-daily':
              shouldTakeToday = true; // These are daily frequencies with multiple times
              break;

            case 'weekly':
              // For weekly, we'd need additional day information (not currently in the structure)
              // For now, default to showing on specific day of week
              shouldTakeToday = dayOfWeek === 1; // Default to Monday for weekly
              break;

            case 'as-needed':
              shouldTakeToday = true; // Always show as-needed medications
              break;

            default:
              shouldTakeToday = true; // Default to daily
          }

          if (!shouldTakeToday) {
            console.log('⏭️ Medication not scheduled for today:', item.name);
            return;
          }

          // Handle different time structures from RoutineManager
          let timesToTake = [];

          if (item.timeSlots && Array.isArray(item.timeSlots)) {
            // RoutineManager creates timeSlots array for multi-daily frequencies
            timesToTake = item.timeSlots.filter(
              (time) => time && time.trim() !== ''
            );
          } else if (item.time) {
            // Single time entry
            timesToTake = [item.time];
          } else {
            // Fallback default
            timesToTake = ['08:00'];
          }

          // Create medication entries for each time slot
          timesToTake.forEach((time, timeIndex) => {
            const normalizedTime = normalizeTimeFormat(time);

            const medicationEntry = {
              id: `${routine.id}_${itemIndex}_${timeIndex}_${todayDateStr}`,
              routineId: routine.id,
              routineName: routine.name,
              name: item.name || 'Unknown Medication',
              dosage: item.dosage || 'As prescribed',
              time: normalizedTime,
              taken: false, // TODO: Implement completion tracking with Firebase
              frequency: item.frequency || 'daily',
              patientName: routine.patientName || 'Patient',
              type: 'medication',
              isAsNeeded: item.frequency?.toLowerCase() === 'as-needed',
              date: todayDateStr,
              instructions: item.instructions || '',
              // Food timing flags from RoutineManager
              withFood: item.withFood || false,
              beforeFood: item.beforeFood || false,
              afterFood: item.afterFood || false,
              // Additional metadata
              providerId: routine.providerId,
              providerName: routine.providerName,
            };

            medications.push(medicationEntry);
            console.log(
              '✅ Added medication:',
              medicationEntry.name,
              'at',
              normalizedTime,
              'frequency:',
              medicationEntry.frequency
            );
          });
        });
      } else {
        console.log('⚠️ Routine has no items:', routine.id);
      }
    });

    // Sort medications by time (earliest first)
    medications.sort((a, b) => {
      try {
        const timeA = convertTimeToMinutes(a.time);
        const timeB = convertTimeToMinutes(b.time);
        return timeA - timeB;
      } catch (error) {
        console.error('⚠️ Error sorting medications by time:', error);
        return 0;
      }
    });

    console.log('🎯 Generated medications for today:', {
      totalCount: medications.length,
      byFrequency: medications.reduce((acc, med) => {
        acc[med.frequency] = (acc[med.frequency] || 0) + 1;
        return acc;
      }, {}),
      medications: medications.map((m) => ({
        name: m.name,
        time: m.time,
        frequency: m.frequency,
        dosage: m.dosage,
      })),
    });

    return medications;
  };

  // Helper function to normalize time format
  const normalizeTimeFormat = (time) => {
    if (!time) return '08:00';

    // Handle different time formats
    const timeStr = time.toString().trim();

    // If already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }

    // If in HH:MM AM/PM format
    if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(timeStr)) {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (match) {
        let [, hours, minutes, period] = match;
        hours = parseInt(hours);

        if (period.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
      }
    }

    // Default fallback
    console.log('⚠️ Could not parse time format:', timeStr, 'using default');
    return '08:00';
  };

  // Helper function to convert time to minutes for sorting
  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

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
          <div className='flex space-x-1 p-1 rounded-lg mt-4'>
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'routines', name: 'My Routines', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-remedy-teal shadow-sm' : ''
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
              <div className='mb-8 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <span className='text-2xl'>👨‍⚕️</span>
                  </div>
                  <h2 className='text-xl font-bold'>Your Caregiver</h2>
                </div>
                <div className='space-y-2'>
                  <p>
                    <span className='font-medium'>Name:</span>{' '}
                    {caregiverInfo.name}
                  </p>
                  <p>
                    <span className='font-medium'>Email:</span>{' '}
                    {caregiverInfo.email}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Two Column Layout */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Today's Medications */}
              <div className='rounded-2xl shadow-lg p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <span className='text-2xl'>💊</span>
                  </div>
                  <h2 className='text-2xl font-bold'>Today's Medications</h2>
                </div>

                <div className='space-y-4'>
                  {routinesLoading ? (
                    <div className='text-center py-8 text-gray-500'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2'></div>
                      <p className='text-sm'>Loading medications...</p>
                    </div>
                  ) : todayMedications.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <div className='text-6xl mb-4'>💊</div>
                      <p className='text-lg font-medium mb-2'>
                        No medications scheduled for today
                      </p>
                      <p className='text-sm'>
                        Your caregiver hasn't assigned any medication routines
                        yet
                      </p>
                    </div>
                  ) : (
                    todayMedications.map((med) => (
                      <div
                        key={med.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          med.taken
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <h3 className='font-semibold text-lg text-gray-900'>
                              {med.name}
                            </h3>
                            <p className='text-sm text-gray-600 mt-1'>
                              {med.dosage}
                            </p>
                            {med.frequency && (
                              <p className='text-xs text-gray-500 mt-1 capitalize'>
                                Frequency: {med.frequency}
                              </p>
                            )}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <span>🕒 {med.time}</span>
                          </div>
                        </div>
                        <div className='mt-3'>
                          {med.taken ? (
                            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                              ✓ Taken
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className='rounded-2xl shadow-lg p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2 bg-purple-100 rounded-lg'>
                    <span className='text-2xl'>📅</span>
                  </div>
                  <h2 className='text-2xl font-bold'>Upcoming Appointments</h2>
                </div>

                <div className='space-y-4'>
                  {appointmentsLoading ? (
                    <div className='text-center py-8 text-gray-500'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2'></div>
                      <p className='text-sm'>Loading appointments...</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <div className='text-6xl mb-4'>📋</div>
                      <p className='text-lg font-medium mb-2'>
                        No appointments scheduled
                      </p>
                      <p className='text-sm'>
                        Contact your caregiver to schedule appointments
                      </p>
                    </div>
                  ) : (
                    appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className='p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <h3 className='font-semibold text-lg'>
                              {appointment.doctor}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {appointment.specialty}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-4 mt-3 text-sm text-gray-600'>
                          <div className='flex items-center gap-1'>
                            <span>📅 {appointment.date}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <span>🕒 {appointment.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
