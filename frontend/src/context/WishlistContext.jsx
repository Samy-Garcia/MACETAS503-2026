import { createContext, useState, useEffect, useCallback } from "react";
import { getFavoriteIds, toggleFavorite as toggleFavoriteRequest } from "../api/wishlistApi";

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [favoriteKeys, setFavoriteKeys] = useState(new Set()); // "maceta-<id>" / "vela-<id>"
  const [loading, setLoading] = useState(true);

  const refreshFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const ids = await getFavoriteIds();
      setFavoriteKeys(new Set(ids));
    } catch (err) {
      setFavoriteKeys(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = (productType, productId) => favoriteKeys.has(`${productType}-${productId}`);

  const toggleFavorite = async (productId, productType) => {
    const { inWishlist } = await toggleFavoriteRequest(productId, productType);
    setFavoriteKeys(prev => {
      const next = new Set(prev);
      const key = `${productType}-${productId}`;
      if (inWishlist) next.add(key); else next.delete(key);
      return next;
    });
    return inWishlist;
  };

  return (
    <WishlistContext.Provider value={{ favoriteKeys, loading, isFavorite, toggleFavorite, refreshFavorites }}>
      {children}
    </WishlistContext.Provider>
  );
}
