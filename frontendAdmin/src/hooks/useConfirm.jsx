import React, { useState, useCallback } from 'react';

// Modal de confirmación con el mismo estilo visual del resto del admin, en
// vez del popup feo y genérico de window.confirm() del navegador.
const ConfirmModal = ({ message, confirmText, cancelText, danger, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[100] overflow-y-auto">
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#8E929B]/20 w-full max-w-sm p-6">
        <p className="text-black text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-[#DCEIDA]/30 rounded-xl text-black hover:bg-[#FBE0D9] hover:border-[#ECB7B3] transition-all font-medium text-sm"
          >
            {cancelText || 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-all shadow-md ${
              danger ? 'bg-[#ECB7B3] hover:bg-red-400 shadow-[#ECB7B3]/30' : 'bg-[#A4B8AC] hover:bg-[#8E929B] shadow-[#8E929B]/20'
            }`}
          >
            {confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Reemplazo de window.confirm() con la misma forma de usarlo (se espera la
// respuesta), pero con un modal propio en vez del popup feo del navegador.
//
// Uso:
//   const { confirm, ConfirmDialog } = useConfirm();
//   ...
//   const handleEliminar = async () => {
//     const ok = await confirm('¿Estás seguro de eliminar esto?');
//     if (!ok) return;
//     // ...continuar con el borrado
//   };
//   ...
//   return (
//     <div>
//       {ConfirmDialog}
//       ...resto del JSX...
//     </div>
//   );
export function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({ message, options, resolve });
    });
  }, []);

  const handle = (result) => {
    state?.resolve(result);
    setState(null);
  };

  const ConfirmDialog = state ? (
    <ConfirmModal
      message={state.message}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
      danger={state.options.danger !== false}
      onConfirm={() => handle(true)}
      onCancel={() => handle(false)}
    />
  ) : null;

  return { confirm, ConfirmDialog };
}
