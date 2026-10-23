import { useForm, Controller } from "react-hook-form";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Swal from 'sweetalert2';
import fotoPerfil from "../assets/profile.jpeg";
import ProfileHeader from "../components/ProfileHeader";

const ubicaciones = {
  "San Salvador": ["San Salvador", "Mejicanos", "Santa Tecla", "Soyapango"],
  "La Libertad": ["Santa Tecla", "Zaragoza", "Colón", "Quezaltepeque"],
  "Santa Ana": ["Santa Ana", "Chalchuapa", "Coatepeque"],
  "San Miguel": ["San Miguel", "Quelepa", "Chirilagua"]
};

export default function AddAddress() {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      nombre: "Jeancarlo",
      apellido: "Araniva",
      direccion: "",
      departamento: "",
      municipio: "",
      telefono: "+50369989890",
      predeterminada: false
    }
  });

  const deptoSeleccionado = watch("departamento");
  const onSubmit = (data) => {
    console.log("Datos de dirección:", data);
    Swal.fire({
      title: '¡Dirección Guardada!',
      text: 'La nueva dirección ha sido agregada a tu cuenta.',
      icon: 'success',
      confirmButtonText: 'Aceptar', confirmButtonColor: '#064225'
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f4f4] font-sans text-zinc-800 pb-16">
      {/* HEADER */}
      <ProfileHeader avatar={fotoPerfil} />

      <main className="max-w-4xl mx-auto px-6 pt-20 pb-12 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-[#064225] mb-8">Agregar Dirección</h1>

        {/* INFO USUARIO */}
        <div className="flex items-center gap-4 mb-8">
          <img src={fotoPerfil} alt="User" className="w-16 h-16 rounded-full object-cover" />
          <div>
            <h2 className="font-bold">Jeancarlo Araniva</h2>
            <p className="text-sm text-zinc-500 underline">jeancarloaraniva@gmail.com</p>
          </div>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-600">Nombre *</label>
              <input 
                {...register("nombre", { 
                  required: "El nombre es obligatorio",
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message: "Solo letras permitidas"
                  }
                })} 
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                }}
                className={`p-3 border rounded-md bg-white ${errors.nombre ? 'border-red-500' : 'border-zinc-300'}`} 
              />
              {errors.nombre && <span className="text-xs text-red-500">{errors.nombre.message}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-600">Apellido *</label>
              <input 
                {...register("apellido", { 
                  required: "El apellido es obligatorio",
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message: "Solo letras permitidas"
                  }
                })} 
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                }}
                className={`p-3 border rounded-md bg-white ${errors.apellido ? 'border-red-500' : 'border-zinc-300'}`} 
              />
              {errors.apellido && <span className="text-xs text-red-500">{errors.apellido.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-600">Dirección *</label>
            <input {...register("direccion", { required: true })} className="p-3 border border-zinc-300 rounded-md bg-white" />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-600">Departamento *</label>
              <select 
                {...register("departamento", { 
                  required: true,
                  onChange: () => setValue("municipio", "") 
                })} 
                className="p-3 border border-zinc-300 rounded-md bg-white"
              >
                <option value="">Seleccione...</option>
                {Object.keys(ubicaciones).map(depto => <option key={depto} value={depto}>{depto}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-600">Municipio *</label>
              <select 
                {...register("municipio", { required: true })} 
                disabled={!deptoSeleccionado}
                className="p-3 border border-zinc-300 rounded-md bg-white disabled:bg-zinc-100"
              >
                <option value="">{deptoSeleccionado ? "Seleccione..." : "---"}</option>
                {deptoSeleccionado && ubicaciones[deptoSeleccionado].map(muni => (
                  <option key={muni} value={muni}>{muni}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-600">Número de Telefono *</label>
            <Controller
              name="telefono"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  international
                  defaultCountry="SV"
                  value={value} 
                  onChange={onChange}
                  className="p-3 border border-zinc-300 rounded-md bg-white [&_.PhoneInputInput]:outline-none"
                />
              )}
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" {...register("predeterminada")} className="w-5 h-5 accent-[#064225] cursor-pointer" />
            <label className="text-sm">Establecer como dirección predeterminada</label>
          </div>

          <button type="submit" className="w-full bg-[#054021] text-white py-4 rounded-md font-bold hover:bg-[#032b16] transition-colors">
            Guardar
          </button>
        </form>
      </main>
    </div>
  );
}