// Botón  con unas variantes de color con el diseño 
const VARIANTS = {
  primary: "bg-primary-700 hover:bg-primary-800 text-white",
  gold: "bg-gold-500 hover:bg-gold-600 text-primary-900",
  outline: "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200",
};

export default function Button({ variant = "primary", className = "", children, ...rest }) {
  return (
    <button
      className={`px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
