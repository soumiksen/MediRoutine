'use client';

import Button from '@/components/button';
import PatientRoutineViewer from '@/components/PatientRoutineViewer';
import { useAuth } from '@/context/auth';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
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
  const [routine, setRoutine] = useState(null);
  const [routineLoading, setRoutineLoading] = useState(true);
  const [caregiverInfo, setCaregiverInfo] = useState(null);
  const [caregiverLoading, setCaregiverLoading] = useState(true);
  const [todayMedications, setTodayMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  // Fetch routines for the patient from all providers
  useEffect(() => {
    if (!user) return;

    console.log('🔍 Searching for routines for patient:', user.uid);

    // Query all providers' routines collections
    const unsubscribeFunctions = [];

    // Get all providers (you might need to adjust this based on your data structure)
    const providersRef = collection(db, 'providers');
    
    const providersUnsubscribe = onSnapshot(providersRef, (providersSnapshot) => {
      console.log('📊 Found providers:', providersSnapshot.docs.length);
      
      let allRoutines = [];
      let processedProviders = 0;

      if (providersSnapshot.empty) {
        console.log('⚠️ No providers found');
        setRoutineLoading(false);
        return;
      }

      providersSnapshot.docs.forEach((providerDoc) => {
        const providerId = providerDoc.id;
        console.log('🔍 Checking provider:', providerId);

        const routinesRef = collection(db, `providers/${providerId}/routines`);
        const routinesQuery = query(
          routinesRef,
          where('patientId', '==', user.uid)
        );

        const routineUnsubscribe = onSnapshot(routinesQuery, (routinesSnapshot) => {
          console.log(`📋 Found ${routinesSnapshot.docs.length} routines for provider ${providerId}`);

          routinesSnapshot.docs.forEach((routineDoc) => {
            const routineData = routineDoc.data();
            console.log('📝 Routine data:', routineData);

            if (routineData.active !== false) {
              allRoutines.push({
                id: routineDoc.id,
                ...routineData,
                providerId: providerId
              });
            }
          });

          processedProviders++;

          // Once all providers are processed
          if (processedProviders === providersSnapshot.docs.length) {
            console.log('✅ Total active routines found:', allRoutines.length);

            if (allRoutines.length > 0) {
              // Use the first active routine
              const activeRoutine = allRoutines[0];
              setRoutine(activeRoutine);

              // Generate medications from the single item
              if (activeRoutine.item && activeRoutine.item.timeSlots) {
                const medications = generateMedicationsFromItem(activeRoutine, activeRoutine.item);
                console.log('💊 Generated medications:', medications);
                setTodayMedications(medications);
              } else {
                console.log('⚠️ No item or timeSlots found in routine');
                setTodayMedications([]);
              }
            } else {
              console.log('⚠️ No active routines found');
              setRoutine(null);
              setTodayMedications([]);
            }

            setRoutineLoading(false);
          }
        });

        unsubscribeFunctions.push(routineUnsubscribe);
      });
    });

    unsubscribeFunctions.push(providersUnsubscribe);

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  // Helper: generate medications from single item with multiple time slots
  const generateMedicationsFromItem = (routineData, item) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const medications = [];

    if (!item.timeSlots || item.timeSlots.length === 0) {
      return [];
    }

    // Create a medication entry for each time slot
    item.timeSlots.forEach((timeSlot, index) => {
      const time = normalizeTime(timeSlot);
      
      medications.push({
        id: `${routineData.id}_${dateStr}_${index}`,
        routineId: routineData.id,
        routineName: routineData.name,
        name: item.name || 'Unknown Medication',
        dosage: item.dosage || 'As prescribed',
        time: time,
        taken: false,
        frequency: item.frequency || 'daily',
        patientName: routineData.patientName || 'Patient',
        type: item.type || 'medication',
        isAsNeeded: item.frequency?.toLowerCase() === 'as-needed',
        date: dateStr,
        instructions: item.instructions || '',
        withFood: item.withFood || false,
        beforeFood: item.beforeFood || false,
        afterFood: item.afterFood || false,
        providerId: routineData.providerId,
        providerName: routineData.providerName,
      });
    });

    // Sort by time
    medications.sort((a, b) => a.time.localeCompare(b.time));

    return medications;
  };

  // Normalize time string to HH:MM
  const normalizeTime = (time) => {
    if (!time) return '08:00';
    const timeStr = time.toString().trim();

    // If already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }

    // If in 12-hour format (HH:MM AM/PM)
    if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(timeStr)) {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (match) {
        let [, hours, minutes, period] = match;
        hours = parseInt(hours);
        if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        else if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
      }
    }

    return '08:00';
  };

  // Format time for display (12-hour format)
  const formatTimeForDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Fetch caregiver info
  useEffect(() => {
    const fetchCaregiverInfo = async () => {
      if (!user || !routine) return;

      try {
        // Get caregiver info from the routine's providerId
        if (routine.providerId) {
          const caregiverDocRef = doc(db, `providers/${routine.providerId}`);
          const caregiverDoc = await getDoc(caregiverDocRef);

          if (caregiverDoc.exists()) {
            setCaregiverInfo({ id: routine.providerId, ...caregiverDoc.data() });
          } else {
            // Try to get provider info from users collection
            const userDocRef = doc(db, `users/${routine.providerId}`);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              setCaregiverInfo({ id: routine.providerId, ...userDoc.data() });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching caregiver info:', error);
      } finally {
        setCaregiverLoading(false);
      }
    };

    fetchCaregiverInfo();
  }, [user, routine]);

  // Fetch appointments (currently placeholder)
  useEffect(() => {
    if (!user) return;
    setAppointments([]);
    setAppointmentsLoading(false);
  }, [user]);

  // Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = '';
    if (hour < 12) greetingText = 'Good morning';
    else if (hour < 18) greetingText = 'Good afternoon';
    else greetingText = 'Good evening';

    const name =
      (typeof window !== 'undefined' &&
        window.localStorage.getItem('displayName')) ||
      '';
    setGreeting(`${greetingText}${name ? `, ${name}` : ''}`);
  }, []);

  const handleChatSubmit = (e) => {
    if (e) e.preventDefault();
    console.log('Chat input:', chatInput);
    setChatInput('');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{greeting}</h1>
          <p>Here's your medication overview for today</p>
        </div>

        {activeTab === 'overview' && (
          <div>
            {/* Chat Input */}
            <div className="mb-8 rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit(e)}
                  placeholder="Ask me anything about your medications or appointments..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <Button onClick={handleChatSubmit}>Send</Button>
              </div>
            </div>

            {/* Caregiver Info */}
            {caregiverLoading ? (
              <div className="mb-8 rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : caregiverInfo ? (
              <div className="mb-8 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <h2 className="text-xl font-bold">Your Caregiver</h2>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span> {caregiverInfo.name || caregiverInfo.displayName || 'Not available'}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {caregiverInfo.email || 'Not available'}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Medications */}
              <div className="rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💊</span>
                  </div>
                  <h2 className="text-2xl font-bold">Today's Medications</h2>
                </div>

                <div className="space-y-4">
                  {routineLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                      <p className="text-sm">Loading medications...</p>
                    </div>
                  ) : todayMedications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-6xl mb-4">💊</div>
                      <p className="text-lg font-medium mb-2">
                        No medications scheduled for today
                      </p>
                      <p className="text-sm">
                        Your caregiver hasn't assigned any medication routines yet
                      </p>
                    </div>
                  ) : (
                    todayMedications.map((med) => (
                      <div
                        key={med.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          med.taken
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg ">{med.name}</h3>
                            <p className="text-sm mt-1">{med.dosage}</p>
                            {med.frequency && (
                              <p className="text-xs mt-1 capitalize">
                                Frequency: {med.frequency}
                              </p>
                            )}
                            {med.instructions && (
                              <p className="text-xs mt-1">
                                {med.instructions}
                              </p>
                            )}
                            {(med.withFood || med.beforeFood || med.afterFood) && (
                              <div className="text-xs text-blue-600 mt-1">
                                {med.withFood && '🍽️ With food '}
                                {med.beforeFood && '⏰ Before food '}
                                {med.afterFood && '🕐 After food '}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>🕒 {formatTimeForDisplay(med.time)}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          {med.taken ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Taken
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
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
              <div className="rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
                </div>

                <div className="space-y-4">
                  {appointmentsLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      <p className="text-sm">Loading appointments...</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-lg font-medium mb-2">No appointments scheduled</p>
                      <p className="text-sm">Contact your caregiver to schedule appointments</p>
                    </div>
                  ) : (
                    appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-xl border-2 border-gray-200 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{appointment.doctor}</h3>
                            <p className="text-sm">{appointment.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>📅 {appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
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

        {activeTab === 'routines' && (
          <PatientRoutineViewer
            patientId={user?.uid || 'current-patient'}
            routines={routine ? [routine] : []}
            loading={routineLoading}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;