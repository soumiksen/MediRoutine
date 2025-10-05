'use client';
import Button from '@/components/button';
import { useEffect, useState } from 'react';

const DashboardPage = () => {
  const [greeting, setGreeting] = useState('');
  const [chatInput, setChatInput] = useState('');

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

    setGreeting(`${greetingText}, Tanzid`);
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
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>{greeting}</h1>
          <p>Here's your medication overview for today</p>
        </div>

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
    </div>
  );
};

export default DashboardPage;
