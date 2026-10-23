import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff, Star } from 'lucide-react';
import Footer from "../components/Footer";
import { getCombos } from "../api/combosApi";

export default function CombosPage() {

  useEffect(() => {
    document.title = "Combos | Macetas503";
  }, []);

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState(null); // null | 'asc' | 'desc'

  useEffect(() => {
    const cargarCombos = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCombos();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los combos.');
      } finally {
        setLoading(false);
      }
    };
    cargarCombos();
  }, []);

  const sortedProducts = useMemo(() => {
    let result = [...products];
    if (sortOrder === 'asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return result;
  }, [products, sortOrder]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">

      {/* HERO BANNER */}
      <section className="bg-primary-700 text-white text-center py-12">
        <h1 className="text-4xl font-bold tracking-wide">Combos</h1>
        <p className="text-sm text-white/70 mt-2">Sets armados con varios productos, a un solo precio</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Ordenar:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')}
            className={`font-semibold ${sortOrder === 'asc' ? 'text-emerald-700' : 'text-neutral-600 hover:text-emerald-700'}`}
          >
            Precio ↑
          </button>
          <span className="text-neutral-300">|</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
            className={`font-semibold ${sortOrder === 'desc' ? 'text-emerald-700' : 'text-neutral-600 hover:text-emerald-700'}`}
          >
            Precio ↓
          </button>
        </div>
        <span className="text-xs text-neutral-500 font-medium">
          {loading ? '...' : `${sortedProducts.length} Combos encontrados`}
        </span>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/detallecombo/${product._id}`)}
              className="group relative flex flex-col bg-surface rounded-md overflow-hidden p-3 border border-neutral-100 hover:shadow-md transition cursor-pointer"
            >
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
                <span className="absolute top-2 left-2 bg-primary-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {(product.items || []).length} producto{(product.items || []).length !== 1 ? 's' : ''}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-neutral-800 mb-1">{product.name}</h4>

              <div className="flex items-center gap-2 mt-auto">
                <span className="text-sm font-bold text-primary-700">${Number(product.price).toFixed(2)}</span>
              </div>
            </div>
          ))}

          {!loading && sortedProducts.length === 0 && !error && (
            <div className="col-span-full text-center text-neutral-500 py-12">
              Todavía no hay combos armados.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
