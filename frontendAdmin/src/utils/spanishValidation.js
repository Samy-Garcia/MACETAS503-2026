// Los globos de validación nativos del navegador ("Please fill out this
// field", "Please enter a valid email address", "Value must be greater than
// or equal to...") salen en el idioma del NAVEGADOR, no de la página, así que
// a quien lo tiene en inglés le aparecían en inglés. Este archivo los
// reemplaza por mensajes en español para TODOS los formularios del sitio sin
// tener que tocar cada campo.

const formatearFecha = (iso) => {
  const [y, m, d] = String(iso).split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

const mensajeEnEspanol = (el) => {
  const v = el.validity;
  if (v.valueMissing) {
    if (el.type === "checkbox") return "Debes marcar esta casilla para continuar";
    if (el.type === "radio") return "Selecciona una de las opciones";
    if (el.type === "file") return "Selecciona un archivo";
    if (el.tagName === "SELECT") return "Selecciona una opción de la lista";
    return "Completa este campo";
  }
  if (v.typeMismatch) {
    if (el.type === "email") return "Ingresa un correo electrónico válido (ej: nombre@correo.com)";
    if (el.type === "url") return "Ingresa una dirección web válida (ej: https://...)";
    return "El formato no es válido";
  }
  if (v.patternMismatch) return el.title || "El formato no es válido";
  if (v.tooShort) return `Debe tener al menos ${el.minLength} caracteres`;
  if (v.tooLong) return `No puede tener más de ${el.maxLength} caracteres`;
  if (v.rangeUnderflow) {
    return el.type === "date"
      ? `La fecha no puede ser anterior al ${formatearFecha(el.min)}`
      : `El valor debe ser mayor o igual a ${el.min}`;
  }
  if (v.rangeOverflow) {
    return el.type === "date"
      ? `La fecha no puede ser posterior al ${formatearFecha(el.max)}`
      : `El valor debe ser menor o igual a ${el.max}`;
  }
  if (v.stepMismatch) return "Ingresa un valor válido";
  if (v.badInput) return "Ingresa un valor válido";
  return "";
};

export const activarValidacionEnEspanol = () => {
  // "invalid" no burbujea, por eso se escucha en la fase de captura.
  document.addEventListener(
    "invalid",
    (e) => {
      const el = e.target;
      if (el && typeof el.setCustomValidity === "function") {
        el.setCustomValidity("");
        el.setCustomValidity(mensajeEnEspanol(el));
      }
    },
    true
  );
  // Al corregir el campo se limpia el mensaje; si no, el campo se quedaría
  // marcado como inválido para siempre.
  const limpiar = (e) => {
    if (e.target && typeof e.target.setCustomValidity === "function") {
      e.target.setCustomValidity("");
    }
  };
  document.addEventListener("input", limpiar, true);
  document.addEventListener("change", limpiar, true);
};
