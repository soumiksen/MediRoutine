'use client';
import { useState } from 'react';

const RoutineList = ({
  routines,
  patients,
  onEditRoutine,
  onDeleteRoutine,
  onToggleActive,
}) => {
  const [filterPatient, setFilterPatient] = useState('');
  const [filterType, setFilterType] = useState('');

  const getPatientName = (patientId, patientName) => {
    // If routine already has patient name, use it
    if (patientName) {
      return patientName;
    }

    // Otherwise, look up from patients list
    const patient = patients.find(
      (p) =>
        (p.patientId && p.patientId.toString() === patientId.toString()) ||
        (p.id && p.id.toString() === patientId.toString())
    );
    return patient ? patient.name : 'Unknown Patient';
  };

  const filteredRoutines = routines.filter((routine) => {
    if (filterPatient && routine.patientId.toString() !== filterPatient)
      return false;
    if (filterType && routine.type !== filterType) return false;
    return true;
  });

  const routineTypes = [
    { value: '', label: 'All Types' },
    { value: 'medication', label: 'Medication' },
    { value: 'meal', label: 'Meal' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'general', label: 'General' },
  ];

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getFrequencyLabel = (frequency) => {
    const frequencies = {
      daily: 'Daily',
      'twice-daily': 'Twice Daily',
      'three-times-daily': 'Three Times Daily',
      weekly: 'Weekly',
      'as-needed': 'As Needed',
    };
    return frequencies[frequency] || frequency;
  };

  return (
    <div className='rounded-lg shadow-md p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>Patient Routines</h2>
      </div>

      {/* Filters */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Filter by Patient
          </label>
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>All Patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Filter by Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
          >
            {routineTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routines List */}
      {filteredRoutines.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-500 text-lg'>No routines found</p>
          <p className='text-gray-400'>Create a new routine to get started</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredRoutines.map((routine) => (
            <div
              key={routine.id}
              className='rounded-lg p-4'
            >
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <h3 className='text-lg font-semibold'>
                    {routine.name}
                  </h3>
                  <p className='text-sm'>
                    Patient:{' '}
                    {getPatientName(routine.patientId, routine.patientName)} |
                    Type: {routine.type} | Created:{' '}
                    {new Date(routine.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className='flex items-center gap-2'>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      routine.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {routine.active ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    onClick={() => onToggleActive(routine.id)}
                    className={`px-3 py-1 text-sm rounded ${
                      routine.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {routine.active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => onEditRoutine(routine)}
                    className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDeleteRoutine(routine.id)}
                    className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200'
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Routine Items */}
              <div className='space-y-2'>
                <h4 className='font-medium'>
                  Routine Items ({routine.items.length})
                </h4>
                {routine.items.map((item) => (
                  <div key={item.id} className='rounded p-3'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <h5 className='font-medium'>
                          {item.name}
                        </h5>
                        {item.dosage && (
                          <p className='text-sm'>
                            Dosage: {item.dosage}
                          </p>
                        )}
                        <p className='text-sm'>
                          Frequency: {getFrequencyLabel(item.frequency)}
                        </p>
                        <div className='text-sm'>
                          Times:{' '}
                          {item.timeSlots
                            .filter((time) => time)
                            .map((time) => formatTime(time))
                            .join(', ')}
                        </div>

                        {(item.withFood ||
                          item.beforeFood ||
                          item.afterFood) && (
                          <p className='text-sm text-blue-600 mt-1'>
                            {item.withFood
                              ? '🍽️ With food'
                              : item.beforeFood
                              ? '⏰ Before food'
                              : '🍽️ After food'}
                          </p>
                        )}

                        {item.instructions && (
                          <p className='text-sm text-gray-600 mt-1 italic'>
                            "{item.instructions}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutineList;
