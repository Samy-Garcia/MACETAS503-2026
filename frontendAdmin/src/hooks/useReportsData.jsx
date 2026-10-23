import { useState, useEffect, useCallback, useMemo } from 'react';
import { getOrders } from '../api/ordersApi';

const DIAS_SEMANA = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const MESES_ABR = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const formatMoney = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const enRango = (dateStr, start, end) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (start && d < start) return false;
  if (end && d >= end) return false;
  return true;
};

// Arma las "barras" del gráfico de resumen según el periodo elegido en el select.
const buildBuckets = (periodo, now) => {
  if (periodo === 'Semana') {
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      buckets.push({ label: DIAS_SEMANA[start.getDay()], start, end });
    }
    return buckets;
  }

  if (periodo === 'Año') {
    const buckets = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({ label: MESES_ABR[start.getMonth()], start, end });
    }
    return buckets;
  }

  // Mes (default): últimas 4 semanas de 7 días cada una
  const buckets = [];
  for (let i = 3; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    buckets.push({ label: `Sem ${4 - i}`, start, end });
  }
  return buckets;
};

// Rango total del periodo actual y del periodo anterior equivalente (para % de cambio).
const getRangoTotal = (periodo, now) => {
  if (periodo === 'Semana') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 7);
    return { start, end: null, prevStart, prevEnd: start };
  }
  if (periodo === 'Año') {
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - 1);
    const prevStart = new Date(start);
    prevStart.setFullYear(prevStart.getFullYear() - 1);
    return { start, end: null, prevStart, prevEnd: start };
  }
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 30);
  return { start, end: null, prevStart, prevEnd: start };
};

