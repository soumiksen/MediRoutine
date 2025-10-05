import { useRef, useState } from 'react';

export default function ImageFileInput({
  value = null,
  onChange,
  analysisComplete=false,
  handleClick,
  handleSubmit,
  disabled=false,
  isSaving
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(value);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const ACCEPTED_MIMES = ['image/jpeg', 'image/png'];
  const ACCEPTED_EXTS = ['.jpg', '.jpeg', '.png'];

  function validateAndSet(selectedFile) {
    if (!selectedFile) return;
    if (!ACCEPTED_MIMES.includes(selectedFile.type)) {
      const lower = selectedFile.name.toLowerCase();
      if (!ACCEPTED_EXTS.some((ext) => lower.endsWith(ext))) {
        setError('Only JPG and PNG images are allowed.');
        return;
      }
    }
    setError('');
    const url = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(url);
    setShowModal(true);
    onChange && onChange(selectedFile);
  }

  function onInputChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    validateAndSet(f);
  }

  return (
    <div className='flex flex-col items-start gap-2 relative'>
      <div>
        <button
          type='button'
          className='bg-remedy-aqua px-4 py-2 rounded-full text-white text-xl font-semibold hover:cursor-pointer hover:bg-opacity-90 transition-all'
          onClick={() =>
            !disabled && inputRef.current && inputRef.current.click()
          }
        >
          Choose Image
        </button>
        <input
          ref={inputRef}
          type='file'
          accept=',.jpg,.jpeg,.png,image/jpeg,image/png'
          onChange={onInputChange}
          className='hidden'
        />
      </div>

      {error && (
        <p className='text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center backdrop-blur-md z-50'>
          <div className='bg-remedy-primary rounded-lg p-6 shadow-lg flex flex-col items-center'>
            {previewUrl && (
              <img
                src={previewUrl}
                alt='Selected preview'
                className='max-w-[300px] max-h-[300px] object-contain mb-4 rounded'
              />
            )}
            {analysisComplete ? (
              <button
                type='button'
                onClick={handleSubmit}
                className='bg-remedy-aqua px-4 py-2 rounded-full text-white text-xl font-semibold hover:cursor-pointer hover:bg-opacity-90 transition-all'
              >
                {isSaving ? 'Saving...' : 'Save Routine'}
              </button>
            ) : (
              <button
                type='button'
                onClick={handleClick}
                className='bg-remedy-aqua px-4 py-2 rounded-full text-white text-xl font-semibold hover:cursor-pointer hover:bg-opacity-90 transition-all'
              >
                Analyze
              </button>
            )}

            <button
              type='button'
              onClick={() => setShowModal(false)}
              className='mt-3 text-sm text-gray-600 hover:underline'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
