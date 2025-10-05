'use client';
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { redirect } from 'next/navigation';

const ProviderDashboard = () => {
  const { user, isProvider, loading } = useAuth();
  if (!loading && (!user || !isProvider)) {
    if (!user) redirect('/authentication');
    else redirect('/dashboard');
  }
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddPrescription, setShowAddPrescription] = useState(false);

  const [patients] = useState([
    {
      id: 1,
      name: 'Tanzid Rahman',
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '8:00 AM' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '8:00 AM, 8:00 PM' },
      ],
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      medications: [
        { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily', time: '9:00 PM' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', time: '9:00 AM' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', time: '9:00 AM' },
      ],
    },
    {
      id: 3,
      name: 'Michael Chen',
      medications: [
        { name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', time: 'As needed' },
        { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', time: '7:00 AM' },
      ],
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      medications: [
        { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily', time: '6:00 AM' },
      ],
    },
  ]);

  const [todaySchedule] = useState([
    { id: 1, patient: 'Tanzid Rahman', medication: 'Lisinopril 10mg', time: '8:00 AM', status: 'completed' },
    { id: 2, patient: 'Sarah Johnson', medication: 'Aspirin 81mg', time: '9:00 AM', status: 'completed' },
    { id: 3, patient: 'Sarah Johnson', medication: 'Amlodipine 5mg', time: '9:00 AM', status: 'completed' },
    { id: 4, patient: 'Michael Chen', medication: 'Omeprazole 20mg', time: '7:00 AM', status: 'completed' },
    { id: 5, patient: 'Tanzid Rahman', medication: 'Metformin 500mg', time: '8:00 PM', status: 'pending' },
    { id: 6, patient: 'Sarah Johnson', medication: 'Atorvastatin 40mg', time: '9:00 PM', status: 'pending' },
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
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
    if (newPrescription.patientId && newPrescription.medication && newPrescription.dosage) {
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

  return (
    <div className="min-h-screen transition-colors duration-300 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Hi { (typeof window !== 'undefined' && window.localStorage.getItem('displayName')) || (user?.displayName) || (user?.email) || 'Provider' }
          </h1>
          
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition">←</button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h3>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition">→</button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold py-2 text-[#2B7A78]">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
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

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Patients</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{patients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Today's Doses</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{todaySchedule.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-semibold text-[#80CFA9]">
                    {todaySchedule.filter((s) => s.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Today's Schedule
            </h2>
            <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {todaySchedule.filter((i) => i.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-[#3AAFA9]">
                  <p className="text-lg mb-2">🎉 All done for today!</p>
                  <p className="text-sm">No pending medications</p>
                </div>
              ) : (
                todaySchedule
                  .filter((i) => i.status === 'pending')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border-2 border-[#3AAFA9] bg-[#f8fffe] dark:bg-zinc-800 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {item.time}
                            </span>
                            <span className="text-xs text-[#3AAFA9]">⏰</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.patient}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{item.medication}</p>
                        </div>
                        <button className="bg-[#3AAFA9] hover:bg-[#2B7A78] text-white px-3 py-1 rounded-lg text-xs transition">
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
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Patient Medications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 transition"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{p.name}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-[#e6f7f6] dark:bg-zinc-800 text-[#2B7A78]">
                    {p.medications.length} meds
                  </span>
                </div>
                <div className="space-y-2">
                  {p.medications.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#f8fffe] dark:bg-zinc-700">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{m.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {m.dosage} • {m.frequency}
                      </p>
                      <p className="text-xs mt-1 text-[#2B7A78]">⏰ {m.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  New Prescription
                </h2>
                <button
                  onClick={() => setShowAddPrescription(false)}
                  className="text-2xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {['Patient', 'Medication Name', 'Dosage', 'Frequency', 'Time'].map((label, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      {label}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3AAFA9]"
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

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddPrescription}
                    className="flex-1 px-6 py-3 bg-[#3AAFA9] hover:bg-[#2B7A78] text-white rounded-lg font-semibold transition"
                  >
                    Add Prescription
                  </button>
                  <button
                    onClick={() => setShowAddPrescription(false)}
                    className="px-6 py-3 bg-[#e6f7f6] dark:bg-gray-700 text-[#2B7A78] rounded-lg font-semibold transition"
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
