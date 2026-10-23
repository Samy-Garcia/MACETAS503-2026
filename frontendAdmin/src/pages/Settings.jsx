import React, { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FotoPerfil from '../assets/Logo.png';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  toggleAdminTwoFA
} from '../api/adminApi';
import { getConfig, updateShippingConfig, updateSocialMediaConfig, updateThemeConfig, updateThemeLogo, removeThemeLogo, addHeroImages, removeHeroImage, reorderHeroImages, updateHeroImageText, addPickupLocation, updatePickupLocation, removePickupLocation } from '../api/config.js';
import StoreLocationMap from '../components/StoreLocationMap';
import usePageTitle from '../hooks/usePageTitle';
import { blockNonLetters, blockNegative } from '../utils/inputValidation';
import { useCrud } from '../hooks/useCrud';
import AddBannerModal from '../components/AddBannerModal';
import EditHeroImageModal from '../components/EditHeroImageModal';
import { getAnnouncementBars, createAnnouncementBar, updateAnnouncementBar, deleteAnnouncementBar } from '../api/announcementBarApi';
import { FESTIVOS } from '../utils/festivos.js';

/* ─────────────────────────────────────────────────────────────
   Estilos locales (misma serif y animaciones del resto del panel)
   ───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

  .m503-serif {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }

  @keyframes m503-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
  .m503-fade-up { animation: m503-fade-up .55s cubic-bezier(.22,1,.36,1) both; }

  @keyframes m503-pop {
    from { opacity: 0; transform: translateY(8px) scale(.98); }
    to   { opacity: 1; transform: none; }
  }
  .m503-pop { animation: m503-pop .3s cubic-bezier(.22,1,.36,1) both; }

  .m503-scroll { scrollbar-width: thin; scrollbar-color: #D3E6DA transparent; }
  .m503-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .m503-scroll::-webkit-scrollbar-thumb { background: #D3E6DA; border-radius: 9999px; }
  .m503-scroll::-webkit-scrollbar-track { background: transparent; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up, .m503-pop { animation: none; }
  }
`;

// lucide-react no trae íconos de Instagram/Facebook/TikTok (son logos de
// marca, no íconos genéricos de interfaz -- de hecho Facebook ni siquiera
// existe ya en esta versión de la librería), así que los 3 se dibujan a
// mano con el mismo tamaño/estilo que los demás.
const IconoInstagram = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconoFacebook = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </svg>
);

const IconoTikTok = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
  </svg>
);

const CameraIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const SaveIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const PlusIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14M5 12h14" />
  </svg>
);

const AlertIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const emailPattern = /^\S+@\S+\.\S+$/;

// --- Contraste de color (fórmula WCAG) -- se usa para avisar si el admin
// elige colores que casi no se distinguen entre sí (texto ilegible). No
// bloquea el guardado, solo pide confirmación extra en ese caso.
const luminanciaRelativa = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const canal = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [R, G, B] = [r, g, b].map(canal);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const contraste = (hexA, hexB) => {
  const L1 = luminanciaRelativa(hexA);
  const L2 = luminanciaRelativa(hexB);
  const [claro, oscuro] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (claro + 0.05) / (oscuro + 0.05);
};

const emptyProfile = {
  nombre: '',
  email: '',
  twoFA: false
};

const emptyShipping = {
  storeLat: null,
  storeLng: null,
  pricePerKm: '',
  shippingMode: 'perKm',
  fixedShippingCost: '',
  freeShippingMinAmount: ''
};

// Definido a nivel de módulo (fuera del componente) a propósito: si se
// define adentro, se crea un objeto NUEVO en cada render, lo que invalida
// la memoria interna de useCrud (useCallback depende de esta referencia) y
// causa que vuelva a pedir los datos sin parar -- exactamente el bug que
// mandó la app a un bucle infinito y agotó el límite de 200 peticiones/5min.
const announcementBarApi = {
  getAll: getAnnouncementBars,
  create: createAnnouncementBar,
  update: updateAnnouncementBar,
  remove: deleteAnnouncementBar
};

/* ─────────────────────────────────────────────────────────────
   Piezas visuales (a nivel de módulo, para que no se re-creen en
   cada render y los inputs no pierdan el foco al escribir)
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const inputClass =
  'w-full px-4 py-2.5 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 text-sm placeholder:text-gray-400';

const labelClass = 'block text-sm font-semibold text-gray-900 mb-1';
const hintClass = 'text-xs text-gray-500 mb-3';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed whitespace-nowrap';

const btnGhost =
  'inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-[#F2F6F3] text-gray-700 text-sm font-medium hover:bg-[#E6F2EA] hover:text-[#1E3B2F] transition-all disabled:opacity-50 whitespace-nowrap';

const btnSmall =
  'inline-flex items-center justify-center px-3 h-8 rounded-full text-xs font-semibold transition-all disabled:opacity-50';

const optionBtn = (active) =>
  `px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl border-2 transition-all ${
    active
      ? 'bg-[#1E3B2F] text-white border-transparent shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)]'
      : 'bg-[#F2F6F3] text-gray-600 border-transparent hover:bg-[#E6F2EA] hover:text-[#1E3B2F]'
  }`;

const Section = ({ title, aside, description, delay = '0s', children }) => (
  <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: delay }}>
    <div className="px-4 sm:px-6 py-4 border-b border-[#EEF4F0] bg-[#F5FAF7]/60">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-bold text-[#1E3B2F]">{title}</h3>
        {aside}
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
    <div className="p-4 sm:p-6 space-y-5">{children}</div>
  </div>
);

const Pill = ({ children }) => (
  <span className="text-xs font-medium text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1 rounded-full">{children}</span>
);

const Toggle = ({ checked, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 disabled:opacity-60 ${
      checked ? 'bg-[#4F8A6B]' : 'bg-[#D3E6DA]'
    }`}
  >
    <span
      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
        checked ? 'translate-x-7' : ''
      }`}
    />
  </button>
);

const ToggleRow = ({ title, description, checked, onClick, disabled }) => (
  <div className="flex items-center justify-between gap-3 p-4 bg-[#F5FAF7] rounded-2xl border border-[#EEF4F0]">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <Toggle checked={checked} onClick={onClick} disabled={disabled} />
  </div>
);

const ColorField = ({ label, hint, value, onChange, placeholder }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <p className={hintClass}>{hint}</p>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="w-12 h-11 rounded-2xl border-2 border-[#EEF4F0] cursor-pointer bg-transparent p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} flex-1 uppercase`}
      />
    </div>
  </div>
);

const MoneyInput = (props) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
    <input type="number" step="0.01" min="0" className={`${inputClass} pl-8`} {...props} />
  </div>
);

const SettingsPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();
  const fileInputRef = useRef(null);

  // --- Banners del inicio (texto, colores, animación, cuál está activo) ---
  const {
    data: banners,
    loading: loadingBanners,
    showModal: showBannerModal,
    editingItem: editingBanner,
    addItem: addBanner,
    updateItem: updateBannerItem,
    deleteItem: deleteBannerItem,
    openModal: openBannerModal,
    closeModal: closeBannerModal
  } = useCrud(announcementBarApi);

  const [formData, setFormData] = useState(emptyProfile);
  const [lastSaved, setLastSaved] = useState(emptyProfile);
  const [fotoUrl, setFotoUrl] = useState(FotoPerfil);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updatingTwoFA, setUpdatingTwoFA] = useState(false);

  // --- Envío (ubicación de tienda + modo de cobro + envío gratis) ---
  const [configId, setConfigId] = useState(null);
  const [shippingForm, setShippingForm] = useState(emptyShipping);
  const [lastSavedShipping, setLastSavedShipping] = useState(emptyShipping);
  const [loadingShipping, setLoadingShipping] = useState(true);
  const [savingShipping, setSavingShipping] = useState(false);

  // --- Redes sociales oficiales de la tienda (no del admin individual) ---
  const emptySocialMedia = { instagram: '', facebook: '', tiktok: '' };
  const [socialMediaForm, setSocialMediaForm] = useState(emptySocialMedia);
  const [lastSavedSocialMedia, setLastSavedSocialMedia] = useState(emptySocialMedia);
  const [savingSocialMedia, setSavingSocialMedia] = useState(false);

  // --- Apariencia del sitio (color de marca, logo, modo oscuro) ---
  const emptyTheme = { primaryColor: '#064225', backgroundColor: '#fcfdfc', surfaceColor: '#ffffff', darkMode: false, mode: 'default', festivoKey: '' };
  const [themeForm, setThemeForm] = useState(emptyTheme);
  const [lastSavedTheme, setLastSavedTheme] = useState(emptyTheme);
  const [savingTheme, setSavingTheme] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const logoInputRef = useRef(null);

  // --- Carrusel de imágenes del inicio ---
  const [heroImages, setHeroImages] = useState([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [removingHeroId, setRemovingHeroId] = useState(null);
  const [reorderingHero, setReorderingHero] = useState(false);
  const [editingHeroImage, setEditingHeroImage] = useState(null);

  // Puntos de recogida en tienda (direcciones donde el cliente puede pasar a
  // recoger su pedido cuando la emprendedora no puede llevarlo a domicilio)
  const [pickupLocations, setPickupLocations] = useState([]);
  const [pickupForm, setPickupForm] = useState({ name: '', address: '', lat: null, lng: null });
  const [savingPickup, setSavingPickup] = useState(false);
  const [editingPickupId, setEditingPickupId] = useState(null);
  const heroFileInputRef = useRef(null);

  const cargarPerfil = async () => {
    setLoading(true);
    setError(null);
    try {
      const admin = await getAdminProfile();
      const mapped = {
        nombre: admin.name || '',
        email: admin.email || '',
        twoFA: !!admin.twoFA
      };
      setFormData(mapped);
      setLastSaved(mapped);
      setFotoUrl(admin.photo || FotoPerfil);
    } catch (err) {
      setError(err.message || 'No se pudo cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const cargarConfigEnvio = async () => {
    setLoadingShipping(true);
    try {
      const config = await getConfig();
      const mapped = {
        storeLat: config?.storeLat ?? 13.6929,
        storeLng: config?.storeLng ?? -89.2182,
        pricePerKm: config?.pricePerKm ?? '',
        shippingMode: config?.shippingMode || 'perKm',
        fixedShippingCost: config?.fixedShippingCost ?? '',
        freeShippingMinAmount: config?.freeShippingMinAmount ?? ''
      };
      setConfigId(config?._id || null);
      setShippingForm(mapped);
      setLastSavedShipping(mapped);
      setHeroImages(config?.heroImages || []);
      setPickupLocations(config?.pickupLocations || []);

      const mappedSocial = {
        instagram: config?.socialMedia?.instagram || '',
        facebook: config?.socialMedia?.facebook || '',
        tiktok: config?.socialMedia?.tiktok || ''
      };
      setSocialMediaForm(mappedSocial);
      setLastSavedSocialMedia(mappedSocial);

      const mappedTheme = {
        primaryColor: config?.theme?.primaryColor || '#064225',
        backgroundColor: config?.theme?.backgroundColor || '#fcfdfc',
        surfaceColor: config?.theme?.surfaceColor || '#ffffff',
        darkMode: !!config?.theme?.darkMode,
        mode: config?.theme?.mode || 'default',
        festivoKey: config?.theme?.festivoKey || ''
      };
      setThemeForm(mappedTheme);
      setLastSavedTheme(mappedTheme);
      setLogoUrl(config?.theme?.logoUrl || '');
    } catch (err) {
      showError(err.message || 'No se pudo cargar la configuración de envío');
    } finally {
      setLoadingShipping(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
    cargarConfigEnvio();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const handlePickFoto = () => {
    fileInputRef.current?.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(jpe?g|png|webp)$/.test(file.type)) {
      showError('La foto debe ser una imagen JPG, PNG o WEBP');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('La imagen no puede pesar más de 5MB');
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleDescartar = () => {
    setFormData(lastSaved);
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGuardar = async () => {
    if (formData.email && !emailPattern.test(formData.email)) {
      showError('Ingresa un correo electrónico válido');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.nombre);
      fd.append('email', formData.email);
      if (fotoFile) fd.append('photo', fotoFile);

      const updated = await updateAdminProfile(fd);

      const mapped = {
        nombre: updated.name || '',
        email: updated.email || '',
        twoFA: !!updated.twoFA
      };
      setFormData(mapped);
      setLastSaved(mapped);
      setFotoUrl(updated.photo || FotoPerfil);
      setFotoFile(null);
      setFotoPreview(null);

      showSuccess('Perfil actualizado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleActualizarPassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showError('Ingresa tu contraseña actual y la nueva');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateAdminPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      showSuccess('Contraseña actualizada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo actualizar la contraseña');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    setUpdatingTwoFA(true);
    const anterior = formData.twoFA;
    setFormData({ ...formData, twoFA: !anterior });

    try {
      const result = await toggleAdminTwoFA();
      setFormData(prev => ({ ...prev, twoFA: result.twoFA }));
      setLastSaved(prev => ({ ...prev, twoFA: result.twoFA }));
      showSuccess(result.twoFA ? 'Autenticación en dos pasos activada' : 'Autenticación en dos pasos desactivada');
    } catch (err) {
      setFormData(prev => ({ ...prev, twoFA: anterior }));
      showError(err.message || 'No se pudo actualizar la autenticación en dos pasos');
    } finally {
      setUpdatingTwoFA(false);
    }
  };

  const handleCambiarUbicacionTienda = (coords) => {
    setShippingForm(prev => ({ ...prev, storeLat: coords.lat, storeLng: coords.lng }));
  };

  const handlePricePerKmChange = (e) => {
    setShippingForm(prev => ({ ...prev, pricePerKm: e.target.value }));
  };

  const handleShippingModeChange = (mode) => {
    setShippingForm(prev => ({ ...prev, shippingMode: mode }));
  };

  const handleFixedShippingCostChange = (e) => {
    setShippingForm(prev => ({ ...prev, fixedShippingCost: e.target.value }));
  };

  const handleFreeShippingMinAmountChange = (e) => {
    setShippingForm(prev => ({ ...prev, freeShippingMinAmount: e.target.value }));
  };

  const handleGuardarBanner = async (payload) => {
    try {
      if (editingBanner) {
        await updateBannerItem(editingBanner._id, payload);
        showSuccess('Banner actualizado exitosamente');
      } else {
        await addBanner(payload);
        showSuccess('Banner agregado exitosamente');
      }
    } catch (err) {
      showError(err.message || 'No se pudo guardar el banner');
    }
  };

  const handleEliminarBanner = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar este banner?');
    if (!ok) return;
    try {
      await deleteBannerItem(id);
      showSuccess('Banner eliminado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar el banner');
    }
  };

  // Activar/desactivar es solo un update con active: true/false -- el
  // backend se encarga de desactivar los demás automáticamente.
  const handleActivarBanner = async (item) => {
    try {
      await updateBannerItem(item._id, { active: true });
      showSuccess('Banner activado');
    } catch (err) {
      showError(err.message || 'No se pudo activar el banner');
    }
  };

  const handleDesactivarBanner = async (item) => {
    try {
      await updateBannerItem(item._id, { active: false });
      showSuccess('Banner desactivado');
    } catch (err) {
      showError(err.message || 'No se pudo desactivar el banner');
    }
  };

  const handlePickHeroImages = () => {
    heroFileInputRef.current?.click();
  };

  const handleHeroImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!configId) {
      showError('Todavía no existe una configuración creada. Crea una primero.');
      return;
    }

    if (heroImages.length + files.length > 6) {
      showError(`Máximo 6 imágenes en el carrusel. Ya tienes ${heroImages.length}, solo puedes agregar ${6 - heroImages.length} más.`);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
      return;
    }

    setUploadingHero(true);
    try {
      const updated = await addHeroImages(configId, files);
      setHeroImages(updated.heroImages || []);
      showSuccess('Imágenes agregadas exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudieron subir las imágenes');
    } finally {
      setUploadingHero(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  const handleRemoveHeroImage = async (publicId) => {
    if (!configId) return;

    setRemovingHeroId(publicId);
    try {
      const updated = await removeHeroImage(configId, publicId);
      setHeroImages(updated.heroImages || []);
      showSuccess('Imagen eliminada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar la imagen');
    } finally {
      setRemovingHeroId(null);
    }
  };

  const handleGuardarTextoHero = async (data) => {
    if (!configId || !editingHeroImage) return;

    try {
      const updated = await updateHeroImageText(configId, {
        publicId: editingHeroImage.public_id,
        ...data
      });
      setHeroImages(updated.heroImages || []);
      setEditingHeroImage(null);
      showSuccess('Texto de la imagen actualizado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo actualizar el texto de la imagen');
    }
  };

  const handleMoveHeroImage = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= heroImages.length || !configId) return;

    const reordered = [...heroImages];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    // Optimista: se ve el cambio de inmediato mientras se confirma con el backend
    setHeroImages(reordered);
    setReorderingHero(true);
    try {
      const updated = await reorderHeroImages(configId, reordered.map(img => img.public_id));
      setHeroImages(updated.heroImages || reordered);
    } catch (err) {
      showError(err.message || 'No se pudo reordenar las imágenes');
      setHeroImages(heroImages); // revertir si falló
    } finally {
      setReorderingHero(false);
    }
  };

  const handleDescartarRedesSociales = () => {
    setSocialMediaForm(lastSavedSocialMedia);
  };

  const handleGuardarRedesSociales = async () => {
    if (!configId) {
      showError('Todavía no existe una configuración creada. Crea una primero.');
      return;
    }

    setSavingSocialMedia(true);
    try {
      const updated = await updateSocialMediaConfig(configId, socialMediaForm);
      const mapped = {
        instagram: updated.socialMedia?.instagram || '',
        facebook: updated.socialMedia?.facebook || '',
        tiktok: updated.socialMedia?.tiktok || ''
      };
      setSocialMediaForm(mapped);
      setLastSavedSocialMedia(mapped);
      showSuccess('Redes sociales actualizadas exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudieron guardar las redes sociales');
    } finally {
      setSavingSocialMedia(false);
    }
  };

  const handleDescartarTema = () => {
    setThemeForm(lastSavedTheme);
  };

  const handleGuardarTema = async () => {
    if (!configId) {
      showError('Todavía no existe una configuración creada. Crea una primero.');
      return;
    }

    if (themeForm.mode === 'festivo' && !themeForm.festivoKey) {
      showError('Elige una festividad antes de guardar.');
      return;
    }

    // El chequeo de contraste solo tiene sentido en modo "Personalizado" --
    // en "Predeterminado" y "Festivo" los colores ya vienen probados de
    // antemano, no los elige el admin a mano.
    if (themeForm.mode === 'personalizado') {
      // Aviso (no bloqueante) si los colores elegidos casi no se distinguen
      // entre sí -- ej. texto de marca sobre el fondo de página, o tarjetas
      // sobre el fondo de página. 3:1 es el mínimo WCAG para texto grande;
      // se usa como umbral aquí porque es donde el texto empieza a costar
      // trabajo de leer a simple vista.
      const contrasteTextoFondo = contraste(themeForm.primaryColor, themeForm.backgroundColor);
      const contrasteTarjetaFondo = contraste(themeForm.surfaceColor, themeForm.backgroundColor);

      if (contrasteTextoFondo < 3 || contrasteTarjetaFondo < 3) {
        const razon = contrasteTextoFondo < 3
          ? 'el color de marca y el color de fondo casi no se distinguen entre sí (el texto se vería poco legible)'
          : 'el color de tarjetas y el color de fondo casi no se distinguen entre sí (las cajas se verían poco visibles)';
        const ok = await confirm(
          `Con estos colores, ${razon}. ¿Guardar de todas formas?`,
          { confirmText: 'Guardar de todas formas' }
        );
        if (!ok) return;
      }
    }

    setSavingTheme(true);
    try {
      const updated = await updateThemeConfig(configId, themeForm);
      const mapped = {
        primaryColor: updated.theme?.primaryColor || '#064225',
        backgroundColor: updated.theme?.backgroundColor || '#fcfdfc',
        surfaceColor: updated.theme?.surfaceColor || '#ffffff',
        darkMode: !!updated.theme?.darkMode,
        mode: updated.theme?.mode || 'default',
        festivoKey: updated.theme?.festivoKey || ''
      };
      setThemeForm(mapped);
      setLastSavedTheme(mapped);
      showSuccess('Apariencia del sitio actualizada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo guardar la apariencia del sitio');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !configId) return;

    setUploadingLogo(true);
    try {
      const updated = await updateThemeLogo(configId, file);
      setLogoUrl(updated.theme?.logoUrl || '');
      showSuccess('Logo actualizado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo subir el logo');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleQuitarLogo = async () => {
    if (!configId) return;
    const ok = await confirm(
      'La tienda volverá a usar el logo por defecto del código.',
      { confirmText: 'Quitar logo' }
    );
    if (!ok) return;

    setRemovingLogo(true);
    try {
      const updated = await removeThemeLogo(configId);
      setLogoUrl(updated.theme?.logoUrl || '');
      showSuccess('Logo eliminado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar el logo');
    } finally {
      setRemovingLogo(false);
    }
  };

  const handleDescartarEnvio = () => {
    setShippingForm(lastSavedShipping);
  };

  const handleGuardarEnvio = async () => {
    if (!configId) {
      showError('Todavía no existe una configuración creada. Crea una primero.');
      return;
    }

    // Solo se valida el precio por km si ese es el modo activo
    if (
      shippingForm.shippingMode === 'perKm' &&
      (shippingForm.pricePerKm === '' || Number(shippingForm.pricePerKm) < 0)
    ) {
      showError('Ingresa un precio por km válido');
      return;
    }

    // Solo se valida el costo fijo si ese es el modo activo
    if (
      shippingForm.shippingMode === 'fixed' &&
      (shippingForm.fixedShippingCost === '' || Number(shippingForm.fixedShippingCost) < 0)
    ) {
      showError('Ingresa un costo fijo de envío válido');
      return;
    }

    // El monto mínimo para envío gratis es opcional, pero si se llenó debe ser válido
    if (
      shippingForm.freeShippingMinAmount !== '' &&
      Number(shippingForm.freeShippingMinAmount) < 0
    ) {
      showError('El monto mínimo para envío gratis debe ser mayor o igual a 0');
      return;
    }

    setSavingShipping(true);
    try {
      const updated = await updateShippingConfig(configId, {
        storeLat: shippingForm.storeLat,
        storeLng: shippingForm.storeLng,
        pricePerKm: Number(shippingForm.pricePerKm) || 0,
        shippingMode: shippingForm.shippingMode,
        fixedShippingCost: Number(shippingForm.fixedShippingCost) || 0,
        freeShippingMinAmount: shippingForm.freeShippingMinAmount === '' ? null : Number(shippingForm.freeShippingMinAmount)
      });

      const mapped = {
        storeLat: updated.storeLat,
        storeLng: updated.storeLng,
        pricePerKm: updated.pricePerKm,
        shippingMode: updated.shippingMode,
        fixedShippingCost: updated.fixedShippingCost,
        freeShippingMinAmount: updated.freeShippingMinAmount ?? ''
      };
      setShippingForm(mapped);
      setLastSavedShipping(mapped);

      showSuccess('Configuración de envío actualizada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo guardar la configuración de envío');
    } finally {
      setSavingShipping(false);
    }
  };

  // --- Puntos de recogida en tienda ---

  const handleAgregarPickup = async () => {
    if (!configId) {
      showError('Todavía no existe una configuración creada. Crea una primero.');
      return;
    }
    if (!pickupForm.name.trim() || !pickupForm.address.trim()) {
      showError('El nombre y la dirección son obligatorios');
      return;
    }

    setSavingPickup(true);
    try {
      const updated = await addPickupLocation(configId, {
        name: pickupForm.name.trim(),
        address: pickupForm.address.trim(),
        lat: pickupForm.lat ?? undefined,
        lng: pickupForm.lng ?? undefined
      });
      setPickupLocations(updated.pickupLocations || []);
      setPickupForm({ name: '', address: '', lat: null, lng: null });
      showSuccess('Punto de recogida agregado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo agregar el punto de recogida');
    } finally {
      setSavingPickup(false);
    }
  };

  const handleGuardarEdicionPickup = async (locationId) => {
    if (!pickupForm.name.trim() || !pickupForm.address.trim()) {
      showError('El nombre y la dirección son obligatorios');
      return;
    }

    setSavingPickup(true);
    try {
      const updated = await updatePickupLocation(configId, locationId, {
        name: pickupForm.name.trim(),
        address: pickupForm.address.trim(),
        lat: pickupForm.lat ?? undefined,
        lng: pickupForm.lng ?? undefined
      });
      setPickupLocations(updated.pickupLocations || []);
      setEditingPickupId(null);
      setPickupForm({ name: '', address: '', lat: null, lng: null });
      showSuccess('Punto de recogida actualizado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo actualizar el punto de recogida');
    } finally {
      setSavingPickup(false);
    }
  };

  const handleToggleActivoPickup = async (location) => {
    try {
      const updated = await updatePickupLocation(configId, location._id, {
        isActive: !location.isActive
      });
      setPickupLocations(updated.pickupLocations || []);
    } catch (err) {
      showError(err.message || 'No se pudo actualizar el punto de recogida');
    }
  };

  const handleEliminarPickup = async (locationId) => {
    const ok = await confirm('¿Eliminar este punto de recogida?');
    if (!ok) return;

    try {
      const updated = await removePickupLocation(configId, locationId);
      setPickupLocations(updated.pickupLocations || []);
      showSuccess('Punto de recogida eliminado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar el punto de recogida');
    }
  };

  const iniciarEdicionPickup = (location) => {
    setEditingPickupId(location._id);
    setPickupForm({ name: location.name, address: location.address, lat: location.lat ?? null, lng: location.lng ?? null });
  };

  const cancelarEdicionPickup = () => {
    setEditingPickupId(null);
    setPickupForm({ name: '', address: '', lat: null, lng: null });
  };

  const fotoMostrada = fotoPreview || fotoUrl;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />
      {ConfirmDialog}

      {/* Toasts */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`m503-pop flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl backdrop-blur-md shadow-[0_18px_36px_-18px_rgba(30,59,47,0.6)] font-medium text-sm ${
              toast.type === 'success'
                ? 'bg-[#1E3B2F]/95 text-white'
                : toast.type === 'error'
                  ? 'bg-[#E08A8A]/95 text-white'
                  : 'bg-[#4F8A6B]/95 text-white'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: toast.type === 'success' ? '#8DBFA3' : '#FFFFFF' }}
            />
            {toast.message}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto m503-scroll p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
        {/* Header */}
        <div className="mb-6 m503-fade-up">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
            </span>
            {loading ? 'Cargando...' : 'Activo'}
          </span>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Ajustes de</span>
            <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">configuración</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">Gestiona los ajustes de tu cuenta</p>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-[#FFF7F7] text-[#8A3B3B] rounded-2xl border border-[#F2C9C9] text-sm">
            <AlertIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#C65F5F]" />
            <span>{error}</span>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Perfil (a todo lo ancho) */}
          <Section title="Perfil" delay=".04s">
            <div className="lg:flex lg:items-center lg:gap-10">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center mb-6 lg:mb-0 lg:shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#E6F2EA] shadow-[0_16px_32px_-18px_rgba(30,59,47,0.6)]">
                    <img
                      src={fotoMostrada}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FotoPerfil; }}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePickFoto}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1E3B2F] text-white flex items-center justify-center shadow-md hover:bg-[#162E24] transition-colors"
                  >
                    <CameraIcon />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-3">Cambiar foto</p>
                <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
              </div>

              <div className="flex-1 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
                <div>
                  <label className={labelClass}>Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onKeyDown={blockNonLetters}
                    className={`${inputClass} font-medium`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Redes sociales */}
          <Section title="Preferencias generales" aside={<Pill>Configurable</Pill>} delay=".08s">
            <div>
              <label className={labelClass}>Redes sociales</label>
              <p className={hintClass}>
                Enlaces oficiales de la tienda. Se muestran como íconos en el pie de página de la tienda; el que se deje vacío simplemente no aparece.
              </p>

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E4405F]">
                    <IconoInstagram size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="https://instagram.com/macetas503"
                    value={socialMediaForm.instagram}
                    onChange={(e) => setSocialMediaForm(prev => ({ ...prev, instagram: e.target.value }))}
                    className={`${inputClass} pl-11`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1877F2]">
                    <IconoFacebook size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="https://facebook.com/macetas503"
                    value={socialMediaForm.facebook}
                    onChange={(e) => setSocialMediaForm(prev => ({ ...prev, facebook: e.target.value }))}
                    className={`${inputClass} pl-11`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900">
                    <IconoTikTok size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="https://tiktok.com/@macetas503"
                    value={socialMediaForm.tiktok}
                    onChange={(e) => setSocialMediaForm(prev => ({ ...prev, tiktok: e.target.value }))}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleDescartarRedesSociales}
                  disabled={savingSocialMedia}
                  className={btnGhost}
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarRedesSociales}
                  disabled={savingSocialMedia}
                  className={btnPrimary}
                >
                  {savingSocialMedia ? 'Guardando...' : 'Guardar redes sociales'}
                </button>
              </div>
            </div>
          </Section>

          {/* Apariencia del sitio: color de marca, logo y modo oscuro */}
          <Section title="Apariencia" delay=".12s">
            <div>
              <label className={labelClass}>Modo de color</label>
              <p className={hintClass}>
                Predeterminado usa el verde original de la marca. Festivo aplica una paleta lista para fechas especiales. Personalizado te deja elegir tus propios colores.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'default', label: 'Predeterminado' },
                  { value: 'festivo', label: 'Festivo' },
                  { value: 'personalizado', label: 'Personalizado' }
                ].map(opcion => (
                  <button
                    key={opcion.value}
                    type="button"
                    onClick={() => setThemeForm(prev => ({ ...prev, mode: opcion.value }))}
                    className={optionBtn(themeForm.mode === opcion.value)}
                  >
                    {opcion.label}
                  </button>
                ))}
              </div>
            </div>

            {themeForm.mode === 'festivo' && (
              <div>
                <label className={labelClass}>Festividad</label>
                <p className={hintClass}>
                  Elige una fecha especial. Los colores y el emoji del banner cambian automáticamente en toda la tienda.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(FESTIVOS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemeForm(prev => ({ ...prev, festivoKey: key }))}
                      className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-2xl border-2 transition-all ${
                        themeForm.festivoKey === key
                          ? 'border-[#8DBFA3] bg-[#E6F2EA]'
                          : 'border-transparent bg-[#F2F6F3] hover:bg-[#E6F2EA]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <span className="truncate text-left text-gray-800">{preset.emoji} {preset.label}</span>
                    </button>
                  ))}
                </div>
                {!themeForm.festivoKey && (
                  <p className="text-[11px] text-[#C65F5F] mt-2">Elige una festividad antes de guardar.</p>
                )}
              </div>
            )}

            {themeForm.mode === 'personalizado' && (
              <>
                <ColorField
                  label="Color de marca"
                  hint="Se usa en botones, enlaces y acentos de toda la tienda. El cambio se ve reflejado en el sitio del cliente, no en este panel de administración."
                  value={themeForm.primaryColor}
                  onChange={(e) => setThemeForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#064225"
                />
                <ColorField
                  label="Color de fondo (páginas)"
                  hint="El fondo general detrás de todo el contenido, en toda la tienda."
                  value={themeForm.backgroundColor}
                  onChange={(e) => setThemeForm(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  placeholder="#fcfdfc"
                />
                <ColorField
                  label="Color de tarjetas y cajas"
                  hint="El fondo de las tarjetas de producto, formularios y demás cajas blancas."
                  value={themeForm.surfaceColor}
                  onChange={(e) => setThemeForm(prev => ({ ...prev, surfaceColor: e.target.value }))}
                  placeholder="#ffffff"
                />
              </>
            )}

            <div>
              <label className={labelClass}>Logo del sitio</label>
              <p className={hintClass}>
                Reemplaza el logo por defecto en el encabezado y pie de página de la tienda. Formatos: JPG, PNG o GIF.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3] flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo actual" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-400 text-center px-1">Logo por defecto</span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo || !configId}
                    className={btnPrimary}
                  >
                    {uploadingLogo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleQuitarLogo}
                      disabled={removingLogo}
                      className="px-2 text-xs font-medium text-[#C65F5F] hover:underline disabled:opacity-50"
                    >
                      {removingLogo ? 'Quitando...' : 'Quitar logo personalizado'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <ToggleRow
              title="Modo oscuro"
              description="Activa el tema oscuro en la tienda del cliente"
              checked={themeForm.darkMode}
              onClick={() => setThemeForm(prev => ({ ...prev, darkMode: !prev.darkMode }))}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDescartarTema}
                disabled={savingTheme}
                className={btnGhost}
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleGuardarTema}
                disabled={savingTheme}
                className={btnPrimary}
              >
                {savingTheme ? 'Guardando...' : 'Guardar apariencia'}
              </button>
            </div>
          </Section>

          {/* Banners del inicio (texto, colores, animación) */}
          <Section
            title="Banners"
            delay=".16s"
            aside={
              <button
                type="button"
                onClick={() => openBannerModal(null)}
                className={`${btnPrimary} !py-2 !px-4`}
              >
                <PlusIcon />
                Agregar banner
              </button>
            }
          >
            <p className="text-xs text-gray-500">
              Guarda varios mensajes de antemano (ej. "Envío gratis", "Black Friday") y activa el que quieras mostrar en la franja superior de la tienda. Solo uno puede estar activo a la vez.
            </p>

            {loadingBanners ? (
              <div className="text-center py-6 text-gray-400 text-sm">Cargando banners...</div>
            ) : banners.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-6 border-2 border-dashed border-[#D3E6DA] rounded-2xl">
                Todavía no hay banners guardados. Mientras tanto, la tienda muestra un mensaje de respaldo genérico.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {banners.map((item) => (
                  <div key={item._id} className="bg-white border border-[#EEF4F0] rounded-[1.4rem] p-1.5 shadow-[0_12px_28px_-22px_rgba(30,59,47,0.55)]">
                    <div
                      className={`w-full text-center py-2 px-2 text-[11px] font-medium overflow-hidden rounded-[1.1rem] ${
                        item.animation !== 'none' ? `anim-${item.animation}` : ''
                      }`}
                      style={{ backgroundColor: item.backgroundColor, color: item.textColor }}
                    >
                      <span className={item.animation === 'marquee' ? 'inline-block whitespace-nowrap' : ''}>
                        {item.text}
                      </span>
                    </div>
                    <div className="px-2 pt-2.5 pb-1.5 flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                          item.active ? 'bg-[#E6F2EA] text-[#2F6B4D]' : 'bg-[#F3F4F6] text-gray-500'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: item.active ? '#4F8A6B' : '#9CA3AF' }}
                        />
                        {item.active ? 'Activo' : 'Inactivo'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.active ? (
                          <button type="button" onClick={() => handleDesactivarBanner(item)} className={`${btnSmall} text-gray-600 bg-[#F2F6F3] hover:bg-[#E6F2EA]`}>
                            Desactivar
                          </button>
                        ) : (
                          <button type="button" onClick={() => handleActivarBanner(item)} className={`${btnSmall} text-[#2F6B4D] bg-[#E6F2EA] hover:bg-[#D3E6DA]`}>
                            Activar
                          </button>
                        )}
                        <button type="button" onClick={() => openBannerModal(item)} className={`${btnSmall} text-[#4F8A6B] bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white`}>
                          Editar
                        </button>
                        <button type="button" onClick={() => handleEliminarBanner(item._id)} className={`${btnSmall} text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white`}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Carrusel de imágenes del inicio */}
          <Section
            title="Carrusel del inicio"
            delay=".2s"
            aside={<Pill>{heroImages.length}/6 imágenes</Pill>}
          >
            <p className="text-xs text-gray-500">
              Estas son las imágenes que rotan en la parte de arriba de la página de inicio de la tienda. La primera es la que se muestra primero.
            </p>

            {heroImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {heroImages.map((img, index) => (
                  <div key={img.public_id} className="relative group rounded-[1.1rem] overflow-hidden aspect-video bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3]">
                    <img src={img.url} alt={`Imagen ${index + 1} del carrusel`} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 left-1.5 bg-[#1E3B2F]/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {index + 1}
                    </span>
                    {img.title && (
                      <span className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-md text-[#1E3B2F] text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Con texto
                      </span>
                    )}
                    <div className="absolute inset-0 bg-[#1E3B2F]/0 group-hover:bg-[#1E3B2F]/45 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleMoveHeroImage(index, -1)}
                        disabled={index === 0 || reorderingHero}
                        title="Mover antes"
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-[#1E3B2F] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHeroImage(img)}
                        title="Editar texto"
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-[#1E3B2F] hover:bg-white transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroImage(img.public_id)}
                        disabled={removingHeroId === img.public_id}
                        title="Eliminar"
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E08A8A] text-white hover:bg-[#C65F5F] disabled:opacity-50 transition-all text-sm font-bold"
                      >
                        {removingHeroId === img.public_id ? '…' : '✕'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveHeroImage(index, 1)}
                        disabled={index === heroImages.length - 1 || reorderingHero}
                        title="Mover después"
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-[#1E3B2F] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {heroImages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-6 border-2 border-dashed border-[#D3E6DA] rounded-2xl">
                Todavía no hay imágenes. Mientras tanto, la tienda muestra la imagen por defecto.
              </div>
            )}

            <div>
              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={handleHeroImagesChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handlePickHeroImages}
                disabled={uploadingHero || heroImages.length >= 6 || !configId}
                className={`${btnPrimary} w-full sm:w-auto`}
              >
                {uploadingHero ? 'Subiendo...' : heroImages.length >= 6 ? 'Máximo alcanzado (6/6)' : (
                  <>
                    <PlusIcon />
                    Agregar imágenes
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1.5">PNG o JPG. Puedes seleccionar varias a la vez.</p>
            </div>
          </Section>

          {/* Envío: ubicación de tienda + modo de cobro + envío gratis */}
          <Section
            title="Envío"
            delay=".24s"
            aside={<Pill>{loadingShipping ? 'Cargando...' : 'Configurable'}</Pill>}
          >
            <div>
              <label className={labelClass}>Ubicación de la tienda</label>
              <div className="w-full overflow-hidden rounded-2xl mt-2">
                <StoreLocationMap
                  lat={shippingForm.storeLat}
                  lng={shippingForm.storeLng}
                  onCambiarUbicacion={handleCambiarUbicacionTienda}
                />
              </div>
              {shippingForm.storeLat && shippingForm.storeLng && (
                <p className="text-xs text-gray-500 mt-2 break-words">
                  Lat: {shippingForm.storeLat.toFixed(5)} — Lng: {shippingForm.storeLng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Selector de modo de cobro */}
            <div>
              <label className={`${labelClass} mb-2`}>Modo de cobro de envío</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleShippingModeChange('perKm')}
                  className={optionBtn(shippingForm.shippingMode === 'perKm')}
                >
                  Por kilómetro
                </button>
                <button
                  type="button"
                  onClick={() => handleShippingModeChange('fixed')}
                  className={optionBtn(shippingForm.shippingMode === 'fixed')}
                >
                  Costo fijo
                </button>
              </div>
            </div>

            {/* Precio por km — solo visible en modo "perKm" */}
            {shippingForm.shippingMode === 'perKm' && (
              <div>
                <label className={labelClass}>Precio por km</label>
                <MoneyInput
                  value={shippingForm.pricePerKm}
                  onChange={handlePricePerKmChange}
                  onKeyDown={blockNegative}
                  placeholder="0.50"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Se cobra al cliente según la distancia real desde la tienda hasta su dirección.
                </p>
              </div>
            )}

            {/* Costo fijo — solo visible en modo "fixed" */}
            {shippingForm.shippingMode === 'fixed' && (
              <div>
                <label className={labelClass}>Costo fijo de envío</label>
                <MoneyInput
                  value={shippingForm.fixedShippingCost}
                  onChange={handleFixedShippingCostChange}
                  onKeyDown={blockNegative}
                  placeholder="3.00"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Se cobra este monto fijo sin importar la distancia hasta el cliente.
                </p>
              </div>
            )}

            {/* Envío gratis a partir de un monto — aplica en ambos modos */}
            <div>
              <label className={labelClass}>Envío gratis a compras mayores de</label>
              <MoneyInput
                value={shippingForm.freeShippingMinAmount}
                onChange={handleFreeShippingMinAmountChange}
                onKeyDown={blockNegative}
                placeholder="Ej: 30.00 (déjalo vacío para desactivar)"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Si el subtotal de la compra supera este monto, el envío es gratis automáticamente, sin importar el modo de cobro elegido arriba. Déjalo vacío para desactivar el envío gratis.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleDescartarEnvio}
                disabled={savingShipping}
                className={`${btnGhost} w-full sm:w-auto`}
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleGuardarEnvio}
                disabled={savingShipping}
                className={`${btnPrimary} w-full sm:w-auto`}
              >
                {savingShipping ? 'Guardando...' : 'Guardar envío'}
              </button>
            </div>
          </Section>

          {/* Puntos de recogida en tienda */}
          <Section
            title="Puntos de recogida"
            delay=".28s"
            description="Direcciones donde el cliente puede pasar a recoger su pedido él mismo, para cuando no puedas llevarlo a domicilio. El envío queda en $0 cuando elige recoger."
          >
            {pickupLocations.length > 0 && (
              <div className="space-y-3">
                {pickupLocations.map((location) => (
                  <div
                    key={location._id}
                    className="bg-white border border-[#EEF4F0] rounded-[1.4rem] p-4 shadow-[0_12px_28px_-22px_rgba(30,59,47,0.55)]"
                  >
                    {editingPickupId === location._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={pickupForm.name}
                          onChange={(e) => setPickupForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre (ej: Sucursal Centro)"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={pickupForm.address}
                          onChange={(e) => setPickupForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Dirección completa"
                          className={inputClass}
                        />
                        <div className="overflow-hidden rounded-2xl">
                          <StoreLocationMap
                            lat={pickupForm.lat}
                            lng={pickupForm.lng}
                            onCambiarUbicacion={({ lat, lng }) => setPickupForm(prev => ({ ...prev, lat, lng }))}
                          />
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Marca en el mapa el punto exacto -- así el cliente podrá ver cómo llegar.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={cancelarEdicionPickup}
                            disabled={savingPickup}
                            className={`${btnSmall} !h-9 !px-4 text-gray-700 bg-[#F2F6F3] hover:bg-[#E6F2EA]`}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGuardarEdicionPickup(location._id)}
                            disabled={savingPickup}
                            className={`${btnSmall} !h-9 !px-4 text-white bg-[#1E3B2F] hover:bg-[#162E24]`}
                          >
                            {savingPickup ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{location.name}</p>
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
                                location.isActive
                                  ? 'bg-[#E6F2EA] text-[#2F6B4D]'
                                  : 'bg-[#F3F4F6] text-gray-500'
                              }`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: location.isActive ? '#4F8A6B' : '#9CA3AF' }}
                              />
                              {location.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 break-words">{location.address}</p>
                          {location.lat && location.lng && (
                            <a
                              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-medium text-[#4F8A6B] underline hover:text-[#1E3B2F]"
                            >
                              Ver ubicación en el mapa
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleActivoPickup(location)}
                            className={`${btnSmall} text-[#2F6B4D] bg-[#E6F2EA] hover:bg-[#D3E6DA]`}
                          >
                            {location.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => iniciarEdicionPickup(location)}
                            className={`${btnSmall} text-[#4F8A6B] bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarPickup(location._id)}
                            className={`${btnSmall} text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white`}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar uno nuevo (solo cuando no se está editando otro) */}
            {editingPickupId === null && (
              <div className="border-2 border-dashed border-[#D3E6DA] rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900">Agregar punto de recogida</p>
                <input
                  type="text"
                  value={pickupForm.name}
                  onChange={(e) => setPickupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre (ej: Sucursal Centro)"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={pickupForm.address}
                  onChange={(e) => setPickupForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Dirección completa"
                  className={inputClass}
                />
                <div className="overflow-hidden rounded-2xl">
                  <StoreLocationMap
                    lat={pickupForm.lat}
                    lng={pickupForm.lng}
                    onCambiarUbicacion={({ lat, lng }) => setPickupForm(prev => ({ ...prev, lat, lng }))}
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Marca en el mapa el punto exacto -- así el cliente podrá ver cómo llegar.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAgregarPickup}
                    disabled={savingPickup}
                    className={btnPrimary}
                  >
                    {savingPickup ? 'Agregando...' : 'Agregar'}
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Seguridad */}
          <Section title="Seguridad" aside={<Pill>Protegido</Pill>} delay=".32s">
            <div>
              <label className={labelClass}>Contraseña actual</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nueva contraseña</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleActualizarPassword}
                  disabled={updatingPassword}
                  className={`${btnPrimary} w-full sm:w-auto`}
                >
                  {updatingPassword ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
              </p>
            </div>

            <ToggleRow
              title="Autenticación 2FA"
              description="Protege tu cuenta con verificación en dos pasos"
              checked={formData.twoFA}
              onClick={handleToggle2FA}
              disabled={updatingTwoFA}
            />

            <div className="p-4 bg-[#FBF1D6]/60 rounded-2xl border border-[#F3E4B5]">
              <div className="flex items-start gap-3">
                <span className="m503-serif text-xl leading-none text-[#7A5B12]">i</span>
                <div>
                  <p className="text-sm font-semibold text-[#7A5B12]">Confirmar cambios</p>
                  <p className="text-xs text-[#7A5B12]/80 mt-0.5">Revisa toda la información antes de guardar los cambios</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Acciones */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={handleDescartar}
              disabled={saving}
              className={`${btnGhost} w-full sm:w-auto !px-6`}
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={saving}
              className={`${btnPrimary} w-full sm:w-auto !px-8`}
            >
              <SaveIcon />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      <AddBannerModal
        isOpen={showBannerModal}
        onClose={closeBannerModal}
        onSave={handleGuardarBanner}
        editingItem={editingBanner}
      />

      <EditHeroImageModal
        isOpen={!!editingHeroImage}
        onClose={() => setEditingHeroImage(null)}
        onSave={handleGuardarTextoHero}
        image={editingHeroImage}
      />
    </div>
  );
};

export default SettingsPage;