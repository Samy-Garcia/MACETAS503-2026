import { useEffect, useState } from "react";
import { Link } from "react-router";
import { GiftIcon } from "./Icons.jsx";
import Button from "./Button.jsx";

// Genera un código personal de 8 dígitos al azar por prueba 
function buildCode() {
  return String(Math.floor(10000000 + Math.random() * 89999999));
}

export default function ReferralModal({ open, onClose, onConfirm }) {
  const [code, setCode] = useState(buildCode);
  const [copied, setCopied] = useState(false);

  // Cada vez que se abre el modal se genera un código nuevo 
  useEffect(() => {
    if (open) {
      setCode(buildCode());
      setCopied(false);
    }
  }, [open]);

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

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header verde */}
        <div className="bg-primary-800 text-white text-center px-6 py-8">
          <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
            <GiftIcon className="w-6 h-6" />
          </span>
          <h3 className="text-lg font-bold">Referido Exclusivo</h3>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-6 text-center">
          <p className="text-primary-700 font-semibold">Regala un 15% y Gana $10</p>
          <p className="text-sm text-gray-500 mt-1">Válido para amigos nuevos en su primera compra</p>

          {/* Código personal */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mt-5">
            <span className="text-[11px] text-primary-700 font-semibold uppercase tracking-wide">
              Tu Código Personal
            </span>
            <p className="text-xl font-bold text-primary-800 tracking-wider mt-1">{code}</p>
            <button
              onClick={handleCopy}
              className="mt-3 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold rounded-full px-4 py-2 transition-colors"
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" className="w-full" onClick={handleConfirm}>
              Confirmar
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
          <span>Crédito Acumulado: 200 hojas</span>
          <Link to="/historial" onClick={onClose} className="text-primary-700 font-semibold hover:underline">
            Ver historial
          </Link>
        </div>
      </div>
    </div>
  );
}
