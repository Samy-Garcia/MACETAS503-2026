import { useState } from "react";
import { useNavigate } from "react-router";
import { GiftIcon } from "./Icons.jsx";
import Button from "./Button.jsx";

// Genera un código de descuento 
function buildCode(title) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(" ")[0]
    .toUpperCase();
  return `${slug}-${Math.floor(10 + Math.random() * 89)}-OFF`;
}

// Fecha de validez es 4 meses a partir de hoy
function buildValidUntil() {
  const date = new Date();
  date.setMonth(date.getMonth() + 4);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default function RedeemModal({ open, reward, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [code] = useState(() => (reward ? buildCode(reward.title) : ""));
  const [validUntil] = useState(buildValidUntil);

  if (!open || !reward) return null;

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
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-primary-800 text-white text-center px-6 py-8 relative">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-4 text-white/70 hover:text-white text-xl leading-none"
          >
            ×
          </button>
          <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
            <GiftIcon className="w-6 h-6" />
          </span>
          <h3 className="text-lg font-bold">Recompensa Canjeada</h3>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-6 text-center">
          <h4 className="text-xl font-bold text-primary-800">{reward.title}</h4>
          <p className="text-sm text-gray-500 mt-1">
            Válido hasta el <span className="font-semibold text-gray-700">{validUntil}</span>
          </p>

          {/* Código de descuento */}
          <div className="border border-dashed border-gray-300 rounded-xl p-4 mt-5">
            <span className="text-[11px] text-gray-400 uppercase tracking-wide">Código de Descuento</span>
            <p className="text-lg font-bold text-primary-800 tracking-wider mt-1">{code}</p>
            <button
              onClick={handleCopy}
              className="mt-2 text-xs font-semibold text-primary-700 border border-primary-200 rounded-full px-3 py-1 hover:bg-primary-50 transition-colors"
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>

          {/* Instrucciones */}
          <div className="text-left mt-5">
            <p className="text-sm font-semibold text-gray-700">¿Cómo usar mi cupón?</p>
            <p className="text-xs text-gray-500 mt-1">
              Copia el código y pégalo en la sección de "Checkout" antes de realizar tu pago.
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                onClose();
                navigate("/");
              }}
            >
              Ir a la Tienda
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Ver mis compras
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
