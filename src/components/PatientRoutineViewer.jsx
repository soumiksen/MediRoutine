'use client';
import { useEffect, useState } from 'react';

const PatientRoutineViewer = ({ patientId, routines, loading = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayRoutines, setTodayRoutines] = useState([]);

  // Filter routines for the current patient and active ones
  const patientRoutines = routines.filter(
    (routine) =>
      routine.patientId.toString() === patientId.toString() && routine.active
  );

  // Get today's schedule
  useEffect(() => {
    const today = selectedDate.toDateString();
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const todaySchedule = [];

    patientRoutines.forEach((routine) => {
      routine.items.forEach((item) => {
        item.timeSlots.forEach((timeSlot, index) => {
          if (timeSlot) {
            // Check if item should be scheduled for today based on frequency
            let shouldSchedule = false;

            switch (item.frequency) {
              case 'daily':
                shouldSchedule = true;
                break;
              case 'twice-daily':
              case 'three-times-daily':
                shouldSchedule = true;
                break;
              case 'weekly':
                // For simplicity, schedule weekly items on the same day of week they were created
                shouldSchedule = dayOfWeek === 1; // Mondays for weekly
                break;
              case 'as-needed':
                shouldSchedule = false; // Don't auto-schedule as-needed items
                break;
              default:
                shouldSchedule = true;
            }

            if (shouldSchedule) {
              todaySchedule.push({
                id: `${routine.id}-${item.id}-${index}`,
                routineId: routine.id,
                routineName: routine.name,
                routineType: routine.type,
                itemId: item.id,
                name: item.name,
                dosage: item.dosage,
                time: timeSlot,
                instructions: item.instructions,
                withFood: item.withFood,
                beforeFood: item.beforeFood,
                afterFood: item.afterFood,
                frequency: item.frequency,
                completed: false, // In a real app, this would come from user data
              });
            }
          }
        });
      });
    });

    // Sort by time
    todaySchedule.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    setTodayRoutines(todaySchedule);
  }, [selectedDate, patientRoutines]);

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getRoutineTypeIcon = (type) => {
    switch (type) {
      case 'medication':
        return '💊';
      case 'meal':
        return '🍽️';
      case 'exercise':
        return '🏃‍♂️';
      default:
        return '📋';
    }
  };

  const getRoutineTypeColor = (type) => {
    switch (type) {
      case 'medication':
        return 'border-l-blue-500 bg-blue-50';
      case 'meal':
        return 'border-l-green-500 bg-green-50';
      case 'exercise':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const toggleCompleted = (scheduleId) => {
    setTodayRoutines((prev) =>
      prev.map((item) =>
        item.id === scheduleId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUpcomingItems = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return todayRoutines
      .filter((item) => {
        const [itemHour, itemMinute] = item.time.split(':').map(Number);
        const itemTotalMinutes = itemHour * 60 + itemMinute;
        const currentTotalMinutes = currentHour * 60 + currentMinute;

        return itemTotalMinutes > currentTotalMinutes && !item.completed;
      })
      .slice(0, 3); // Next 3 items
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>Loading your routines...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-gray-800'>My Daily Routine</h2>
          <input
            type='date'
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className='p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <p className='text-gray-600'>{formatDate(selectedDate)}</p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>
            Today's Schedule
          </h3>
          <p className='text-3xl font-bold text-blue-600'>
            {todayRoutines.length}
          </p>
          <p className='text-sm text-gray-600'>Total items</p>
        </div>

        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>
            Completed
          </h3>
          <p className='text-3xl font-bold text-green-600'>
            {todayRoutines.filter((item) => item.completed).length}
          </p>
          <p className='text-sm text-gray-600'>Items completed</p>
        </div>

        <div className='bg-white rounded-lg shadow-md p-4'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>Upcoming</h3>
          <p className='text-3xl font-bold text-orange-600'>
            {getUpcomingItems().length}
          </p>
          <p className='text-sm text-gray-600'>Items remaining</p>
        </div>
      </div>

      {/* Next Up */}
      {getUpcomingItems().length > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h3 className='text-xl font-bold text-gray-800 mb-4'>
            ⏰ Coming Up Next
          </h3>
          <div className='space-y-3'>
            {getUpcomingItems().map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between p-3 bg-orange-50 border-l-4 border-orange-400 rounded'
              >
                <div className='flex items-center space-x-3'>
                  <span className='text-2xl'>
                    {getRoutineTypeIcon(item.routineType)}
                  </span>
                  <div>
                    <h4 className='font-medium text-gray-800'>{item.name}</h4>
                    <p className='text-sm text-gray-600'>
                      {formatTime(item.time)} • {item.routineName}
                    </p>
                  </div>
                </div>
                <span className='text-lg font-bold text-orange-600'>
                  {formatTime(item.time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Schedule */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-xl font-bold text-gray-800 mb-4'>
          📋 Full Schedule
        </h3>

        {todayRoutines.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-gray-500 text-lg'>
              No routine items scheduled for today
            </p>
            <p className='text-gray-400'>Enjoy your free day!</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {todayRoutines.map((item) => (
              <div
                key={item.id}
                className={`border-l-4 rounded-lg p-4 ${getRoutineTypeColor(
                  item.routineType
                )} ${item.completed ? 'opacity-75' : ''}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-3 flex-1'>
                    <input
                      type='checkbox'
                      checked={item.completed}
                      onChange={() => toggleCompleted(item.id)}
                      className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />

                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-xl'>
                          {getRoutineTypeIcon(item.routineType)}
                        </span>
                        <h4
                          className={`font-medium ${
                            item.completed
                              ? 'line-through text-gray-500'
                              : 'text-gray-800'
                          }`}
                        >
                          {item.name}
                        </h4>
                      </div>

                      {item.dosage && (
                        <p className='text-sm text-gray-600 ml-6'>
                          Dosage: {item.dosage}
                        </p>
                      )}

                      <p className='text-sm text-gray-600 ml-6'>
                        From: {item.routineName}
                      </p>

                      {(item.withFood || item.beforeFood || item.afterFood) && (
                        <p className='text-sm text-blue-600 ml-6 mt-1'>
                          {item.withFood
                            ? '🍽️ Take with food'
                            : item.beforeFood
                            ? '⏰ Take before eating'
                            : '🍽️ Take after eating'}
                        </p>
                      )}

                      {item.instructions && (
                        <p className='text-sm text-gray-600 ml-6 mt-1 italic'>
                          Note: "{item.instructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='text-right ml-4'>
                    <span
                      className={`text-lg font-bold ${
                        item.completed ? 'text-green-600' : 'text-gray-800'
                      }`}
                    >
                      {formatTime(item.time)}
                    </span>
                    {item.completed && (
                      <p className='text-xs text-green-600'>✓ Done</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Routines Overview */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-xl font-bold text-gray-800 mb-4'>📚 My Routines</h3>

        {patientRoutines.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-gray-500 text-lg'>No routines assigned yet</p>
            <p className='text-gray-400'>
              Your healthcare provider will set up your routine
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {patientRoutines.map((routine) => (
              <div
                key={routine.id}
                className='border rounded-lg p-4 hover:bg-gray-50'
              >
                <div className='flex items-center space-x-2 mb-2'>
                  <span className='text-lg'>
                    {getRoutineTypeIcon(routine.type)}
                  </span>
                  <h4 className='font-medium text-gray-800'>{routine.name}</h4>
                </div>
                <p className='text-sm text-gray-600 mb-2'>
                  {routine.items.length} item
                  {routine.items.length !== 1 ? 's' : ''}
                </p>
                <p className='text-xs text-gray-500'>
                  Created: {new Date(routine.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRoutineViewer;
