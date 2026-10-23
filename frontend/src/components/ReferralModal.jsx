import { useState } from "react";
import { Link } from "react-router";
import { GiftIcon } from "./Icons.jsx";
import Button from "./Button.jsx";

// Muestra el código de referido REAL del cliente (viene del backend, no se
// inventa uno nuevo cada vez). Las 200 hojas se pagan solas cuando su
// referido haga su primer pedido real — no hay botón de "Confirmar".
export default function ReferralModal({ open, onClose, code }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-primary-800 text-white text-center px-6 py-8">
          <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
            <GiftIcon className="w-6 h-6" />
          </span>
          <h3 className="text-lg font-bold">Tu Código de Referido</h3>
        </div>

        <div className="px-6 py-6 text-center">
          <p className="text-primary-700 font-semibold">Gana 200 hojas por cada amigo</p>
          <p className="text-sm text-gray-500 mt-1">
            Se acreditan solas apenas tu amigo haga su primera compra usando tu código al registrarse.
          </p>

          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mt-5">
            <span className="text-[11px] text-primary-700 font-semibold uppercase tracking-wide">
              Tu Código Personal
            </span>
            <p className="text-xl font-bold text-primary-800 tracking-wider mt-1">{code || '...'}</p>
            <button
              onClick={handleCopy}
              disabled={!code}
              className="mt-3 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors disabled:opacity-50"
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>

          <div className="mt-6">
            <Button variant="primary" className="w-full" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-center text-xs text-gray-500">
          <Link to="/historial" onClick={onClose} className="text-primary-700 font-semibold hover:underline">
            Ver historial de referidos
          </Link>
        </div>
      </div>
    </div>
  );
}
