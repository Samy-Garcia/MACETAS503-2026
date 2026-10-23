import { ChevronLeftIcon, ChevronRightIcon } from "./Icons.jsx";

// componente en estilo de Historial, Recompensas y Cupones
export default function Pagination({ page, totalPages, onPrev, onNext, onGoTo }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onGoTo(n)}
          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
            n === page
              ? "bg-primary-700 text-white"
              : "text-gray-600 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          {n}
        </button>
      ))}

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
