import { GiftIcon, CouponIcon } from "./Icons.jsx";

// historial de puntos
export default function HistoryItem({ item }) {
  const isEarned = item.type === "earned";
  const Icon = isEarned ? GiftIcon : CouponIcon;

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-card px-5 py-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isEarned ? "bg-primary-50 text-primary-700" : "bg-gold-500/20 text-gold-600"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
          <p className="text-xs text-gray-400">{item.date}</p>
        </div>
      </div>

      <div className="text-right">
        <span className={`font-bold ${isEarned ? "text-primary-700" : "text-gold-600"}`}>
          {isEarned ? "+" : ""}
          {item.amount} pts
        </span>
        <p className="text-[11px] text-gray-400">Procesado</p>
      </div>
    </div>
  );
}
