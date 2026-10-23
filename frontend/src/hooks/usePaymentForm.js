import { useForm } from "react-hook-form";

export const usePaymentForm = (defaultValues = {}) => {
  const form = useForm({
    defaultValues: {
      numeroTarjeta: "",
      titular: "",
      expiracion: "",
      cvv: "",
      ...defaultValues
    }
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return {
    register,
    handleSubmit,
    errors,
  };
};