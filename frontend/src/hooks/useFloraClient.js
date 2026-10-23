import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_URL = `${API_BASE_URL}/api/flora-client/chat`;

export const useFloraClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message, files = [], currentPage = null) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (message) {
        formData.append('message', message);
      }
      
      if (currentPage) {
        formData.append('currentPage', currentPage);
      }
      
      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error en el servidor');
      }

      return data.response;

    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
};