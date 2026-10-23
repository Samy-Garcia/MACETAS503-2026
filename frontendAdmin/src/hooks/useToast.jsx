import { useState, useEffect } from 'react';

export const useToast = (duration = 3000) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'error', durationMs = duration) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration: durationMs }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, durationMs);
  };

  const showSuccess = (message, durationMs = duration) => {
    showToast(message, 'success', durationMs);
  };

  const showError = (message, durationMs = duration) => {
    showToast(message, 'error', durationMs);
  };

  const showWarning = (message, durationMs = duration) => {
    showToast(message, 'warning', durationMs);
  };

  const showInfo = (message, durationMs = duration) => {
    showToast(message, 'info', durationMs);
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts
  };
};