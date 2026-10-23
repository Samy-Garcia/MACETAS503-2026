import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import { CartContext } from "../context/CartContext.jsx";
import { confirmarPago3DS } from "../api/wompiApi.js";

// Clave de sessionStorage donde Checkout deja los datos del pedido antes de
// mandar al cliente a la página del banco (3D Secure).
export const CLAVE_CHECKOUT_3DS = "macetas503_checkout_3ds";

// A esta página regresa Wompi después del 3D Secure (FRONTEND_URL/pago-3ds).
// No se confía en los parámetros de la URL: se le pregunta al backend, que a
// su vez consulta a Wompi, si el pago de verdad fue aprobado.
export default function Pago3DSResultado() {
  const navigate = useNavigate();
  const { checkout } = useContext(CartContext);
  const [error, setError] = useState("");
  const iniciado = useRef(false);

  useEffect(() => {
    document.title = "Verificando pago | Macetas503";
  }, []);

  useEffect(() => {
    // En desarrollo React ejecuta los efectos dos veces; esto evita crear el pedido doble.
    if (iniciado.current) return;
    iniciado.current = true;

    const terminar = async () => {
      let guardado = null;
      try {
        guardado = JSON.parse(sessionStorage.getItem(CLAVE_CHECKOUT_3DS) || "null");
      } catch {
        guardado = null;
      }

      const params = new URLSearchParams(window.location.search);
      const idTransaccion = params.get("idTransaccion") || guardado?.idTransaccion;

      if (!guardado || !idTransaccion) {
        setError("No encontramos un pago en proceso. Si ya pagaste, revisa tus pedidos antes de intentarlo de nuevo.");
        return;
      }

      try {
        const pago = await confirmarPago3DS(idTransaccion);
        if (!pago.aprobada) {
          sessionStorage.removeItem(CLAVE_CHECKOUT_3DS);
          setError(pago.mensaje || "El pago no fue aprobado. No se realizó ningún cobro.");
          return;
        }

        const order = await checkout({ ...guardado.checkout, wompiTransaccionId: idTransaccion });
        sessionStorage.removeItem(CLAVE_CHECKOUT_3DS);
        navigate("/confirmacion-orden", { state: { order }, replace: true });
      } catch (err) {
        setError(err.message || "No se pudo confirmar el pedido. Si el cobro se realizó, contáctanos con tu código de transacción: " + idTransaccion);
      }
    };

    terminar();
  }, [checkout, navigate]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 bg-page text-zinc-600 px-6 text-center">
      {error ? (
        <>
          <XCircle size={44} className="text-red-500" />
          <p className="max-w-md">{error}</p>
          <button
            onClick={() => navigate("/checkout")}
            className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold hover:bg-primary-800"
          >
            Volver al checkout
          </button>
        </>
      ) : (
        <>
          <Loader2 size={44} className="animate-spin text-primary-700" />
          <p className="font-semibold">Verificando tu pago...</p>
          <p className="text-sm text-zinc-500">No cierres ni recargues esta página.</p>
        </>
      )}
    </div>
  );
}
