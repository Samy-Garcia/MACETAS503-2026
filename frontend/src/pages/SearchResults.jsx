import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchProducts } from "../api/productsApi";
import Footer from "../components/Footer";

// Cada tipo de producto tiene su propia página de detalle.
const rutaDetalle = (p) => {
  switch (p.productType) {
    case "maceta": return `/detalleproducto/${p._id}`;
    case "vela": return `/detallevela/${p._id}`;
    case "otro": return `/detalleotro/${p._id}`;
    case "combo": return `/detallecombo/${p._id}`;
    case "planta": return `/plantas-y-cuidados/${p._id}`;
    default: return "/";
  }
};

const ETIQUETA = {
  maceta: "Maceta",
  vela: "Vela",
  otro: "Otro",
  combo: "Combo",
  planta: "Planta",
};

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();

  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = q ? `Resultados para "${q}" | Macetas503` : "Buscar | Macetas503";
  }, [q]);

  useEffect(() => {
    if (q.length < 2) {
      setResultados([]);
      setError("");
      return;
    }
    let cancelado = false;
    setCargando(true);
    setError("");
    searchProducts(q)
      .then((data) => {
        if (!cancelado) setResultados(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelado) {
          setResultados([]);
          setError(err.message || "No se pudo realizar la búsqueda.");
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [q]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-page font-sans text-zinc-800">
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-primary-700 mb-1">
            {q ? `Resultados para "${q}"` : "Buscar productos"}
          </h1>

          {q.length < 2 && (
            <p className="text-zinc-500 mt-4">
              Escribe al menos 2 letras en el buscador para encontrar macetas, velas, plantas y más.
            </p>
          )}

          {cargando && <p className="text-zinc-500 mt-4">Buscando...</p>}
          {error && <p className="text-red-600 mt-4">{error}</p>}

          {!cargando && !error && q.length >= 2 && (
            <>
              <p className="text-sm text-zinc-500 mb-6">
                {resultados.length === 0
                  ? "No encontramos productos que coincidan con tu búsqueda."
                  : `${resultados.length} producto${resultados.length !== 1 ? "s" : ""} encontrado${resultados.length !== 1 ? "s" : ""}`}
              </p>

              {resultados.length === 0 ? (
                <div className="flex flex-wrap gap-3">
                  {[["/macetas", "Ver macetas"], ["/velas", "Ver velas"], ["/otros", "Ver otros"], ["/combos", "Ver combos"]].map(([to, txt]) => (
                    <Link key={to} to={to} className="px-4 py-2 border border-primary-700 text-primary-700 rounded-md text-sm font-semibold hover:bg-primary-700/5">
                      {txt}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resultados.map((p) => (
                    <Link
                      key={`${p.productType}-${p._id}`}
                      to={rutaDetalle(p)}
                      className="group border border-zinc-200 rounded-lg overflow-hidden bg-surface hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-zinc-100 overflow-hidden">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary-700">
                          {ETIQUETA[p.productType] || "Producto"}
                        </span>
                        <p className="font-semibold text-sm text-zinc-900 line-clamp-2">{p.name}</p>
                        <p className="text-sm font-bold mt-1">${Number(p.price).toFixed(2)}</p>
                        {p.stock <= 0 && <p className="text-xs text-red-600 mt-1">Agotado</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
