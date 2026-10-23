import { createContext, useState, useEffect, useCallback } from "react";
import { LEVELS } from "../utils/constants.js";
import { getMyLoyalty } from "../api/loyaltyApi";

export const LoyaltyContext = createContext(null);

export function LoyaltyProvider({ children }) {
  const [userName, setUserName] = useState("");
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [referralCode, setReferralCode] = useState(null);
  const [birthdayStatus, setBirthdayStatus] = useState("no-date");
  const [loading, setLoading] = useState(true);

  // Trae del backend los puntos, historial y código de referido reales
  const refreshLoyalty = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyLoyalty();
      setUserName(data.userName || "");
      setPoints(data.points || 0);
      setHistory(data.history || []);
      setReferralCode(data.referralCode || null);
      setBirthdayStatus(data.birthdayStatus || "no-date");
    } catch (err) {
      // sin sesión: dejamos todo en 0, las pantallas se encargan de pedir login
      setPoints(0);
      setHistory([]);
      setReferralCode(null);
      setBirthdayStatus("no-date");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLoyalty();
  }, [refreshLoyalty]);

  // Nivel actual según los puntos reales
  const currentLevelIndex = LEVELS.findIndex(
    (lvl, i) =>
      points >= lvl.min && (i === LEVELS.length - 1 || points < LEVELS[i + 1].min)
  );
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1] ?? null;

  const value = {
    userName,
    points,
    history,
    referralCode,
    birthdayStatus,
    loading,
    currentLevel,
    nextLevel,
    refreshLoyalty,
  };

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}
