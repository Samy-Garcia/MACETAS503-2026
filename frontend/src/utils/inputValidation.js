// Validaciones reutilizables para campos de texto que deben aceptar solo
// letras (nombres, apellidos) o solo números (teléfonos, tarjetas, etc.).
// Se usan de dos formas combinadas para la mejor experiencia:
//   1. onKeyDown={blockNonLetters} / blockNonNumbers -> bloquea la tecla
//      inválida ANTES de que aparezca en el campo, mientras el usuario
//      escribe.
//   2. pattern: lettersPattern / numbersPattern (dentro de register(...) de
//      react-hook-form) -> respaldo, por si el texto inválido llega de
//      otra forma (pegar con el mouse, autocompletado del navegador, etc.)

// Letras (incluye tildes, ñ, espacios, guion y apóstrofe para nombres compuestos)
export const lettersPattern = {
  value: /^[A-Za-zÀ-ÿñÑ\s'-]*$/,
  message: "Este campo solo acepta letras"
};

// Solo dígitos (para campos type="text" que necesitan mantenerlo como texto,
// ej. permitir 0 al inicio; los campos numéricos de negocio como precio o
// stock usan type="number" directamente y no necesitan esto)
export const numbersPattern = {
  value: /^[0-9]*$/,
  message: "Este campo solo acepta números"
};

// Teléfono: números y guiones (formato tipo 7000-0000)
export const phonePattern = {
  value: /^[0-9-]{8,12}$/,
  message: "Número de teléfono inválido"
};

const isControlKey = (e) => e.ctrlKey || e.metaKey || e.key.length > 1;

export const blockNonLetters = (e) => {
  if (isControlKey(e)) return;
  if (!/[A-Za-zÀ-ÿñÑ\s'-]/.test(e.key)) {
    e.preventDefault();
  }
};

export const blockNonNumbers = (e) => {
  if (isControlKey(e)) return;
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};

// Para teléfonos: números y el guion (para que se pueda escribir 7000-0000)
export const blockNonPhoneChars = (e) => {
  if (isControlKey(e)) return;
  if (!/[0-9-]/.test(e.key)) {
    e.preventDefault();
  }
};
