import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaymentForm } from "../hooks/usePaymentForm";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { savePaymentMethod } from "../api/profileApi";
import Swal from 'sweetalert2';

export default function AddPaymentMethod() {

    useEffect(() => {
        document.title = "Agregar Método de Pago | Macetas503";
    }, []);

    const navigate = useNavigate();
    const { avatar } = useContext(ProfileContext);
    const [guardando, setGuardando] = useState(false);
    const [errorGuardar, setErrorGuardar] = useState('');

    // Usamos nuestro Custom Hook
    const { register, handleSubmit, errors } = usePaymentForm();

    const onSubmit = async (data) => {
        setErrorGuardar('');
        setGuardando(true);
        try {
            // "expiracion" viene como "MM/AA" -- se parte en mes/año numéricos,
            // que es lo que espera la tokenización de Wompi (igual que en el
            // checkout). "AA" se interpreta como 20AA.
            const [mesStr, anioStr] = (data.expiracion || '').split('/');
            const mesVencimiento = Number(mesStr);
            const anioVencimiento = Number(anioStr?.length === 2 ? `20${anioStr}` : anioStr);

            if (!mesVencimiento || !anioVencimiento) {
                setErrorGuardar('La fecha de expiración debe tener el formato MM/AA.');
                setGuardando(false);
                return;
            }

            await savePaymentMethod({
                numeroTarjeta: data.numeroTarjeta.replace(/\s+/g, ''),
                cvv: data.cvv,
                mesVencimiento,
                anioVencimiento,
                nombreEnTarjeta: data.titular,
            });

            await Swal.fire({
                title: '¡Método de Pago Agregado!',
                text: 'Tu tarjeta se ha guardado de forma segura y ya puedes usarla al pagar.',
                icon: 'success',
                confirmButtonText: 'Aceptar', confirmButtonColor: '#064225'
            });

            navigate('/perfil');
        } catch (err) {
            setErrorGuardar(err.message || 'No se pudo guardar la tarjeta.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-page font-sans text-zinc-800 pb-16">
            <ProfileHeader avatar={avatar} />

            <main className="max-w-4xl mx-auto px-6 pt-20 pb-12 flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-zinc-900 mb-8">Agregar Método de Pago</h1>

                <p className="text-xs text-zinc-500 -mt-6">
                    Este es un proyecto escolar: la tarjeta se tokeniza en modo de prueba con Wompi (no se realiza ningún cobro real).
                </p>

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
                            className={`w-full p-3 border rounded-md bg-surface ${errors.numeroTarjeta ? 'border-red-500' : 'border-zinc-300'}`}
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
                            className={`w-full p-3 border rounded-md bg-surface ${errors.titular ? 'border-red-500' : 'border-zinc-300'}`}
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
                                className="p-3 border border-zinc-300 rounded-md bg-surface"
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
                                className="p-3 border border-zinc-300 rounded-md bg-surface"
                            />
                        </div>
                    </div>

                    {errorGuardar && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{errorGuardar}</div>
                    )}

                    <button
                        type="submit"
                        disabled={guardando}
                        className="w-full bg-primary-700 text-white py-4 rounded-md font-bold hover:bg-primary-800 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                </form>
            </main>
        </div>
    );
}
