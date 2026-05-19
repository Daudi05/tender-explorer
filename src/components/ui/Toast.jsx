import React, { useEffect } from 'react';

export const Toast = ({
  message,
  type = 'success', // success, error, warning, info
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: 'bg-green-600 text-white shadow-lg',
    error: 'bg-red-600 text-white shadow-lg',
    warning: 'bg-yellow-500 text-white shadow-lg',
    info: 'bg-blue-600 text-white shadow-lg'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl max-w-sm ${styles[type]}`}>
        <span className="text-sm font-semibold">{message}</span>
        <button onClick={onClose} className="focus:outline-none opacity-80 hover:opacity-100">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
