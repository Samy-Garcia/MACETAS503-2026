import { useState } from "react";
import { useNavigate } from "react-router";
import { GiftIcon } from "./Icons.jsx";
import Button from "./Button.jsx";

// Válido 4 meses desde que se canjeó de verdad (no una fecha inventada).
// Se usa solo como fallback para cupones canjeados ANTES de que el backend
// empezara a guardar expiresAt; los nuevos ya traen la fecha real.
function buildValidUntil(redemption) {
  if (redemption.expiresAt) {
    return new Date(redemption.expiresAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }
  const date = redemption.createdAt ? new Date(redemption.createdAt) : new Date();
  date.setMonth(date.getMonth() + 4);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// redemption = lo que devuelve el backend al canjear: { title, code, type, createdAt, ... }
export default function RedeemModal({ open, redemption, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!open || !redemption) return null;

  const isExpired = redemption.status === "pending" && redemption.expiresAt && new Date() > new Date(redemption.expiresAt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redemption.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
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

        <div className="px-6 py-6 text-center">
          <h4 className="text-xl font-bold text-primary-800">{redemption.title}</h4>

          {redemption.code ? (
            <>
              <p className="text-sm text-gray-500 mt-1">
                {isExpired ? (
                  <span className="text-red-600 font-semibold">Este cupón venció el {buildValidUntil(redemption)}</span>
                ) : (
                  <>Válido hasta el <span className="font-semibold text-gray-700">{buildValidUntil(redemption)}</span></>
                )}
              </p>

              <div className="border border-dashed border-gray-300 rounded-xl p-4 mt-5">
                <span className="text-[11px] text-gray-400 uppercase tracking-wide">Código</span>
                <p className="text-lg font-bold text-primary-800 tracking-wider mt-1">{redemption.code}</p>
                <button
                  onClick={handleCopy}
                  className="mt-2 text-xs font-semibold text-primary-700 border border-primary-200 rounded-full px-3 py-1 hover:bg-primary-50 transition-colors"
                >
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="text-left mt-5">
                <p className="text-sm font-semibold text-gray-700">¿Cómo usar mi cupón?</p>
                <p className="text-xs text-gray-500 mt-1">
                  Copia el código y pégalo en el campo "Código de cupón" del Checkout antes de confirmar tu pedido.
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-3">
              Tu producto quedó registrado. Nos pondremos en contacto contigo para coordinar la entrega.
            </p>
          )}

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
            <Button variant="outline" className="w-full" onClick={() => { onClose(); navigate("/cupones"); }}>
              Ver mis cupones
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
