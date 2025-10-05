'use client';
import { useState } from 'react';
import Button from './button';

const RoutineManager = ({ patients, onRoutineUpdate }) => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState('medication'); // medication, meal, exercise, general
  const [routineItems, setRoutineItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [newItem, setNewItem] = useState({
    type: 'medication',
    name: '',
    dosage: '',
    time: '',
    frequency: 'daily',
    instructions: '',
    withFood: false,
    beforeFood: false,
    afterFood: false,
  });

  const routineTypes = [
    { value: 'medication', label: 'Medication Schedule' },
    { value: 'meal', label: 'Meal Plan' },
    { value: 'exercise', label: 'Exercise Routine' },
    { value: 'general', label: 'General Instructions' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'three-times-daily', label: 'Three Times Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'as-needed', label: 'As Needed' },
  ];

  const addRoutineItem = () => {
    if (!newItem.name || !newItem.time) return;

    const item = {
      id: Date.now(),
      ...newItem,
      timeSlots:
        newItem.frequency === 'twice-daily'
          ? [newItem.time, '']
          : newItem.frequency === 'three-times-daily'
          ? [newItem.time, '', '']
          : [newItem.time],
    };

    setRoutineItems([...routineItems, item]);
    setNewItem({
      type: 'medication',
      name: '',
      dosage: '',
      time: '',
      frequency: 'daily',
      instructions: '',
      withFood: false,
      beforeFood: false,
      afterFood: false,
    });
  };

  const removeRoutineItem = (id) => {
    setRoutineItems(routineItems.filter((item) => item.id !== id));
  };

  const saveRoutine = () => {
    if (!selectedPatient || !routineName || routineItems.length === 0) return;

    const routine = {
      id: Date.now(),
      patientId: selectedPatient,
      name: routineName,
      type: routineType,
      items: routineItems,
      createdAt: new Date().toISOString(),
      active: true,
    };

    onRoutineUpdate(routine);

    // Reset form
    setSelectedPatient('');
    setRoutineName('');
    setRoutineItems([]);
    setShowForm(false);
  };

  const updateTimeSlot = (itemId, slotIndex, time) => {
    setRoutineItems(
      routineItems.map((item) => {
        if (item.id === itemId) {
          const newTimeSlots = [...item.timeSlots];
          newTimeSlots[slotIndex] = time;
          return { ...item, timeSlots: newTimeSlots };
        }
        return item;
      })
    );
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-800'>Routine Management</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create New Routine'}
        </Button>
      </div>

      {showForm && (
        <div className='border rounded-lg p-6 mb-6 bg-gray-50'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select Patient
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Routine Name
              </label>
              <input
                type='text'
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder='e.g., Morning Medication Schedule'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Routine Type
            </label>
            <select
              value={routineType}
              onChange={(e) => setRoutineType(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
            >
              {routineTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Item Form */}
          <div className='border-t pt-4'>
            <h3 className='text-lg font-semibold mb-3'>Add Routine Item</h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-3'>
              <input
                type='text'
                placeholder={
                  routineType === 'medication'
                    ? 'Medication name'
                    : routineType === 'meal'
                    ? 'Meal/Food item'
                    : routineType === 'exercise'
                    ? 'Exercise name'
                    : 'Activity name'
                }
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className='p-2 border border-gray-300 rounded-md'
              />

              {routineType === 'medication' && (
                <input
                  type='text'
                  placeholder='Dosage (e.g., 10mg)'
                  value={newItem.dosage}
                  onChange={(e) =>
                    setNewItem({ ...newItem, dosage: e.target.value })
                  }
                  className='p-2 border border-gray-300 rounded-md'
                />
              )}

              <input
                type='time'
                value={newItem.time}
                onChange={(e) =>
                  setNewItem({ ...newItem, time: e.target.value })
                }
                className='p-2 border border-gray-300 rounded-md'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
              <select
                value={newItem.frequency}
                onChange={(e) =>
                  setNewItem({ ...newItem, frequency: e.target.value })
                }
                className='p-2 border border-gray-300 rounded-md'
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>

              {routineType === 'medication' && (
                <div className='flex gap-4'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={newItem.withFood}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          withFood: e.target.checked,
                          beforeFood: false,
                          afterFood: false,
                        })
                      }
                      className='mr-2'
                    />
                    With food
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={newItem.beforeFood}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          beforeFood: e.target.checked,
                          withFood: false,
                          afterFood: false,
                        })
                      }
                      className='mr-2'
                    />
                    Before food
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={newItem.afterFood}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          afterFood: e.target.checked,
                          withFood: false,
                          beforeFood: false,
                        })
                      }
                      className='mr-2'
                    />
                    After food
                  </label>
                </div>
              )}
            </div>

            <textarea
              placeholder='Additional instructions...'
              value={newItem.instructions}
              onChange={(e) =>
                setNewItem({ ...newItem, instructions: e.target.value })
              }
              className='w-full p-2 border border-gray-300 rounded-md mb-3'
              rows='2'
            />

            <Button onClick={addRoutineItem}>Add Item</Button>
          </div>

          {/* Routine Items List */}
          {routineItems.length > 0 && (
            <div className='mt-6'>
              <h3 className='text-lg font-semibold mb-3'>
                Routine Items ({routineItems.length})
              </h3>
              <div className='space-y-3'>
                {routineItems.map((item) => (
                  <div key={item.id} className='bg-white border rounded-lg p-4'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-gray-800'>
                          {item.name}
                        </h4>
                        {item.dosage && (
                          <p className='text-sm text-gray-600'>
                            Dosage: {item.dosage}
                          </p>
                        )}
                        <p className='text-sm text-gray-600'>
                          Frequency:{' '}
                          {
                            frequencies.find((f) => f.value === item.frequency)
                              ?.label
                          }
                        </p>

                        {/* Time slots based on frequency */}
                        <div className='mt-2'>
                          <span className='text-sm font-medium'>Times: </span>
                          {item.timeSlots.map((time, index) => (
                            <input
                              key={index}
                              type='time'
                              value={time}
                              onChange={(e) =>
                                updateTimeSlot(item.id, index, e.target.value)
                              }
                              className='ml-2 mr-2 p-1 border border-gray-300 rounded text-sm'
                            />
                          ))}
                        </div>

                        {(item.withFood ||
                          item.beforeFood ||
                          item.afterFood) && (
                          <p className='text-sm text-blue-600 mt-1'>
                            {item.withFood
                              ? 'Take with food'
                              : item.beforeFood
                              ? 'Take before food'
                              : 'Take after food'}
                          </p>
                        )}

                        {item.instructions && (
                          <p className='text-sm text-gray-600 mt-1'>
                            {item.instructions}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeRoutineItem(item.id)}
                        className='text-red-600 hover:text-red-800 ml-4'
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className='mt-6 flex gap-3'>
                <Button onClick={saveRoutine}>Save Routine</Button>
                <button
                  onClick={() => {
                    setRoutineItems([]);
                    setSelectedPatient('');
                    setRoutineName('');
                  }}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50'
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoutineManager;
