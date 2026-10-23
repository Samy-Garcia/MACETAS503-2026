import { Link } from "react-router";
import { useLoyalty } from "../hooks/useLoyalty.js";
import { LEVELS, formatNumber } from "../utils/constants.js";
import { GiftIcon } from "./Icons.jsx";
import leafIcon from "../assets/icon-leaf.png";
import historyIcon from "../assets/icon-history.png";
import couponIcon from "../assets/icon-coupon.png";

//muestra nivel actual de las hojos, balance y barra de progreso de puntos
export default function LevelProgressCard() {
  const { points, currentLevel, nextLevel } = useLoyalty();

  const floorPoints = currentLevel.min;
  const ceilPoints = nextLevel ? nextLevel.min : floorPoints;
  const progress = nextLevel
    ? Math.min(100, ((points - floorPoints) / (ceilPoints - floorPoints)) * 100)
    : 100;
  const remaining = nextLevel ? nextLevel.min - points : 0;

  return (
    <div className="bg-white rounded-xl shadow-card p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs font-semibold text-gold-600 uppercase tracking-wide">Nivel Actual</span>
            <h3 className="text-lg font-bold text-gray-800">{currentLevel.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 block">Balance de Hojas</span>
            <span className="text-2xl font-bold text-primary-700 inline-flex items-center gap-1">
              {formatNumber(points)} <img src={leafIcon} alt="hojas" className="w-5 h-5" />
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          {nextLevel
            ? `Te faltan ${formatNumber(remaining)} puntos para el nivel ${nextLevel.name}`
            : "¡Alcanzaste el nivel máximo!"}
        </p>

        {/* Barra de progreso */}
        <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          {LEVELS.map((lvl) => (
            <span key={lvl.name}>{lvl.name}</span>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-3 min-w-[260px]">
        <Link to="/ganar-puntos">
          <div className="bg-primary-800 hover:bg-primary-900 text-white rounded-lg p-4 h-full flex flex-col justify-center items-center gap-1 transition-colors cursor-pointer">
            <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <img src={leafIcon} alt="" className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold">Ganar Puntos</span>
          </div>
        </Link>
        <Link to="/recompensas">
          <div className="bg-gold-500 hover:bg-gold-600 text-primary-900 rounded-lg p-4 h-full flex flex-col justify-center items-center gap-1 transition-colors cursor-pointer">
            <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <GiftIcon className="w-4 h-4 text-primary-800" />
            </span>
            <span className="text-sm font-semibold">Canjear</span>
          </div>
        </Link>
        <Link to="/historial">
          <div className="bg-white border border-gray-200 hover:border-primary-300 text-gray-700 rounded-lg p-4 h-full flex flex-col justify-center items-center gap-1 transition-colors cursor-pointer">
            <span className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
              <img src={historyIcon} alt="" className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold">Historial</span>
          </div>
        </Link>
        <Link to="/cupones">
          <div className="bg-white border border-gray-200 hover:border-primary-300 text-gray-700 rounded-lg p-4 h-full flex flex-col justify-center items-center gap-1 transition-colors cursor-pointer">
            <span className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
              <img src={couponIcon} alt="" className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold">Cupones</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
