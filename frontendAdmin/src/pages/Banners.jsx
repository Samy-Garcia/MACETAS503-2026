import React from 'react';
import Sidebar from '../components/Sidebar';
import AddBannerModal from '../components/AddBannerModal';
import { useCrud } from '../hooks/useCrud';
import { useToast } from '../hooks/useToast';
import { getAnnouncementBars, createAnnouncementBar, updateAnnouncementBar, deleteAnnouncementBar } from '../api/announcementBarApi';
import usePageTitle from '../hooks/usePageTitle';

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const announcementBarApi = {
  getAll: getAnnouncementBars,
  create: createAnnouncementBar,
  update: updateAnnouncementBar,
  remove: deleteAnnouncementBar
};

const BannersPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);

  const {
    data,
    loading,
    error,
    showModal,
    editingItem,
    addItem,
    updateItem,
    deleteItem,
    openModal,
    closeModal
  } = useCrud(announcementBarApi);

  const handleSaveBanner = async (payload) => {
    try {
      if (editingItem) {
        await updateItem(editingItem._id, payload);
        showSuccess('Banner actualizado exitosamente');
      } else {
        await addItem(payload);
        showSuccess('Banner agregado exitosamente');
      }
    } catch (err) {
      showError(err.message || 'No se pudo guardar el banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este banner?')) {
      try {
        await deleteItem(id);
        showSuccess('Banner eliminado exitosamente');
      } catch (err) {
        showError(err.message || 'No se pudo eliminar el banner');
      }
    }
  };

  // Activar un banner es solo un update con active: true -- el backend se
  // encarga de desactivar todos los demás automáticamente.
  const handleActivar = async (item) => {
    try {
      await updateItem(item._id, { active: true });
      showSuccess(`"${item.text.slice(0, 30)}${item.text.length > 30 ? '...' : ''}" ahora es el banner activo`);
    } catch (err) {
      showError(err.message || 'No se pudo activar el banner');
    }
  };

  const handleDesactivar = async (item) => {
    try {
      await updateItem(item._id, { active: false });
      showSuccess('Banner desactivado');
    } catch (err) {
      showError(err.message || 'No se pudo desactivar el banner');
    }
  };

  return (
    <div className="flex h-screen bg-[#DCEIDA]">
      <Sidebar onLogout={onLogout} />

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-xl shadow-lg shadow-[#8E929B]/10 font-medium transition-all transform ${
              toast.type === 'success' ? 'bg-[#A4B8AC] text-white border-none' :
              toast.type === 'error' ? 'bg-[#ECB7B3] text-white border-none' :
              'bg-[#8E929B] text-white border-none'
            }`}
            style={{ minWidth: '280px' }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Banners</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-black/70">Administra los mensajes de la franja superior de la tienda</span>
              </div>
            </div>
            <button
              onClick={() => openModal(null)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ECB7B3] text-white rounded-xl text-sm font-medium uppercase tracking-wide hover:bg-[#A4B8AC] transition-all shadow-md shadow-[#ECB7B3]/30"
            >
              <span>+ Agregar banner</span>
            </button>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-[#DCEIDA] via-[#ECB7B3] to-[#DCEIDA] mt-4 opacity-50"></div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-[#ECB7B3]/20 text-black rounded-xl border border-[#ECB7B3]/30 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-black/50">Cargando banners...</div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-[#8E929B]/10 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#DCEIDA]/30 rounded-full flex items-center justify-center text-black/40">
              <MegaphoneIcon />
            </div>
            <p className="text-black/60">Todavía no has creado ningún banner.</p>
            <p className="text-black/40 text-sm mt-1">Mientras tanto, la tienda muestra un mensaje de respaldo genérico.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-lg shadow-[#8E929B]/10 hover:shadow-xl hover:shadow-[#8E929B]/20 transition-all overflow-hidden flex flex-col"
              >
                {/* Vista previa real, con los colores y la animación aplicados */}
                <div
                  className={`w-full text-center py-2.5 px-3 text-xs font-medium overflow-hidden ${
                    item.animation !== 'none' ? `anim-${item.animation}` : ''
                  }`}
                  style={{ backgroundColor: item.backgroundColor, color: item.textColor }}
                >
                  <span className={item.animation === 'marquee' ? 'inline-block whitespace-nowrap' : ''}>
                    {item.text}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col gap-3">
                  <p className="text-sm text-black font-medium line-clamp-2">{item.text}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      item.active ? 'bg-[#A4B8AC]/20 text-[#5f7568]' : 'bg-black/5 text-black/50'
                    }`}>
                      {item.active ? '● Activo' : 'Inactivo'}
                    </span>
                    {item.animation !== 'none' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#DCEIDA]/50 text-black/60">
                        {item.animation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-[#DCEIDA]/30 flex items-center justify-between gap-2">
                  {item.active ? (
                    <button
                      onClick={() => handleDesactivar(item)}
                      className="text-xs font-semibold text-black/60 hover:text-black transition-colors"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivar(item)}
                      className="text-xs font-semibold text-[#5f7568] hover:text-[#3f4f45] transition-colors"
                    >
                      Activar
                    </button>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(item)}
                      title="Editar"
                      className="p-2 text-[#8E929B] hover:bg-[#A4B8AC] hover:text-white rounded-xl transition-all"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Eliminar"
                      className="p-2 text-[#ECB7B3] hover:bg-[#ECB7B3] hover:text-white rounded-xl transition-all"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddBannerModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSaveBanner}
        editingItem={editingItem}
      />
    </div>
  );
};

export default BannersPage;
