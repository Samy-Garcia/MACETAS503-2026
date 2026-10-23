import { useState, useRef } from 'react';

export const useCodeVerification = (length = 6, onSuccess, onError) => {
  const [code, setCode] = useState(Array(length).fill(''));
  const [error, setError] = useState('');
  const inputRefs = Array.from({ length }, () => useRef());

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < length - 1) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const verifyCode = (expectedCode) => {
    const verificationCode = code.join('');
    
    if (verificationCode === expectedCode) {
      setError('');
      if (onSuccess) onSuccess();
      return true;
    } else {
      setError('Código incorrecto');
      if (onError) onError();
      return false;
    }
  };

  const resetCode = () => {
    setCode(Array(length).fill(''));
    setError('');
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  };

  return {
    code,
    error,
    inputRefs,
    handleChange,
    handleKeyDown,
    verifyCode,
    resetCode,
    setError
  };
};