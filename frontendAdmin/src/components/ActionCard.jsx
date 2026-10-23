// Tarjeta usada en Home  y en Ganar Puntos.
export default function ActionCard({ icon: Icon, title, description, badge, actionLabel, onAction }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 flex flex-col relative">
      {badge && (
        <span className="absolute top-4 right-4 bg-primary-700 text-white text-[11px] font-semibold px-2 py-1 rounded-full">
          {badge}
        </span>
      )}

      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary-700" />
      </div>

      <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 mb-4 flex-1">{description}</p>

      {actionLabel && (
        <button
          onClick={onAction}
          className="border border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white text-sm font-semibold rounded-md py-2 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
