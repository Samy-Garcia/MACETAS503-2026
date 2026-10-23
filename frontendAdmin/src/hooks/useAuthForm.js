import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginRequest, registerRequest, recoveryRequest, verifyCodeRequest } from '../api/authApi';

export const useAuthForm = () => {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    mode: 'onChange' // Valida en tiempo real mientras el usuario escribe
  });

  // Inicio De Sesión
  const onLogin = async (data) => {
    try {
      toast.loading('Verificando credenciales...', { id: 'auth' });
      const response = await loginRequest(data.email, data.password);
      toast.success(`¡Bienvenido de nuevo!`, { id: 'auth' });
      navigate('/'); // Redirige a la tienda principal
    } catch (error) {
      toast.error(error.message, { id: 'auth' });
    }
  };

  // Registro de usuarios
  const onRegister = async (data) => {
    try {
      toast.loading('Creando tu cuenta...', { id: 'auth' });
      await registerRequest(data);
      toast.success('¡Registro completado! Ya puedes iniciar sesión.', { id: 'auth' });
      reset();
      navigate('/login');
    } catch (error) {
      toast.error('Ocurrió un error en el registro.', { id: 'auth' });
    }
  };

  // 3. Recuperacion
  const onRecovery = async (data) => {
    try {
      toast.loading('Enviando código...', { id: 'auth' });
      const response = await recoveryRequest(data.email);
      toast.success(response.message || 'Código enviado con éxito', { id: 'auth' });
      
      // Redirige a la pantalla para ingresar los 4 dígitos
      navigate('/verify-code'); 
      reset(); 
    } catch (error) {
      toast.error(error.message, { id: 'auth' });
    }
  };

  /// 4. Verificación
  const onVerifyCode = async (data) => {
    try {
      toast.loading('Verificando código...', { id: 'auth' });
      
      toast.success('¡Código verificado con éxito!', { id: 'auth' });
      
      // Redirige directamente a la pantalla final para restablecer la contraseña
      navigate('/reset-password'); 
      reset();
    } catch (error) {
      toast.error(error.message || 'El código ingresado es incorrecto.', { id: 'auth' });
    }
  };

  // 5. (Nueva contraseña)
  const onResetPassword = async (data) => {
    try {
      toast.loading('Actualizando contraseña...', { id: 'auth' });
      
      toast.success('¡Contraseña actualizada! Ya puedes iniciar sesión.', { id: 'auth' });
      navigate('/login');
      reset();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la contraseña.', { id: 'auth' });
    }
  };

  return { 
    register, 
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