import { useState, useEffect, useCallback, useMemo } from 'react';
import { getOrders } from '../api/ordersApi';
import { getClients } from '../api/clientApi';
import { getPosts } from '../api/postApi';
import { getCandles } from '../api/candlesApi';
import { getPlants } from '../api/plantsApi';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Opciones que arma el botón "Últimos 30 días". 'kind' numérico = ventana
// móvil de N días; 'month' = mes calendario actual; 'all' = sin filtro.
export const RANGE_OPTIONS = [
  { label: 'Últimos 7 días', kind: 7 },
  { label: 'Últimos 30 días', kind: 30 },
  { label: 'Últimos 90 días', kind: 90 },
  { label: 'Este mes', kind: 'month' },
  { label: 'Todo el tiempo', kind: 'all' }
];

const formatFecha = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return `${MESES[d.getMonth()]} ${d.getDate()}`;
};

const formatMoney = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Calcula el período activo y el período previo equivalente (para el % de cambio)
// a partir de la opción elegida en el dropdown.
const getPeriodo = (option, now) => {
  if (option.kind === 'all') {
    return { start: null, end: null, prevStart: null, prevEnd: null };
  }

  if (option.kind === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const prevEnd = start;
    return { start, end: null, prevStart, prevEnd };
  }

  const dias = option.kind;
  const start = new Date(now.getTime() - dias * 24 * 60 * 60 * 1000);
  const prevStart = new Date(start.getTime() - dias * 24 * 60 * 60 * 1000);
  return { start, end: null, prevStart, prevEnd: start };
};

const enRango = (dateStr, start, end) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (start && d < start) return false;
  if (end && d >= end) return false;
  return true;
};

const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

export const useDashboardData = () => {
  const [timeRange, setTimeRange] = useState('Últimos 30 días');

  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersResult, clientsResult, postsResult, candlesResult, plantsResult] =
        await Promise.allSettled([
          getOrders(),
          getClients(),
          getPosts(),
          getCandles(),
          getPlants()
        ]);

      // getOrders responde 404 ("No hay órdenes registradas") cuando el
      // negocio todavía no tiene ninguna orden confirmada; ese caso puntual
      // lo tratamos como lista vacía en lugar de un error real.
      const ordersFueVacio = ordersResult.status === 'rejected'
        && /no hay/i.test(ordersResult.reason?.message || '');
      setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value : []);
      setClients(clientsResult.status === 'fulfilled' ? clientsResult.value : []);

      const totalCatalogo =
        (postsResult.status === 'fulfilled' ? postsResult.value.length : 0) +
        (candlesResult.status === 'fulfilled' ? candlesResult.value.length : 0) +
        (plantsResult.status === 'fulfilled' ? plantsResult.value.length : 0);
      setProductCount(totalCatalogo);

      const fallasReales = [clientsResult, postsResult, candlesResult, plantsResult]
        .some(r => r.status === 'rejected')
        || (ordersResult.status === 'rejected' && !ordersFueVacio);
      if (fallasReales) {
        setError('Algunos datos del panel no se pudieron cargar por completo.');
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar el panel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const now = useMemo(() => new Date(), []);

  const selectedOption = useMemo(
    () => RANGE_OPTIONS.find(o => o.label === timeRange) || RANGE_OPTIONS[1],
    [timeRange]
  );

  const { start, end, prevStart, prevEnd } = useMemo(
    () => getPeriodo(selectedOption, now),
    [selectedOption, now]
  );

  // No contamos las órdenes rechazadas como ventas reales, y filtramos
  // por el rango de fechas elegido en el dropdown.
  const validOrders = useMemo(
    () => orders.filter(o => o.status !== 'Rechazado'),
    [orders]
  );

  const periodOrders = useMemo(
    () => validOrders.filter(o => enRango(o.createdAt, start, end)),
    [validOrders, start, end]
  );

  const prevPeriodOrders = useMemo(
    () => (prevStart ? validOrders.filter(o => enRango(o.createdAt, prevStart, prevEnd)) : []),
    [validOrders, prevStart, prevEnd]
  );

  const stats = useMemo(() => {
    const totalVendido = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const vendidoAnterior = prevPeriodOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const clientesPeriodo = clients.filter(c => enRango(c.createdAt, start, end)).length;
    const clientesAnterior = prevStart
      ? clients.filter(c => enRango(c.createdAt, prevStart, prevEnd)).length
      : 0;

    const sinComparacion = !prevStart;

    return {
      totalVendido: {
        value: formatMoney(totalVendido),
        percentage: sinComparacion ? 'Histórico total' : pctChange(totalVendido, vendidoAnterior)
      },
      totalOrdenes: {
        value: String(periodOrders.length),
        percentage: sinComparacion ? 'Histórico total' : pctChange(periodOrders.length, prevPeriodOrders.length)
      },
      totalProductos: {
        value: String(productCount),
        percentage: 'En catálogo'
      },
      totalClientes: {
        value: String(clients.length),
        percentage: sinComparacion ? 'Histórico total' : pctChange(clientesPeriodo, clientesAnterior)
      }
    };
  }, [periodOrders, prevPeriodOrders, clients, productCount, start, end, prevStart, prevEnd]);

  const recentOrders = useMemo(() => {
    return [...periodOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(o => ({
        id: o._id,
        product: o.product,
        fecha: formatFecha(o.createdAt),
        estatus: o.status,
        precio: Number(o.total || 0).toFixed(2)
      }));
  }, [periodOrders]);

  const topProducts = useMemo(() => {
    const agg = {};

    periodOrders.forEach(order => {
      (order.products || []).forEach(item => {
        const nombre = item.product?.name || 'Producto eliminado';
        const key = item.product?._id || nombre;

        if (!agg[key]) {
          agg[key] = { id: key, product: nombre, cantidad: 0, ingresos: 0, ultimaFecha: order.createdAt };
        }
        agg[key].cantidad += item.quantity || 0;
        agg[key].ingresos += item.subtotal || 0;
        if (new Date(order.createdAt) > new Date(agg[key].ultimaFecha)) {
          agg[key].ultimaFecha = order.createdAt;
        }
      });
    });

    return Object.values(agg)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        product: p.product,
        fecha: formatFecha(p.ultimaFecha),
        estatus: `${p.cantidad} vendidos`,
        precio: Number(p.ingresos).toFixed(2)
      }));
  }, [periodOrders]);

  const ventasCategoria = useMemo(() => {
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
      .map(([tipo, monto]) => {
        const pct = totalGeneral > 0 ? Math.round((monto / totalGeneral) * 100) : 0;
        return { label: etiquetas[tipo], percentage: `${pct}%`, width: `${pct}%` };
      });

    return {
      total: formatMoney(totalGeneral),
      detalle: detalle.length > 0 ? detalle : [{ label: 'Sin ventas todavía', percentage: '0%', width: '0%' }]
    };
  }, [periodOrders]);

  return {
    topProducts,
    recentOrders,
    stats,
    ventasCategoria,
    timeRange,
    setTimeRange,
    rangeOptions: RANGE_OPTIONS.map(o => o.label),
    loading,
    error,
    refetch: fetchAll
  };
};