export const useReportsData = () => {
  const [periodo, setPeriodo] = useState('Mes');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      // "No hay órdenes registradas" (404) = el negocio no tiene ventas
      // todavía; lo tratamos como lista vacía, no como un error real.
      if (/no hay/i.test(err.message || '')) {
        setOrders([]);
      } else {
        setError(err.message || 'No se pudieron cargar los reportes.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const now = useMemo(() => new Date(), []);

  const validOrders = useMemo(
    () => orders.filter(o => o.status !== 'Rechazado'),
    [orders]
  );

  const { start, end, prevStart, prevEnd } = useMemo(
    () => getRangoTotal(periodo, now),
    [periodo, now]
  );

  const periodOrders = useMemo(
    () => validOrders.filter(o => enRango(o.createdAt, start, end)),
    [validOrders, start, end]
  );
  const prevPeriodOrders = useMemo(
    () => validOrders.filter(o => enRango(o.createdAt, prevStart, prevEnd)),
    [validOrders, prevStart, prevEnd]
  );

  const stats = useMemo(() => {
    const totalActual = periodOrders.reduce((s, o) => s + (o.total || 0), 0);
    const totalAnterior = prevPeriodOrders.reduce((s, o) => s + (o.total || 0), 0);
    const cantidadActual = periodOrders.length;
    const cantidadAnterior = prevPeriodOrders.length;
    const promedioActual = cantidadActual > 0 ? totalActual / cantidadActual : 0;
    const promedioAnterior = cantidadAnterior > 0 ? totalAnterior / cantidadAnterior : 0;

    const crecimientoVentas = pctChange(totalActual, totalAnterior);
    const crecimientoPromedio = pctChange(promedioActual, promedioAnterior);
    const crecimientoTransacciones = pctChange(cantidadActual, cantidadAnterior);

    const periodLabel =
      periodo === 'Semana' ? 'vs semana anterior' :
      periodo === 'Año' ? 'vs año anterior' : 'vs mes anterior';

    return [
      {
        label: 'Total Vendido',
        value: formatMoney(totalActual),
        percentage: fmtPct(crecimientoVentas),
        trend: crecimientoVentas >= 0 ? 'up' : 'down',
        period: periodLabel
      },
      {
        label: 'Valor Promedio',
        value: formatMoney(promedioActual),
        percentage: fmtPct(crecimientoPromedio),
        trend: crecimientoPromedio >= 0 ? 'up' : 'down',
        period: periodLabel
      },
      {
        label: 'Total de Transacciones',
        value: String(cantidadActual),
        percentage: fmtPct(crecimientoTransacciones),
        trend: crecimientoTransacciones >= 0 ? 'up' : 'down',
        period: periodLabel
      },
      {
        label: 'Índice de Crecimiento',
        value: fmtPct(crecimientoVentas),
        percentage: fmtPct(crecimientoVentas),
        trend: crecimientoVentas >= 0 ? 'up' : 'down',
        period: periodLabel
      }
    ];
  }, [periodOrders, prevPeriodOrders, periodo]);

  const datosGrafico = useMemo(() => {
    const buckets = buildBuckets(periodo, now);
    return buckets.map(b => {
      const total = periodOrders
        .filter(o => enRango(o.createdAt, b.start, b.end))
        .reduce((s, o) => s + (o.total || 0), 0);
      return { label: b.label, value: Number(total.toFixed(2)) };
    });
  }, [periodOrders, periodo, now]);

  const totalVentas = useMemo(() => {
    const total = periodOrders.reduce((s, o) => s + (o.total || 0), 0);
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [periodOrders]);

  const ventasPorCategoria = useMemo(() => {
    const totales = { maceta: 0, vela: 0, planta: 0 };

    periodOrders.forEach(order => {
      (order.products || []).forEach(item => {
        if (item.productType in totales) {
          totales[item.productType] += item.subtotal || 0;
        }
      });
    });

    const totalGeneral = totales.maceta + totales.vela + totales.planta;
    const etiquetas = { maceta: 'Macetas', vela: 'Velas', planta: 'Plantas' };

    const detalle = Object.entries(totales)
      .filter(([, monto]) => monto > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([tipo, monto]) => ({
        name: etiquetas[tipo],
        label: `${totalGeneral > 0 ? Math.round((monto / totalGeneral) * 100) : 0}%`,
        monto
      }));

    return detalle.length > 0 ? detalle : [{ name: 'Sin ventas todavía', label: '0%', monto: 0 }];
  }, [periodOrders]);

  const totalVentasCategoria = useMemo(
    () => formatMoney(ventasPorCategoria.reduce((s, c) => s + c.monto, 0)),
    [ventasPorCategoria]
  );

  const productoMasVendido = useMemo(() => {
    const agg = {};
    periodOrders.forEach(order => {
      (order.products || []).forEach(item => {
        const nombre = item.product?.name || 'Producto eliminado';
        agg[nombre] = (agg[nombre] || 0) + (item.quantity || 0);
      });
    });

    const entradas = Object.entries(agg).sort((a, b) => b[1] - a[1]);
    if (entradas.length === 0) {
      return { nombre: 'Sin ventas todavía', datos: [] };
    }
    const [nombreTop] = entradas[0];

    const buckets = buildBuckets(periodo, now);
    const cantidadesPorBucket = buckets.map(b => {
      let cantidad = 0;
      periodOrders
        .filter(o => enRango(o.createdAt, b.start, b.end))
        .forEach(order => {
          (order.products || []).forEach(item => {
            if ((item.product?.name || 'Producto eliminado') === nombreTop) {
              cantidad += item.quantity || 0;
            }
          });
        });
      return { dia: b.label, valor: cantidad };
    });

    const maxCantidad = Math.max(...cantidadesPorBucket.map(c => c.valor), 1);

    return {
      nombre: nombreTop,
      datos: cantidadesPorBucket.map(c => ({
        dia: c.dia,
        valor: c.valor,
        porcentaje: Math.round((c.valor / maxCantidad) * 100)
      }))
    };
  }, [periodOrders, periodo, now]);

  // Distribución de ventas en bloques de 2 horas (0h, 2h, 4h... 22h) según
  // la hora real (createdAt) de cada orden dentro del periodo seleccionado.
  const patronesPorHora = useMemo(() => {
    const bloques = 12;
    const totalesPorBloque = Array.from({ length: bloques }, () => 0);

    periodOrders.forEach(order => {
      if (!order.createdAt) return;
      const hora = new Date(order.createdAt).getHours();
      const bloque = Math.min(Math.floor(hora / 2), bloques - 1);
      totalesPorBloque[bloque] += order.total || 0;
    });

    return totalesPorBloque.map((valor, i) => ({
      label: `${i * 2}h`,
      value: Number(valor.toFixed(2))
    }));
  }, [periodOrders]);

  return {
    stats,
    ventasPorCategoria,
    totalVentasCategoria,
    datosGrafico,
    productoMasVendido,
    totalVentas,
    patronesPorHora,
    periodo,
    setPeriodo,
    loading,
    error,
    refetch: fetchOrders
  };
};
