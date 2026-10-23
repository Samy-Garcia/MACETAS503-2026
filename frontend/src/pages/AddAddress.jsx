import Avatar from "../components/Avatar";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import es from 'react-phone-number-input/locale/es.json';
import Swal from 'sweetalert2';
import fotoPerfil from "../assets/profile.jpeg";
import ProfileHeader from "../components/ProfileHeader";
import AddressLocationPicker from "../components/AddressLocationPicker";
import { getMyProfile, addAddress, updateAddress } from "../api/profileApi";

export default function AddAddress() {

  useEffect(() => {
    document.title = "Agregar Dirección | Macetas503";
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  // Si venimos del lápiz de "editar" en Mi Perfil, location.state.address trae la dirección existente
  const editingAddress = location.state?.address || null;
  const isEditing = !!editingAddress;

  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  // Coordenadas capturadas del mapa (opcional). Si se edita una dirección
  // que ya tenía coordenadas guardadas, arrancan precargadas ahí.
  const [ubicacion, setUbicacion] = useState(
    editingAddress?.lat && editingAddress?.lng
      ? { lat: editingAddress.lat, lng: editingAddress.lng }
      : null
  );

  // El modelo guarda "fullName" como un solo texto; lo partimos best-effort
  // en nombre/apellido solo para poder precargar el formulario al editar.
  const [initialNombre, initialApellido] = editingAddress
    ? [editingAddress.fullName.split(' ')[0] || '', editingAddress.fullName.split(' ').slice(1).join(' ') || '']
    : ['', ''];

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      nombre: initialNombre,
      apellido: initialApellido,
      direccion: editingAddress?.addressLine || "",
      telefono: editingAddress?.phone || "",
      predeterminada: editingAddress?.isDefault || false
    }
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
        // Si es una dirección nueva (no editando), sugerimos el nombre de la cuenta
        if (!isEditing) {
          reset({
            nombre: data.name || '',
            apellido: data.lastName || '',
            direccion: '',
            telefono: '',
            predeterminada: false
          });
        }
      } catch (err) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonText: 'Aceptar', confirmButtonColor: '#064225' });
        navigate('/login');
      }
    };
    cargarPerfil();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        fullName: `${data.nombre} ${data.apellido}`.trim(),
        addressLine: data.direccion,
        phone: data.telefono,
        isDefault: data.predeterminada,
        lat: ubicacion?.lat,
        lng: ubicacion?.lng
      };

      if (isEditing) {
        await updateAddress(editingAddress._id, payload);
      } else {
        await addAddress(payload);
      }

      Swal.fire({
        title: isEditing ? '¡Dirección Actualizada!' : '¡Dirección Guardada!',
        text: isEditing ? 'Los cambios se guardaron correctamente.' : 'La nueva dirección ha sido agregada a tu cuenta.',
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

  const avatar = profile?.photo || fotoPerfil;

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800 pb-16">
      <ProfileHeader avatar={avatar} />

      <main className="max-w-4xl mx-auto px-6 pt-20 pb-12 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">
          {isEditing ? 'Editar Dirección' : 'Agregar Dirección'}
        </h1>

        {profile && (
          <div className="flex items-center gap-4 mb-8">
            <Avatar src={avatar} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h2 className="font-bold">{profile.name} {profile.lastName}</h2>
              <p className="text-sm text-zinc-500 underline">{profile.email}</p>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-600">Nombre *</label>
              <input
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "Solo letras permitidas" },
                  validate: (v) => v.trim().length >= 2 || "El nombre debe tener al menos 2 caracteres",
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); }}
                className={`p-3 border rounded-md bg-surface ${errors.nombre ? 'border-red-500' : 'border-zinc-300'}`}
              />
              {errors.nombre && <span className="text-xs text-red-500">{errors.nombre.message}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-600">Apellido *</label>
              <input
                {...register("apellido", {
                  required: "El apellido es obligatorio",
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: "Solo letras permitidas" },
                  validate: (v) => v.trim().length >= 2 || "El apellido debe tener al menos 2 caracteres",
                  maxLength: { value: 50, message: "Máximo 50 caracteres" }
                })}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); }}
                className={`p-3 border rounded-md bg-surface ${errors.apellido ? 'border-red-500' : 'border-zinc-300'}`}
              />
              {errors.apellido && <span className="text-xs text-red-500">{errors.apellido.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-600">Dirección *</label>
            <input
              {...register("direccion", {
                required: "La dirección es obligatoria",
                validate: (v) => v.trim().length >= 5 || "La dirección debe tener al menos 5 caracteres",
                maxLength: { value: 250, message: "La dirección no puede tener más de 250 caracteres" }
              })}
              placeholder="Calle, colonia, municipio y departamento (o márcala en el mapa)"
              className={`p-3 border rounded-md bg-surface ${errors.direccion ? 'border-red-500' : 'border-zinc-300'}`}
            />
            {errors.direccion && <span className="text-xs text-red-500">{errors.direccion.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <AddressLocationPicker
              lat={ubicacion?.lat}
              lng={ubicacion?.lng}
              onUbicacionSeleccionada={(coords, direccionTexto) => {
                setUbicacion(coords);
                if (direccionTexto) setValue("direccion", direccionTexto, { shouldValidate: true });
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-600">Número de Telefono *</label>
            <Controller
              name="telefono"
              control={control}
              rules={{
                required: "El teléfono es obligatorio",
                validate: (v) => !v || isValidPhoneNumber(v) || "Número de teléfono inválido para ese país"
              }}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  international
                  defaultCountry="SV"
                  countryCallingCodeEditable={false}
                  labels={es}
                  value={value}
                  onChange={onChange}
                  className="p-3 border border-zinc-300 rounded-md bg-surface [&_.PhoneInputInput]:outline-none"
                />
              )}
            />
            {errors.telefono && <span className="text-xs text-red-500">{errors.telefono.message}</span>}
          </div>

          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" {...register("predeterminada")} className="w-5 h-5 accent-primary-700 cursor-pointer" />
            <label className="text-sm">Establecer como dirección predeterminada</label>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-primary-700 text-white py-4 rounded-md font-bold hover:bg-primary-800 transition-colors disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </main>
    </div>
  );
}
