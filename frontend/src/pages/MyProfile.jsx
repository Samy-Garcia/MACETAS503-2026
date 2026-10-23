import Avatar from "../components/Avatar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import fotoPerfil from "../assets/profile.jpeg";
import ProfileHeader from "../components/ProfileHeader";
import { getMyProfile, deleteAddress, deletePaymentMethod } from "../api/profileApi";
import toast from "react-hot-toast";
import { logoutRequest } from "../api/authApi";
import Swal from "sweetalert2";

export default function UserProfile() {
  useEffect(() => {
    document.title = "Mi Perfil | Macetas503";
  }, []);

  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarPerfil = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || "No se pudo cargar tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    try {
      const addresses = await deleteAddress(addressId);
      setProfile((prev) => ({ ...prev, addresses }));
      toast.success("Dirección eliminada");
    } catch (err) {
      toast.error(err.message || "No se pudo eliminar la dirección.");
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!window.confirm("¿Eliminar tu tarjeta guardada?")) return;
    try {
      await deletePaymentMethod();
      setProfile((prev) => ({ ...prev, savedCard: null }));
      toast.success("Tarjeta eliminada");
    } catch (err) {
      toast.error(err.message || "No se pudo eliminar la tarjeta.");
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas cerrar tu sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-primary-700)",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await logoutRequest();

      await Swal.fire({
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "var(--color-primary-700)",
      });

      navigate("/login");
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "No se pudo cerrar sesión.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "var(--color-primary-700)",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-page flex items-center justify-center text-zinc-500">
        Cargando perfil...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-screen bg-page flex flex-col items-center justify-center gap-4 text-zinc-500">
        <p>{error || "No se pudo cargar tu perfil."}</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  const avatar = profile.photo || fotoPerfil;

  return (
    <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 pb-12">
      <ProfileHeader avatar={avatar} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
          Mi Perfil
        </h1>

        {/* Info del usuario y Botón Editar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div className="flex items-center gap-4 min-w-0">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-zinc-300 shadow-sm shrink-0">
      <Avatar src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
    </div>
    <div className="flex flex-col min-w-0">
      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight truncate">
        {profile.name} {profile.lastName}
      </h2>
      <span className="text-sm text-zinc-400 underline decoration-zinc-300 truncate">
        {profile.email}
      </span>
    </div>
  </div>
  <button
    onClick={() => navigate("/editarperfil")}
    className="bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold px-7 py-2 rounded-md transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
  >
    Editar
  </button>
</div>

        {/* Datos (solo lectura aquí, se editan en /editarperfil) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 pl-1">
              Nombre
            </label>
            <input
              type="text"
              value={profile.name || ""}
              readOnly
              className="w-full bg-page border border-zinc-300 rounded-md py-3 px-4 text-base text-zinc-700 font-normal focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 pl-1">
              Apellido
            </label>
            <input
              type="text"
              value={profile.lastName || ""}
              readOnly
              className="w-full bg-page border border-zinc-300 rounded-md py-3 px-4 text-base text-zinc-700 font-normal focus:outline-none"
            />
          </div>
        </div>

        {/* Bloque de Direcciones */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-zinc-900">Direcciones</h3>
            <button
              onClick={() => navigate("/agregardireccion")}
              className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Agregar
            </button>
          </div>

          {profile.addresses && profile.addresses.length > 0 ? (
            <div className="bg-surface border border-zinc-200 rounded-md p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 shadow-xs">
              {profile.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="text-sm text-zinc-800 leading-relaxed font-normal relative pr-16"
                >
                  <span className="text-zinc-400 font-medium block mb-2 text-xs">
                    {addr.isDefault ? "Dirección Predeterminada" : ""}
                  </span>
                  <p className="font-medium text-zinc-900">{addr.fullName}</p>
                  <p>{addr.addressLine}</p>
                  {(addr.municipality || addr.department) && (
                    <p>{[addr.municipality, addr.department].filter(Boolean).join(", ")}</p>
                  )}
                  <p>{addr.phone}</p>
                  <div className="absolute top-0 right-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        navigate("/agregardireccion", {
                          state: { address: addr },
                        })
                      }
                      className="text-zinc-400 hover:text-primary-700 transition-colors p-1 cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-zinc-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-zinc-200 rounded-md p-6 text-sm text-zinc-400 shadow-xs">
              Todavía no tienes ninguna dirección guardada.
            </div>
          )}
        </div>

        {/* Bloque de Métodos de Pago */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-zinc-900">Métodos de Pago</h3>
            {!profile.savedCard && (
              <button
                onClick={() => navigate("/agregarmetododepago")}
                className="text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Agregar
              </button>
            )}
          </div>

          {profile.savedCard ? (
            <div className="bg-surface border border-zinc-200 rounded-md p-6 flex justify-start shadow-xs">
              <div className="w-72 h-44 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-xl p-5 flex flex-col justify-between text-white shadow-md relative overflow-hidden select-none">
                <div className="flex items-center justify-between">
                  <div className="flex">
                    <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-xs"></div>
                    <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-xs -ml-3.5"></div>
                  </div>
                  <button
                    onClick={handleDeletePaymentMethod}
                    className="text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Eliminar tarjeta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1 w-full font-mono">
                  <span className="text-lg tracking-widest opacity-95">
                    {profile.savedCard.maskedNumber || "**** **** **** ****"}
                  </span>
                  <span className="text-[11px] font-sans uppercase tracking-wider font-semibold opacity-80 w-full text-left mt-1">
                    {profile.savedCard.cardHolderName || `${profile.name} ${profile.lastName}`}
                  </span>
                  {profile.savedCard.expMonth && profile.savedCard.expYear && (
                    <span className="text-[11px] font-sans opacity-80 w-full text-left">
                      Vence {String(profile.savedCard.expMonth).padStart(2, "0")}/{String(profile.savedCard.expYear).slice(-2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-zinc-200 rounded-md p-6 text-sm text-zinc-400 shadow-xs">
              Todavía no tienes ningún método de pago guardado.
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleLogout}
              className="px-7 py-2.5 border border-red-500 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-md transition-all cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
