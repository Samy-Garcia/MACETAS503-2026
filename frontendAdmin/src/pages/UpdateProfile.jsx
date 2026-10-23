import { useState } from "react";
// Corregido: Importación por defecto sin llaves para la imagen
import fotoPerfil from "../assets/profile.jpeg";
import ProfileHeader from "../components/ProfileHeader";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useForm, Controller } from "react-hook-form";
import Swal from 'sweetalert2';

export default function UpdateProfile() {
  // Inicializamos React Hook Form con los valores por defecto del boceto
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nombre: "Jeancarlo",
      apellido: "Araniva",
      correo: "jeancarloaraniva@gmail.com",
      contrasena: "ones2345", 
      genero: "Masculino",
      telefono: "+50369989890" 
    }
  });

  // Función que se ejecuta cuando el formulario pasa todas las validaciones
  const onSubmit = (data) => {
    console.log("Datos validados y listos para guardar:", data);
    Swal.fire({
      title: '¡Perfil Actualizado!',
      text: 'Tus datos se han guardado correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar', confirmButtonColor: '#064225'
    });
  };

  // Función para manejar el clic en editar foto (implementar lógica aquí)
  const handleEditPhoto = () => {
    // Ejemplo: abrir un input de archivo oculto o un modal
    console.log("Editar foto clickeado");
    // document.getElementById('photoInput').click(); 
  };

  return (
    <div className="w-full min-h-screen bg-[#e6e6e6] font-sans antialiased text-zinc-800 pb-16">
      
      {/* ================= HEADER MINIMALISTA ================= */}
      <ProfileHeader avatar={fotoPerfil} />

      {/* ================= CONTENIDO: DATOS DE CUENTA ================= */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        
        <h1 className="text-3xl font-bold text-[#064225] tracking-tight mb-2">
          Datos de cuenta
        </h1>

        {/* ================= AVATAR CON EDICIÓN HOVER ================= */}
        <div className="flex items-center gap-6">
          {/* Contenedor del Avatar con posición relativa para el overlay */}
          <div 
            className="group relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
            onClick={handleEditPhoto}
          >
            {/* Imagen de perfil actual */}
            <img src={fotoPerfil} alt="User Avatar" className="w-full h-full object-cover" />

            {/* Capa de superposición (Overlay) que aparece al hacer hover */}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Icono de cámara (usando SVG simple) */}
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              {/* Texto de editar */}
              <span className="text-white text-xs font-medium tracking-wide">
                Editar
              </span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Jeancarlo Araniva
            </h2>
            <span className="text-base text-zinc-500 underline decoration-zinc-300 mt-1">
              jeancarloaraniva@gmail.com
            </span>
          </div>
        </div>

        {/* Formulario conectado a React Hook Form */}
        <form className="flex flex-col gap-6 mt-4" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Fila: Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-base font-normal text-zinc-900 pl-1">
                Nombre <span className="text-zinc-300 font-light">*</span>
              </label>
              <input 
                type="text" 
                {...register("nombre", { 
                  required: "El nombre es obligatorio",
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message: "No se admiten números ni caracteres especiales"
                  }
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                }}
                className={`w-full bg-[#f6f6f6] border rounded-md py-3.5 px-4 text-base text-zinc-700 font-normal focus:outline-none bg-white transition-colors ${
                  errors.nombre ? "border-red-500 focus:border-red-500" : "border-zinc-300 focus:border-[#064225]"
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
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message: "No se admiten números ni caracteres especiales"
                  }
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                }}
                className={`w-full bg-[#f6f6f6] border rounded-md py-3.5 px-4 text-base text-zinc-700 font-normal focus:outline-none bg-white transition-colors ${
                  errors.apellido ? "border-red-500 focus:border-red-500" : "border-zinc-300 focus:border-[#064225]"
                }`}
              />
              {errors.apellido && <span className="text-xs text-red-500 pl-1">{errors.apellido.message}</span>}
            </div>
          </div>

          {/* Campo: Correo */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-normal text-zinc-900 pl-1">
              Correo <span className="text-zinc-300 font-light">*</span>
            </label>
            <input 
              type="email" 
              {...register("correo", { 
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Formato de correo no válido"
                }
              })}
              className={`w-full bg-[#f6f6f6] border rounded-md py-3.5 px-4 text-base text-zinc-700 font-normal focus:outline-none bg-white transition-colors ${
                errors.correo ? "border-red-500 focus:border-red-500" : "border-zinc-300 focus:border-[#064225]"
              }`}
            />
            {errors.correo && <span className="text-xs text-red-500 pl-1">{errors.correo.message}</span>}
          </div>

          {/* Campo: Contraseña */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-normal text-zinc-900 pl-1">
              Contraseña <span className="text-zinc-300 font-light">*</span>
            </label>
            <input 
              type="password" 
              {...register("contrasena", { 
                required: "La contraseña es obligatoria",
                minLength: { value: 6, message: "Debe tener al menos 6 caracteres" }
              })}
              className={`w-full bg-[#f6f6f6] border rounded-md py-3.5 px-4 text-base text-zinc-400 font-normal tracking-widest focus:outline-none bg-white transition-colors ${
                errors.contrasena ? "border-red-500 focus:border-red-500" : "border-zinc-300 focus:border-[#064225]"
              }`}
            />
            {errors.contrasena && <span className="text-xs text-red-500 pl-1">{errors.contrasena.message}</span>}
          </div>

          {/* Fila: Género y Número de Teléfono Internacional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Custom Select para Género */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-normal text-zinc-900 pl-1">
                Género
              </label>
              <div className="relative">
                <select 
                  {...register("genero")}
                  className="w-full bg-[#f6f6f6] border border-zinc-300 rounded-md py-3.5 px-4 text-base text-zinc-700 font-normal appearance-none focus:outline-none focus:border-[#064225] bg-white transition-colors cursor-pointer"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Input de Teléfono Controlado */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-normal text-zinc-900 pl-1">
                Número de Telefono <span className="text-zinc-300 font-light">*</span>
              </label>
              <div className="w-full">
                <Controller
                  name="telefono"
                  control={control}
                  rules={{ required: "El número de teléfono es obligatorio" }}
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      international
                      defaultCountry="SV"
                      placeholder="6998-9890"
                      value={value}
                      onChange={onChange}
                      className={`flex w-full rounded-md border bg-[#f6f6f6] focus-within:bg-white transition-colors overflow-hidden [&_.PhoneInputCountry]:bg-zinc-100 [&_.PhoneInputCountry]:px-4 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-zinc-300 [&_.PhoneInputCountrySelectArrow]:text-zinc-400 [&_.PhoneInputCountrySelectArrow]:text-[10px] [&_input]:w-full [&_input]:bg-transparent [&_input]:py-3.5 [&_input]:px-4 [&_input]:text-base [&_input]:text-zinc-700 [&_input]:font-normal [&_input]:focus:outline-none ${
                        errors.telefono ? "border-red-500 focus-within:border-red-500" : "border-zinc-300 focus-within:border-[#064225]"
                      }`}
                    />
                  )}
                />
              </div>
              {errors.telefono && <span className="text-xs text-red-500 pl-1">{errors.telefono.message}</span>}
            </div>

          </div>

          {/* Botón Guardar ancho completo inferior */}
          <div className="w-full mt-8">
            <button 
              type="submit"
              className="w-full bg-[#054021] hover:bg-[#032b16] text-white text-base font-semibold py-4 rounded-md transition-all shadow-sm cursor-pointer tracking-wide"
            >
              Guardar
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
