import { usePaymentForm } from "../hooks/usePaymentForm";
import fotoPerfil from "../assets/profile.jpeg";
import ProfileHeader from "../components/ProfileHeader";
import Swal from 'sweetalert2';

export default function AddPaymentMethod() {
    // Usamos nuestro Custom Hook
    const { register, handleSubmit, errors } = usePaymentForm({
        numeroTarjeta: "1234 5678 9012 3456", // Valores iniciales si los necesitas
        titular: "JEANCARLO ARANIVA"
    });

    const onSubmit = (data) => {
        console.log("Datos de pago procesados:", data);
        Swal.fire({
            title: '¡Método de Pago Agregado!',
            text: 'Tu tarjeta se ha guardado de forma segura.',
            icon: 'success',
            confirmButtonText: 'Aceptar', confirmButtonColor: '#064225'
        });
    };

    return (
        <div className="w-full min-h-screen bg-[#f4f4f4] font-sans text-zinc-800 pb-16">
            <ProfileHeader avatar={fotoPerfil} />

            <main className="max-w-4xl mx-auto px-6 pt-20 pb-12 flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-[#064225] mb-8">Agregar Método de Pago</h1>

                <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-zinc-600">Número de Tarjeta *</label>
                        <input
                            {...register("numeroTarjeta", { 
                                required: "Este campo es obligatorio",
                                pattern: {
                                    value: /^[\d\s]+$/,
                                    message: "Solo se admiten números y espacios"
                                }
                            })}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^\d\s]/g, '');
                            }}
                            maxLength={19}
                            className={`w-full p-3 border rounded-md bg-white ${errors.numeroTarjeta ? 'border-red-500' : 'border-zinc-300'}`}
                        />
                        {errors.numeroTarjeta && <p className="text-red-500 text-xs">{errors.numeroTarjeta.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-zinc-600">Titular *</label>
                        <input
                            {...register("titular", { 
                                required: "El nombre del titular es requerido",
                                pattern: {
                                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                    message: "Solo letras permitidas"
                                }
                            })}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                            }}
                            className={`w-full p-3 border rounded-md bg-white ${errors.titular ? 'border-red-500' : 'border-zinc-300'}`}
                        />
                        {errors.titular && <p className="text-red-500 text-xs">{errors.titular.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-600">Fecha de Expiración (MM/AA) *</label>
                            <input
                                {...register("expiracion", { required: true })}
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/[^\d/]/g, '');
                                }}
                                maxLength={5}
                                placeholder="MM/AA"
                                className="p-3 border border-zinc-300 rounded-md bg-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-600">CVV *</label>
                            <input
                                {...register("cvv", { required: true })}
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/\D/g, '');
                                }}
                                maxLength={4}
                                className="p-3 border border-zinc-300 rounded-md bg-white"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#054021] text-white py-4 rounded-md font-bold hover:bg-[#032b16] transition-colors mt-4">
                        Guardar
                    </button>
                </form>
            </main>
        </div>
    );
}
