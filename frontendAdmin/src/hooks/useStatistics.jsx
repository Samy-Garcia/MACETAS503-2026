import { useState, useMemo } from 'react';

export const useStatistics = (initialData = []) => {
  const [filtro, setFiltro] = useState('todos');
  const [orden, setOrden] = useState('desc');

  const total = useMemo(() => {
    return initialData.reduce((sum, item) => sum + (item.valor || 0), 0);
  }, [initialData]);

  const promedio = useMemo(() => {
    return initialData.length > 0 ? total / initialData.length : 0;
  }, [total, initialData]);

  const maximo = useMemo(() => {
    return initialData.length > 0 ? Math.max(...initialData.map(item => item.valor || 0)) : 0;
  }, [initialData]);

  const minimo = useMemo(() => {
    return initialData.length > 0 ? Math.min(...initialData.map(item => item.valor || 0)) : 0;
  }, [initialData]);

  const datosOrdenados = useMemo(() => {
    const sorted = [...initialData];
    if (orden === 'desc') {
      sorted.sort((a, b) => (b.valor || 0) - (a.valor || 0));
    } else {
      sorted.sort((a, b) => (a.valor || 0) - (b.valor || 0));
    }
    return sorted;
  }, [initialData, orden]);

  const cambiarOrden = () => {
    setOrden(orden === 'desc' ? 'asc' : 'desc');
  };

  return {
    total,
    promedio,
    maximo,
    minimo,
    filtro,
    setFiltro,
    orden,
    setOrden,
    cambiarOrden,
    datosOrdenados
  };
};