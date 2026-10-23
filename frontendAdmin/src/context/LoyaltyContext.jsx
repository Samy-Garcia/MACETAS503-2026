import { createContext, useState } from "react";
import { LEVELS } from "../utils/constants.js";

export const LoyaltyContext = createContext(null);

export function LoyaltyProvider({ children }) {
  const [userName] = useState("Jeancarlo");
  const [points, setPoints] = useState(0);

  // Historial de movimientos que se hacen se llena cuando el usuario gana o canjea
  const [history, setHistory] = useState([]);

  // aqui se ve el nivel actual según los puntos
  const currentLevelIndex = LEVELS.findIndex(
    (lvl, i) =>
      points >= lvl.min && (i === LEVELS.length - 1 || points < LEVELS[i + 1].min)
  );
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1] ?? null;

  // Suman los  puntos y registra en el historial
  const addPoints = (amount, title) => {
    setPoints((prev) => prev + amount);
    setHistory((prev) => [
      { id: Date.now(), title, date: "Hoy", amount, type: "earned" },
      ...prev,
    ]);
  };

  // Resta puntos al canjear un cupón y recompensa
  const redeemPoints = (amount, title) => {
    if (amount > points) return false;
    setPoints((prev) => prev - amount);
    setHistory((prev) => [
      { id: Date.now(), title, date: "Hoy", amount: -amount, type: "redeemed" },
      ...prev,
    ]);
    return true;
  };

  const value = {
    userName,
    points,
    history,
    currentLevel,
    nextLevel,
    addPoints,
    redeemPoints,
  };

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}
