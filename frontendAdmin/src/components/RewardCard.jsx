import Button from "./Button.jsx";

// Tarjeta de cupóny recompensa que se usa en Recompensas y Cupones
export default function RewardCard({ reward, onRedeem, redeemed = false }) {
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col">
      <div className="relative">
        <img src={reward.image} alt={reward.title} className="w-full h-40 object-cover" />
        <span className="absolute top-3 left-3 bg-gold-500 text-primary-900 text-[11px] font-bold px-2 py-1 rounded-full">
          {reward.cost} hojas
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-gray-800">{reward.title}</h4>
        <p className="text-xs text-gray-500 mt-1 mb-4 flex-1">{reward.description}</p>

        <Button
          variant={redeemed ? "outline" : "primary"}
          disabled={redeemed}
          onClick={() => onRedeem?.(reward)}
          className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {redeemed ? "Canjeado" : "Canjear"}
        </Button>
      </div>
    </div>
  );
}
