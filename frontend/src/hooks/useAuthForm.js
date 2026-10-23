import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import {
  loginRequest,
  registerRequest,
  recoveryRequest,
  verifyCodeRequest,
  recoveryVerifyCodeRequest,
  newPasswordRequest
} from '../api/authApi';
import { CartContext } from '../context/CartContext.jsx';
import { LoyaltyContext } from '../context/LoyaltyContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';

export const useAuthForm = () => {
  const navigate = useNavigate();

  // El carrito, el programa de fidelidad y la wishlist viven en contextos
  // que se montan UNA sola vez al cargar la app (no en cada página), así
  // que si el usuario inicia sesión sin recargar, se quedan pegados con el
  // estado de "sin sesión" que tenían antes de loguearse -- por eso el
  // carrito y fidelidad se veían vacíos hasta recargar la página a mano.
  // Estos contextos son opcionales aquí (con "?.") como medida de
  // seguridad, por si este hook llegara a usarse en algún lugar que no
  // esté envuelto por sus respectivos Provider -- normalmente sí lo están
  // (se declaran una sola vez, arriba de toda la app).
  const cartContext = useContext(CartContext);
  const loyaltyContext = useContext(LoyaltyContext);
  const wishlistContext = useContext(WishlistContext);

  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm({
    mode: 'onChange' // Valida en tiempo real mientras el usuario escribe
  });

  // 1. INICIO DE SESIÓN
  const onLogin = async (data) => {
    try {
      toast.loading('Verificando credenciales...', { id: 'auth' });
      const response = await loginRequest(data.email, data.password);
      toast.success(`¡Bienvenido de nuevo!`, { id: 'auth' });

      // No se espera a que terminen (no hay necesidad de retrasar la
      // navegación) -- simplemente se disparan para que el carrito, la
      // wishlist y fidelidad ya muestren los datos reales apenas se
      // carguen, sin que el usuario tenga que recargar la página.
      cartContext?.refreshCart();
      loyaltyContext?.refreshLoyalty();
      wishlistContext?.refreshFavorites();

      navigate('/'); // Redirige a la tienda principal
    } catch (error) {
      toast.error(error.message, { id: 'auth' });
    }
  };

  // 2. REGISTRO DE USUARIOS
  const onRegister = async (data) => {
    try {
      toast.loading('Creando tu cuenta...', { id: 'auth' });
      await registerRequest(data);

      // Guardamos el email (solo para mostrarlo en la pantalla de verificación)
      // y marcamos que venimos del flujo de registro, no de recuperación de contraseña.
      localStorage.setItem('verifyEmail', data.email);
      localStorage.setItem('verifyContext', 'register');

      toast.success('¡Cuenta creada! Revisa tu correo para el código de verificación.', { id: 'auth' });
      reset();
      navigate('/verify-code');
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error en el registro.', { id: 'auth' });
    }
  };

  // 3. RECUPERACIÓN (Ingresa tu correo)
  const onRecovery = async (data) => {
    try {
      toast.loading('Enviando código...', { id: 'auth' });
      const response = await recoveryRequest(data.email);
      toast.success(response.message || 'Código enviado con éxito', { id: 'auth' });

      localStorage.setItem('verifyEmail', data.email);
      localStorage.setItem('verifyContext', 'recovery');

      // Redirige a la pantalla para ingresar el código
      navigate('/verify-code'); 
      reset(); 
    } catch (error) {
      toast.error(error.message, { id: 'auth' });
    }
  };

  /// 4. VERIFICACIÓN (Ingresa el código de 6 caracteres)
  const onVerifyCode = async (data) => {
    try {
      toast.loading('Verificando código...', { id: 'auth' });

      const context = localStorage.getItem('verifyContext'); // 'register' | 'recovery'

      if (context === 'recovery') {
        await recoveryVerifyCodeRequest(data.code);
      } else {
        await verifyCodeRequest(data.code);
      }

      if (context === 'register') {
        toast.success('¡Cuenta verificada! Ya puedes iniciar sesión.', { id: 'auth' });
        localStorage.removeItem('verifyEmail');
        localStorage.removeItem('verifyContext');
        navigate('/login');
      } else {
        toast.success('¡Código verificado con éxito!', { id: 'auth' });
        // Mantenemos verifyContext hasta que termine el flujo de reset-password
        navigate('/reset-password');
      }

      reset();
    } catch (error) {
      toast.error(error.message || 'El código ingresado es incorrecto.', { id: 'auth' });
    }
  };

  // 5. CAMBIO DE CONTRASEÑA FINAL (Nueva contraseña)
  const onResetPassword = async (data) => {
    try {
      toast.loading('Actualizando contraseña...', { id: 'auth' });

      await newPasswordRequest(data.password, data.confirmPassword);

      localStorage.removeItem('verifyEmail');
      localStorage.removeItem('verifyContext');

      toast.success('¡Contraseña actualizada! Ya puedes iniciar sesión.', { id: 'auth' });
      navigate('/login');
      reset();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la contraseña.', { id: 'auth' });
    }
  };

  // Retornamos todos los métodos necesarios para tus vistas
  return { 
    register, 
    control,
    handleSubmit, 
    errors, 
    onLogin, 
    onRegister, 
    onRecovery, 
    onVerifyCode, 
    onResetPassword,
    navigate, 
    setValue, 
    watch 
  };
};
