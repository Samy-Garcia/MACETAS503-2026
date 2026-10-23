import Avatar from "../components/Avatar";
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import fotoPerfil from "../assets/profile.jpeg";
import ProfileHeader from "../components/ProfileHeader";
import 'react-phone-number-input/style.css';
import es from 'react-phone-number-input/locale/es.json';
import PhoneInput from 'react-phone-number-input';
import { useForm, Controller } from "react-hook-form";
import Swal from 'sweetalert2';
import toast from "react-hot-toast";
import { getMyProfile, updateMyProfile } from "../api/profileApi";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { todayISO } from "../utils/dateUtils";

export default function UpdateProfile() {

  useEffect(() => {
    document.title = "Actualizar Perfil | Macetas503";
  }, []);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { refreshProfile } = useContext(ProfileContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(fotoPerfil);
  const [photoFile, setPhotoFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { nombre: '', apellido: '', telefono: '', fechaNacimiento: '' }
  });

  const nombre = watch('nombre');
  const apellido = watch('apellido');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await getMyProfile();
        reset({
          nombre: data.name || '',
          apellido: data.lastName || '',
          telefono: data.phone || '',
          fechaNacimiento: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : ''
        });
        setEmail(data.email || '');
        if (data.photo) setAvatarPreview(data.photo);
      } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonText: 'Aceptar', confirmButtonColor: '#064225' });
        navigate('/perfil');
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, [reset, navigate]);

  const handleEditPhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpe?g|png|webp)$/.test(file.type)) {
      toast.error('La foto debe ser una imagen JPG, PNG o WEBP.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La foto no puede pesar más de 5 MB.');
      e.target.value = '';
      return;
    }
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setPhotoFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateMyProfile({
        name: data.nombre,
        lastName: data.apellido,
        phone: data.telefono,
        birthDate: data.fechaNacimiento,
        photoFile
      });
      await refreshProfile(); // para que la foto/nombre se actualicen en todas las páginas ya abiertas
      Swal.fire({
        title: '¡Perfil Actualizado!',
        text: 'Tus datos se han guardado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar', confirmButtonColor: '#064225'
      });
      navigate('/perfil');
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonText: 'Aceptar', confirmButtonColor: '#064225' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-page flex items-center justify-center text-zinc-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 pb-16">

      <ProfileHeader avatar={avatarPreview} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
          Datos de cuenta
        </h1>

        {/* AVATAR CON EDICIÓN HOVER (foto real, sube a Cloudinary al guardar) */}
        <div className="flex items-center gap-6">
          <div
            className="group relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
            onClick={handleEditPhoto}
          >
            <Avatar src={avatarPreview} alt="Foto de perfil" className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white text-xs font-medium tracking-wide">Editar</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {nombre} {apellido}
            </h2>
            <span className="text-base text-zinc-500 underline decoration-zinc-300 mt-1">
              {email}
            </span>
          </div>
        </div>

        <form className="flex flex-col gap-6 mt-4" onSubmit={handleSubmit(onSubmit)}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-base font-normal text-zinc-900 pl-1">
                Nombre <span className="text-zinc-300 font-light">*</span>
              </label>
              <input
                type="text"
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "No se admiten números ni caracteres especiales" }
                })}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); }}
                className={`w-full bg-surface border rounded-md py-3.5 px-4 text-base text-zinc-700 font-normal focus:outline-none transition-colors ${errors.nombre ? "border-red-500 focus:border-red-500" : "border-zinc-300 focus:border-primary-700"
                  }`}
              />
              {errors.nombre && <span className="text-xs text-red-500 pl-1">{errors.nombre.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base font-normal text-zinc-900 pl-1">
                Apellido <span className="text-zinc-300 font-light">*</span>
              </label>
              <input
                type="text"
                {...register("apellido", {
                  required: "El apellido es obligatorio",
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "No se admiten números ni caracteres especiales" }
                })}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); }}
                className={`w-full bg-surface border rounded-md py-3.5 px-4 text-base text-zinc-700 font-normal focus:outline-none transition-colors ${errors.apellido ? "border-red-500 focus:border-red-500" : "border-zinc-300 focus:border-primary-700"
                  }`}
              />
              {errors.apellido && <span className="text-xs text-red-500 pl-1">{errors.apellido.message}</span>}
            </div>
          </div>

          {/* Correo: solo lectura. Cambiarlo implicaría re-verificar la cuenta, es otro flujo aparte */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-normal text-zinc-900 pl-1">Correo</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-page border border-zinc-300 rounded-md py-3.5 px-4 text-base text-zinc-500 font-normal focus:outline-none cursor-not-allowed"
            />
            <span className="text-xs text-zinc-400 pl-1">El correo no se puede cambiar desde aquí.</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-normal text-zinc-900 pl-1">
              Número de Telefono
            </label>
            <div className="w-full">
              <Controller
                name="telefono"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    international
                    defaultCountry="SV"
                    countryCallingCodeEditable={false}
                    labels={es}
                    placeholder="6998-9890"
                    value={value}
                    onChange={onChange}
                    className="flex w-full rounded-md border border-zinc-300 bg-surface focus-within:border-primary-700 transition-colors overflow-hidden [&_.PhoneInputCountry]:bg-zinc-100 [&_.PhoneInputCountry]:px-4 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-zinc-300 [&_input]:w-full [&_input]:bg-transparent [&_input]:py-3.5 [&_input]:px-4 [&_input]:text-base [&_input]:text-zinc-700 [&_input]:focus:outline-none"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-normal text-zinc-900 pl-1">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              max={todayISO()}
              {...register("fechaNacimiento")}
              className="w-full bg-surface border border-zinc-300 rounded-md py-3.5 px-4 text-base text-zinc-700 font-normal focus:outline-none focus:border-primary-700 transition-colors"
            />
            <span className="text-xs text-zinc-400 pl-1">
              El día de tu cumpleaños ganas 100 hojas automáticamente en el Programa de Fidelidad.
            </span>
          </div>

          <div className="w-full mt-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white text-base font-semibold py-4 rounded-md transition-all shadow-sm cursor-pointer tracking-wide disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
