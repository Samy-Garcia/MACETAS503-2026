// se utilizan en Historial, Recompensas y Cupones
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-6 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab
              ? "border-primary-700 text-primary-700"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
