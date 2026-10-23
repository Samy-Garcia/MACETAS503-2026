import { useMemo } from 'react';

export const useChart = (data, valueKey = 'value', labelKey = 'label') => {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(item => item[valueKey]));
  }, [data, valueKey]);

  const calcularAltura = (value) => {
    // Si no hay ventas todavía, maxValue es 0: evitamos dividir por cero
    // y simplemente mostramos las barras en su altura mínima.
    if (!maxValue) return 0;
    return (value / maxValue) * 100;
  };

  const datosConAltura = useMemo(() => {
    return (data || []).map(item => ({
      ...item,
      altura: calcularAltura(item[valueKey])
    }));
  }, [data, maxValue, valueKey]);

  return {
    maxValue,
    calcularAltura,
    datosConAltura
  };
};
