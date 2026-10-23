import { createContext, useState, useEffect, useCallback } from "react";
import { getMyCart, addToCart as addToCartRequest, addCustomOrderToCart as addCustomOrderToCartRequest, updateCartItem as updateCartItemRequest, removeFromCart as removeFromCartRequest, checkoutCart } from "../api/cartApi";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ products: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // se corrige solo al primer fetch

  // Trae el carrito real del backend (silencioso: si no hay sesión, simplemente
  // deja el carrito vacío en vez de tronar toda la app)
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyCart();
      setCart(data);
      setIsAuthenticated(true);
    } catch (err) {
      // 401 = no ha iniciado sesión; no es un error real que haya que mostrar
      setCart({ products: [], total: 0 });
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, productType, quantity = 1, color = null) => {
    const data = await addToCartRequest({ productId, productType, quantity, color });
    setCart(data);
    return data;
  };

  const addCustomOrderToCart = async (customOrderId, quantity = 1) => {
    const data = await addCustomOrderToCartRequest({ customOrderId, quantity });
    setCart(data);
    return data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const data = await updateCartItemRequest(itemId, quantity);
    setCart(data);
    return data;
  };

  const removeItem = async (itemId) => {
    const data = await removeFromCartRequest(itemId);
    setCart(data);
    return data;
  };

  const checkout = async (shippingInfo) => {
    const data = await checkoutCart(shippingInfo);
    // Después de confirmar el pedido, el carrito "activo" queda vacío de nuevo
    setCart({ products: [], total: 0 });
    return data;
  };

  const itemCount = cart.products.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isAuthenticated,
        itemCount,
        refreshCart,
        addToCart,
        addCustomOrderToCart,
        updateQuantity,
        removeItem,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
