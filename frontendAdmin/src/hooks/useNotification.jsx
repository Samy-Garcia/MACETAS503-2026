import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });

    // Auto ocultar después de 3 segundos
    setTimeout(() => {
      hideNotification();
    }, 3000);
  };

  const hideNotification = () => {
    setNotification({
      show: false,
      message: '',
      type: 'info'
    });
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess: (msg) => showNotification(msg, 'success'),
    showError: (msg) => showNotification(msg, 'error'),
    showWarning: (msg) => showNotification(msg, 'warning'),
    showInfo: (msg) => showNotification(msg, 'info')
  };
};