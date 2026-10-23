import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronUp, ChevronDown, ImageOff, Star } from 'lucide-react';
import Footer from "../components/Footer";
import { getCandles } from "../api/candlesApi";
import { getOffers } from "../api/offersApi";

// Importaciones de Shadcn UI (Ajusta la ruta según tu configuración de alias)
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";

export default function CandlesPage() {

  useEffect(() => {
    document.title = "Velas | Macetas503";
  }, []);


  const navigate = useNavigate();

  // Estado para ocultar/mostrar la barra lateral por completo
  const [showFilters, setShowFilters] = useState(true);

  // Estados independientes para el colapso de cada sección
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isScentOpen, setIsScentOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [sortOrder, setSortOrder] = useState(null); // null | 'asc' | 'desc'
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedScents, setSelectedScents] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  useEffect(() => {
    const cargarVelas = async () => {
      setLoading(true);
      setError('');
      try {
        const [data, offersData] = await Promise.all([getCandles(), getOffers()]);
        setProducts(data);
        setOffers(offersData);

        const precios = data.map(p => Number(p.price) || 0);
        const techoReal = precios.length > 0 ? Math.ceil(Math.max(...precios)) : 20;
        setMaxPrice(techoReal);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las velas.');
      } finally {
        setLoading(false);
      }
    };
    cargarVelas();
  }, []);

  const availableSizes = useMemo(() => {
    const set = new Set();
    products.forEach(p => (p.sizes || []).forEach(s => set.add(s)));
    return Array.from(set);
  }, [products]);

  const availableScents = useMemo(() => {
    const set = new Set();
    products.forEach(p => (p.scents || []).forEach(s => set.add(s)));
    return Array.from(set);
  }, [products]);

  const availableColors = useMemo(() => {
    const map = new Map();
    products.forEach(p => (p.colorOptions || []).forEach(c => {
      if (c.name && !map.has(c.name)) map.set(c.name, c.hex);
    }));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  const precioMasAlto = useMemo(() => {
    const precios = products.map(p => Number(p.price) || 0);
    return precios.length > 0 ? Math.ceil(Math.max(...precios)) : 20;
  }, [products]);

  const offersByProductId = useMemo(() => {
    const map = new Map();
    offers.forEach(o => {
      if (o.productType === 'vela' && o.status && o.product) {
        map.set(String(o.productId), o);
      }
    });
    return map;
  }, [offers]);

  const toggleValue = (setter) => (value) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const toggleSize = toggleValue(setSelectedSizes);
  const toggleScent = toggleValue(setSelectedScents);
  const toggleColor = toggleValue(setSelectedColors);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedSizes.length > 0) {
      result = result.filter(p => (p.sizes || []).some(s => selectedSizes.includes(s)));
    }

    if (selectedScents.length > 0) {
      result = result.filter(p => (p.scents || []).some(s => selectedScents.includes(s)));
    }

    if (selectedColors.length > 0) {
      result = result.filter(p => (p.colorOptions || []).some(c => selectedColors.includes(c.name)));
    }

    if (onlyDiscount) {
      result = result.filter(p => offersByProductId.has(String(p._id)));
    }

    if (maxPrice !== null) {
      result = result.filter(p => Number(p.price) <= maxPrice);
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, selectedSizes, selectedScents, selectedColors, maxPrice, sortOrder, onlyDiscount, offersByProductId]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">

      {/* HERO BANNER */}
      <section className="bg-primary-700 text-white text-center py-12">
        <h1 className="text-4xl font-bold tracking-wide">Velas</h1>
      </section>

      {/* BARRA DE ACCIÓN INTERMEDIA */}
      <div className="max-w-7xl mx-auto px-4 pt-8 flex items-center justify-between">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-surface px-4 py-2 rounded-md border border-neutral-200 text-sm font-semibold text-primary-700 shadow-xs hover:bg-neutral-50 transition cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
        <span className="text-xs text-neutral-500 font-medium">
          {loading ? '...' : `${filteredProducts.length} Productos encontrados`}
        </span>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS */}
        <aside className={`text-sm transition-all duration-300 lg:col-span-1 
          ${showFilters ? "block opacity-100" : "hidden opacity-0 lg:hidden"}`}
        >
          <div className="bg-surface p-5 rounded-lg border border-neutral-100 shadow-xs space-y-6">
            
            {/* Ordenar Por */}
            <div>
              <h3 className="font-bold text-neutral-900 mb-3">Ordenar Por</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')}
                    className={`transition cursor-pointer ${sortOrder === 'asc' ? 'text-emerald-700 font-semibold' : 'text-neutral-600 hover:text-emerald-700'}`}
                  >
                    Precio Ascendente
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
                    className={`transition cursor-pointer ${sortOrder === 'desc' ? 'text-emerald-700 font-semibold' : 'text-neutral-600 hover:text-emerald-700'}`}
                  >
                    Precio Descendente
                  </button>
                </li>
              </ul>
            </div>

            <hr className="border-neutral-200" />

            {/* SECCIÓN TAMAÑO */}
            <Collapsible open={isSizeOpen} onOpenChange={setIsSizeOpen} className="space-y-2">
              <CollapsibleTrigger asChild>
                <button className="w-full flex justify-between items-center text-left font-bold text-neutral-900 cursor-pointer group">
                  <span className="group-hover:text-emerald-700 transition">Tamaño</span>
                  {isSizeOpen ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <ul className="space-y-2 text-neutral-600 pt-2">
                  {availableSizes.length > 0 ? availableSizes.map((size) => (
                    <li key={size} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="rounded border-neutral-300 accent-primary-700 cursor-pointer"
                      />
                      <label htmlFor={`size-${size}`} className="cursor-pointer normal-case">{size}</label>
                    </li>
                  )) : (
                    <li className="text-neutral-400 text-xs">Ninguna vela tiene tamaños configurados todavía.</li>
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <hr className="border-neutral-200" />

            {/* SECCIÓN AROMA */}
            <Collapsible open={isScentOpen} onOpenChange={setIsScentOpen} className="space-y-2">
              <CollapsibleTrigger asChild>
                <button className="w-full flex justify-between items-center text-left font-bold text-neutral-900 cursor-pointer group">
                  <span className="group-hover:text-emerald-700 transition">Aroma</span>
                  {isScentOpen ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <ul className="space-y-2 text-neutral-600 pt-2">
                  {availableScents.length > 0 ? availableScents.map((scent) => (
                    <li key={scent} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`scent-${scent}`}
                        checked={selectedScents.includes(scent)}
                        onChange={() => toggleScent(scent)}
                        className="rounded border-neutral-300 accent-primary-700 cursor-pointer"
                      />
                      <label htmlFor={`scent-${scent}`} className="cursor-pointer normal-case">{scent}</label>
                    </li>
                  )) : (
                    <li className="text-neutral-400 text-xs">Ninguna vela tiene aromas configurados todavía.</li>
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <hr className="border-neutral-200" />

            {/* SECCIÓN COLOR */}
            <Collapsible open={isColorOpen} onOpenChange={setIsColorOpen} className="space-y-2">
              <CollapsibleTrigger asChild>
                <button className="w-full flex justify-between items-center text-left font-bold text-neutral-900 cursor-pointer group">
                  <span className="group-hover:text-emerald-700 transition">Color</span>
                  {isColorOpen ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <ul className="space-y-2 text-neutral-600 pt-2">
                  {availableColors.length > 0 ? availableColors.map((color) => (
                    <li key={color.name} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`color-${color.name}`}
                        checked={selectedColors.includes(color.name)}
                        onChange={() => toggleColor(color.name)}
                        className="rounded border-neutral-300 accent-primary-700 cursor-pointer"
                      />
                      <span className="w-3 h-3 rounded-sm border border-neutral-300 shrink-0" style={{ backgroundColor: color.hex }} />
                      <label htmlFor={`color-${color.name}`} className="cursor-pointer normal-case">{color.name}</label>
                    </li>
                  )) : (
                    <li className="text-neutral-400 text-xs">Ninguna vela tiene colores configurados todavía.</li>
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <hr className="border-neutral-200" />

            {/* Precio */}
            <div>
              <h3 className="font-bold text-neutral-900 mb-3">Precio</h3>
              <input 
                type="range" 
                min="0" 
                max={precioMasAlto || 20} 
                className="w-full accent-primary-700 cursor-pointer" 
                value={maxPrice ?? precioMasAlto} 
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>$0</span>
                <span>${maxPrice ?? precioMasAlto}</span>
              </div>
            </div>

            <hr className="border-neutral-200" />

            {/* Con Descuento */}
            <div className="flex items-center justify-between">
              <label htmlFor="only-discount-vela" className="font-bold text-neutral-900 cursor-pointer">Con Descuento</label>
              <input
                type="checkbox"
                id="only-discount-vela"
                checked={onlyDiscount}
                onChange={(e) => setOnlyDiscount(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-primary-700 cursor-pointer"
              />
            </div>

            {(selectedSizes.length > 0 || selectedScents.length > 0 || selectedColors.length > 0 || sortOrder || onlyDiscount) && (
              <button
                onClick={() => {
                  setSelectedSizes([]);
                  setSelectedScents([]);
                  setSelectedColors([]);
                  setSortOrder(null);
                  setMaxPrice(precioMasAlto);
                  setOnlyDiscount(false);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <section className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 transition-all duration-300
          ${showFilters ? "col-span-1 lg:col-span-3" : "col-span-1 lg:col-span-4 lg:grid-cols-4"}`}
        >
          {filteredProducts.map((product) => {
            const offer = offersByProductId.get(String(product._id));

            return (
            <div
              key={product._id}
              onClick={() => navigate(`/detallevela/${product._id}`)}
              className="group relative flex flex-col bg-surface rounded-md overflow-hidden p-3 border border-neutral-100 hover:shadow-md transition cursor-pointer"
            >
              {offer && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full z-10">
                  -{offer.discountPercentage}%
                </div>
              )}

              <div className="relative aspect-square w-full bg-neutral-100 rounded-sm overflow-hidden mb-3 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                  />
                ) : null}
                <div
                  className="w-full h-full items-center justify-center text-neutral-300"
                  style={{ display: product.image ? 'none' : 'flex' }}
                >
                  <ImageOff size={40} />
                </div>
                {product.rating != null && (
                  <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[11px] font-bold text-neutral-800 shadow-xs z-10 flex items-center gap-1">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {product.rating.toFixed(1)}
                  </div>
                )}
              </div>

              <h4 className="text-sm font-semibold text-neutral-800 mb-1">{product.name}</h4>

              <div className="flex items-center gap-2 mt-auto">
                {offer ? (
                  <>
                    <span className="text-xs line-through text-neutral-400">${Number(product.price).toFixed(2)}</span>
                    <span className="text-sm font-bold text-red-600">${Number(offer.discountedPrice).toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-primary-700">${Number(product.price).toFixed(2)}</span>
                )}
              </div>
            </div>
            );
          })}

          {!loading && filteredProducts.length === 0 && !error && (
            <div className="col-span-full text-center text-neutral-500 py-12">
              {products.length === 0
                ? 'Todavía no hay velas registradas.'
                : 'Ninguna vela coincide con esos filtros.'}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
