import React, { useState, useEffect } from 'react';
import { getPosts } from '../api/postApi';
import { getCandles } from '../api/candlesApi';
import { getPlants } from '../api/plantsApi';
import { getOthers } from '../api/othersApi';

const TABS = [
  { key: 'maceta', label: 'Macetas', loader: getPosts },
  { key: 'vela', label: 'Velas', loader: getCandles },
  { key: 'planta', label: 'Plantas', loader: getPlants },
  { key: 'otro', label: 'Otros', loader: getOthers }
];

// Modal para armar un combo: campos normales (nombre, precio, stock,
// imágenes) más un selector de productos existentes de las 4 categorías
// para armar la lista de "incluye" del combo. A diferencia de las demás
// categorías, esto no reutiliza AddProductModal porque necesita este
// selector de productos, que no es un tipo de campo genérico.
const AddComboModal = ({ isOpen, onClose, onSave, title, buttonText, initialValues }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [items, setItems] = useState([]);

  const [activeTab, setActiveTab] = useState('maceta');
  const [catalogo, setCatalogo] = useState({ maceta: [], vela: [], planta: [], otro: [] });
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setName(initialValues?.name || '');
    setDescription(initialValues?.description || '');
    setPrice(initialValues?.price ?? '');
    setStock(initialValues?.stock ?? '');
    setImageFiles([]);
    setItems(initialValues?.items || []);
    setBusqueda('');
    setActiveTab('maceta');
    setError('');
  }, [isOpen, initialValues]);

  useEffect(() => {
    if (!isOpen) return;
    const cargarCatalogo = async () => {
      setLoadingCatalogo(true);
      try {
        const resultados = await Promise.all(TABS.map(t => t.loader()));
        const nuevo = {};
        TABS.forEach((t, i) => { nuevo[t.key] = resultados[i]; });
        setCatalogo(nuevo);
      } catch (err) {
        setError('No se pudo cargar el catálogo de productos');
      } finally {
        setLoadingCatalogo(false);
      }
    };
    cargarCatalogo();
  }, [isOpen]);

  if (!isOpen) return null;

  const agregarItem = (producto, productType) => {
    const yaExiste = items.some(it => it.productId === producto._id && it.productType === productType);
    if (yaExiste) return;
    setItems(prev => [...prev, {
      productType,
      productId: producto._id,
      productName: producto.name,
      quantity: 1
    }]);
  };

  const quitarItem = (productId, productType) => {
    setItems(prev => prev.filter(it => !(it.productId === productId && it.productType === productType)));
  };

  const cambiarCantidad = (productId, productType, cantidad) => {
    setItems(prev => prev.map(it =>
      (it.productId === productId && it.productType === productType)
        ? { ...it, quantity: Math.max(1, cantidad) }
        : it
    ));
  };

  const productosFiltrados = (catalogo[activeTab] || []).filter(p =>
    p.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !description.trim() || !price || stock === '') {
      setError('Nombre, descripción, precio y stock son obligatorios');
      return;
    }
    if (items.length === 0) {
      setError('Agrega al menos un producto al combo');
      return;
    }
    if (!initialValues && imageFiles.length === 0) {
      setError('Debes subir al menos una imagen');
      return;
    }

    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('price', price);
    fd.append('stock', stock);
    fd.append('items', JSON.stringify(items));
    imageFiles.forEach(file => fd.append('images', file));

    setSaving(true);
    try {
      await onSave(fd);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#8E929B]/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="border-b border-[#DCEIDA]/30 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-black">{title}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-[#ECB7B3]/20 text-black rounded-xl border border-[#ECB7B3]/30 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Combo Día de las Madres"
                  className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] bg-[#FBE0D9]/5 text-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-1.5">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] bg-[#FBE0D9]/5 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-1.5">Existencias</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] bg-[#FBE0D9]/5 text-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-1.5">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Escribe una descripción detallada..."
                className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] bg-[#FBE0D9]/5 text-black resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-1.5">
                Imágenes {initialValues && <span className="font-normal normal-case text-black/40">(déjalo vacío para conservar las actuales)</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-black/70"
              />
            </div>

            <div className="border-t border-[#DCEIDA]/30 pt-4">
              <label className="block text-sm font-semibold text-black mb-2">¿Qué incluye el combo?</label>

              {/* Lista de productos ya elegidos */}
              {items.length > 0 && (
                <div className="mb-4 space-y-2">
                  {items.map((it) => (
                    <div key={`${it.productType}-${it.productId}`} className="flex items-center gap-2 bg-[#FBE0D9]/10 rounded-xl px-3 py-2">
                      <span className="text-xs font-medium text-black/50 uppercase w-14 shrink-0">{it.productType}</span>
                      <span className="flex-1 text-sm text-black truncate">{it.productName}</span>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) => cambiarCantidad(it.productId, it.productType, Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-[#DCEIDA]/30 rounded-lg text-sm text-center"
                      />
                      <button
                        type="button"
                        onClick={() => quitarItem(it.productId, it.productType)}
                        className="text-[#ECB7B3] hover:text-red-500 text-xs font-semibold px-2"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selector: pestañas de categoría + búsqueda + lista */}
              <div className="border border-[#DCEIDA]/30 rounded-xl overflow-hidden">
                <div className="flex border-b border-[#DCEIDA]/30">
                  {TABS.map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`flex-1 py-2 text-xs font-semibold transition-all ${
                        activeTab === t.key ? 'bg-[#A4B8AC] text-white' : 'text-black/60 hover:bg-[#FBE0D9]/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="p-3">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full px-3 py-2 border border-[#DCEIDA]/30 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#A4B8AC]"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {loadingCatalogo ? (
                      <p className="text-xs text-black/40 text-center py-4">Cargando catálogo...</p>
                    ) : productosFiltrados.length === 0 ? (
                      <p className="text-xs text-black/40 text-center py-4">No se encontraron productos.</p>
                    ) : productosFiltrados.map(p => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => agregarItem(p, activeTab)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#FBE0D9]/20 transition-all text-left"
                      >
                        {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />}
                        <span className="flex-1 text-sm text-black truncate">{p.name}</span>
                        <span className="text-xs text-black/40">${p.price}</span>
                        <span className="text-[#A4B8AC] font-bold text-sm">+</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#DCEIDA]/30">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-[#DCEIDA]/30 rounded-xl text-black hover:bg-[#FBE0D9] hover:border-[#ECB7B3] transition-all font-medium uppercase tracking-wide"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#ECB7B3] text-white rounded-xl hover:bg-[#A4B8AC] transition-all font-medium uppercase tracking-wide shadow-md shadow-[#ECB7B3]/30 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddComboModal;
