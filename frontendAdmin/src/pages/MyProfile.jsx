import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";
import fotoPerfil from "../assets/profile.jpeg";
import ProfileHeader from "../components/ProfileHeader";

export default function UserProfile() {
  const navigate = useNavigate();
  const [userData] = useState({
    nombre: "Jeancarlo",
    apellido: "Araniva",
    email: "jeancarloaraniva@gmail.com",
    avatar: fotoPerfil 
  });

  return (
    <div className="w-full min-h-screen bg-[#e6e6e6] font-sans antialiased text-zinc-800 pb-12">
      
      {/* Header modularizado */}
      <ProfileHeader avatar={userData.avatar} />

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        
        <h1 className="text-3xl font-bold text-[#064225] tracking-tight mb-2">Mi Perfil</h1>

        {/* Info del usuario y Botón Editar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-300 shadow-sm">
              <img src={userData.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{userData.nombre} {userData.apellido}</h2>
              <span className="text-sm text-zinc-400 underline decoration-zinc-300">{userData.email}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/editarperfil")}
            className="bg-[#054021] hover:bg-[#032b16] text-white text-sm font-semibold px-7 py-2 rounded-md transition-all shadow-xs cursor-pointer"
          >
            Editar
          </button>
        </div>

        {/* Inputs del Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 pl-1">Nombre</label>
            <input 
              type="text" 
              value={userData.nombre} 
              readOnly
              className="w-full bg-[#f6f6f6] border border-zinc-300 rounded-md py-3 px-4 text-base text-zinc-700 font-normal focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 pl-1">Apellido</label>
            <input 
              type="text" 
              value={userData.apellido} 
              readOnly
              className="w-full bg-[#f6f6f6] border border-zinc-300 rounded-md py-3 px-4 text-base text-zinc-700 font-normal focus:outline-none"
            />
          </div>
        </div>

        {/* Bloque de Direcciones */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-zinc-900">Direcciones</h3>
            <button 
              onClick={() => navigate("/agregardireccion")}
              className="text-xs font-semibold text-[#064225] hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Agregar
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-md p-6 grid grid-cols-1 md:grid-cols-2 gap-12 shadow-xs">
            {/* Dirección Predeterminada */}
            <div className="text-sm text-zinc-800 leading-relaxed font-normal relative pr-8">
              <span className="text-zinc-400 font-medium block mb-2 text-xs">Dirección Predeterminada</span>
              <p className="font-medium text-zinc-900">{userData.nombre} {userData.apellido}</p>
              <p>Residencial Paseo del Prado</p>
              <p>Apopa, San Salvador</p>
              <p>El Salvador</p>
              <p>+503 2225-3000</p>
              <button className="absolute top-0 right-0 text-zinc-400 hover:text-[#064225] transition-colors p-1 cursor-pointer">
                <Edit2 size={16} />
              </button>
            </div>

            {/* Segunda Dirección */}
            <div className="text-sm text-zinc-800 leading-relaxed font-normal relative pr-8 pt-4 md:pt-0">
              <span className="block mb-2 text-xs text-transparent select-none">-</span>
              <p className="font-medium text-zinc-900">Carlos Amaya</p>
              <p>Residencial Los Sueños</p>
              <p>Zaragoza, La Libertad</p>
              <p>El Salvador</p>
              <p>+503 2215-6000</p>
              <button className="absolute top-0 right-0 text-zinc-400 hover:text-[#064225] transition-colors p-1 cursor-pointer">
                <Edit2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bloque de Métodos de Pago */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-zinc-900">Métodos de Pago</h3>
            <button 
              onClick={() => navigate("/agregarmetododepago")}
              className="text-xs font-semibold text-[#064225] hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Agregar
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-md p-6 flex justify-start shadow-xs">
            <div className="w-72 h-44 bg-gradient-to-br from-[#126b40] via-[#054021] to-[#042616] rounded-xl p-5 flex flex-col justify-between text-white shadow-md relative overflow-hidden select-none">
              <div className="flex items-center">
                <div className="flex">
                  <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-xs"></div>
                  <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-xs -ml-3.5"></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 w-full font-mono">
                <span className="text-lg tracking-widest opacity-95">3456</span>
                <span className="text-[11px] font-sans uppercase tracking-wider font-semibold opacity-80 w-full text-left mt-1">
                  JEANCARLO AARON ARANIVA
                </span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
