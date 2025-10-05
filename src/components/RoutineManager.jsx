'use client';
import { useAuth } from '@/context/auth';
import { db } from '@/lib/firebase';
import handleAnalyze from '@/lib/geminiPhoto';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import Button from './button';
import ImageFileInput from './fileInput';

const RoutineManager = ({ patients, onRoutineUpdate }) => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState('medication');
  const [routineItem, setRoutineItem] = useState({
    type: 'medication',
    name: '',
    dosage: '',
    time: '',
    frequency: 'daily',
    instructions: '',
    withFood: false,
    beforeFood: false,
    afterFood: false,
    timeSlots: [''],
  });
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [filePath, setFile] = useState('');

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

  const saveRoutine = async () => {
    setSaveStatus(null);
    setErrorMessage('');

    if (
      !selectedPatient ||
      !routineName ||
      !routineItem.name ||
      !routineItem.time
    ) {
      setErrorMessage(
        'Please fill in all required fields and add a routine item.'
      );
      setSaveStatus('error');
      return;
    }

    if (!user?.uid) {
      setErrorMessage('User authentication error.');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);

    try {
      const selectedPatientData = patients.find(
        (p) => p.id === selectedPatient
      );
      if (!selectedPatientData) throw new Error('Selected patient not found.');

      const routine = {
        patientId: selectedPatientData.patientId || selectedPatient,
        patientName: selectedPatientData.name,
        patientEmail: selectedPatientData.email,
        providerId: user.uid,
        providerName: user.displayName || user.email,
        name: routineName,
        type: routineType,
        item: routineItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      };

      const collectionPath = `providers/${user.uid}/routines`;
      const routinesRef = collection(db, collectionPath);
      const docRef = await addDoc(routinesRef, routine);

      if (onRoutineUpdate) onRoutineUpdate({ id: docRef.id, ...routine });

      setSaveStatus('success');

      setTimeout(() => {
        setSelectedPatient('');
        setRoutineName('');
        setRoutineItem({
          type: 'medication',
          name: '',
          dosage: '',
          time: '',
          frequency: 'daily',
          instructions: '',
          withFood: false,
          beforeFood: false,
          afterFood: false,
          timeSlots: [''],
        });
        setShowForm(false);
        setSaveStatus(null);
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSave = async () => {
    if (!imageAnalysis) return;

    try {
      let rawText = imageAnalysis.replace(/```json\s*|\s*```/g, '').trim();
      const data = JSON.parse(rawText);

      const collectionPath = `providers/${user.uid}/routines`;
      const routinesRef = collection(db, collectionPath);
      const docRef = await addDoc(routinesRef, data);

      if (onRoutineUpdate) onRoutineUpdate({ id: docRef.id, ...data });
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageAnalyze = async () => {
  if (!filePath) return;
  try {
    const analysis = await handleAnalyze(filePath);
    setAnalysisComplete(true);

    // Parse JSON from analysis
    let rawText = analysis.replace(/```json\s*|\s*```/g, '').trim();
    const data = JSON.parse(rawText);

    // Populate routineItem with parsed data
    setRoutineItem({
      type: data.item?.type || 'medication',
      name: data.item?.name || '',
      dosage: data.item?.dosage || '',
      time: data.item?.time || '',
      frequency: data.item?.frequency || 'daily',
      instructions: data.item?.instructions || '',
      withFood: data.item?.withFood || false,
      beforeFood: data.item?.beforeFood || false,
      afterFood: data.item?.afterFood || false,
      timeSlots: data.item?.timeSlots || [data.item?.time || ''],
    });

    setRoutineType(data.type || 'medication');
    setRoutineName(data.name || '');
  } catch (err) {
    console.error('Image parsing failed', err);
  }
};


  return (
    <div className='rounded-lg shadow-md p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>New Prescription</h2>
        <div className='flex gap-3'>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create New Prescription'}
          </Button>
          <ImageFileInput
            onChange={setFile}
            handleClick={async () => {
              setImageAnalysis(await handleAnalyze(filePath));
              setAnalysisComplete(true);
            }}
            handleSubmit={handleImageSave}
            analysisComplete={analysisComplete}
            file={filePath}
            isSaving={isSaving}
          />
        </div>
      </div>

      {showForm && (
        <div className='rounded-lg p-6 mb-6'>
          {saveStatus === 'success' && (
            <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-green-800 font-medium'>
                Routine Created Successfully!
              </p>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800 font-medium'>
                Failed to Create Routine
              </p>
              <p className='text-red-600 text-sm'>{errorMessage}</p>
            </div>
          )}

          {/* Patient and Routine Name */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Select Patient
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Choose a patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Routine Name
              </label>
              <input
                type='text'
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder='e.g., Morning Medication'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Routine Type */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>
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

          {/* Routine Item */}
          <div className='border-t pt-4'>
            <h3 className='text-lg font-semibold mb-3'>Routine Item</h3>

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
                value={routineItem.name}
                onChange={(e) =>
                  setRoutineItem({ ...routineItem, name: e.target.value })
                }
                className='p-2 border border-gray-300 rounded-md'
              />
              {routineType === 'medication' && (
                <input
                  type='text'
                  placeholder='Dosage (e.g., 10mg)'
                  value={routineItem.dosage}
                  onChange={(e) =>
                    setRoutineItem({ ...routineItem, dosage: e.target.value })
                  }
                  className='p-2 border border-gray-300 rounded-md'
                />
              )}
              <input
                type='time'
                value={routineItem.time}
                onChange={(e) =>
                  setRoutineItem({ ...routineItem, time: e.target.value })
                }
                className='p-2 border border-gray-300 rounded-md'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
              <select
                value={routineItem.frequency}
                onChange={(e) =>
                  setRoutineItem({ ...routineItem, frequency: e.target.value })
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
                      checked={routineItem.withFood}
                      onChange={(e) =>
                        setRoutineItem({
                          ...routineItem,
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
                      checked={routineItem.beforeFood}
                      onChange={(e) =>
                        setRoutineItem({
                          ...routineItem,
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
                      checked={routineItem.afterFood}
                      onChange={(e) =>
                        setRoutineItem({
                          ...routineItem,
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
              value={routineItem.instructions}
              onChange={(e) =>
                setRoutineItem({ ...routineItem, instructions: e.target.value })
              }
              className='w-full p-2 border border-gray-300 rounded-md mb-3'
              rows='2'
            />

            {/* Save Routine Button */}
            <div className='mt-4'>
              <Button onClick={saveRoutine} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Routine'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineManager;
