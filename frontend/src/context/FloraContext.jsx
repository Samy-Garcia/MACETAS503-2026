import React, { createContext, useContext, useState, useEffect } from 'react';

const FloraContext = createContext();

export const FloraProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const detectPage = () => {
      const path = window.location.pathname;
      
      if (path === '/' || path === '/home') return 'home';
      if (path.includes('/productos') || path.includes('/catalogo')) return 'catalog';
      if (path.includes('/producto/') || path.includes('/detalle/')) return 'product';
      if (path.includes('/carrito') || path.includes('/cart')) return 'cart';
      if (path.includes('/checkout') || path.includes('/pago')) return 'checkout';
      if (path.includes('/pedidos') || path.includes('/orders')) return 'orders';
      if (path.includes('/wishlist') || path.includes('/lista-deseos')) return 'wishlist';
      if (path.includes('/perfil') || path.includes('/profile')) return 'profile';
      if (path.includes('/recompensas') || path.includes('/rewards')) return 'rewards';
      if (path.includes('/guia-cuidados') || path.includes('/guide-care')) return 'guide';
      if (path.includes('/faq') || path.includes('/preguntas')) return 'faq';
      
      return 'home';
    };

    setCurrentPage(detectPage());

    const handleRouteChange = () => {
      setCurrentPage(detectPage());
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const toggleWidget = () => setIsOpen(!isOpen);
  const openWidget = () => setIsOpen(true);
  const closeWidget = () => setIsOpen(false);

  return (
    <FloraContext.Provider value={{
      currentPage,
      isOpen,
      toggleWidget,
      openWidget,
      closeWidget
    }}>
      {children}
    </FloraContext.Provider>
  );
};

export const useFloraContext = () => {
  const context = useContext(FloraContext);
  if (!context) {
    throw new Error('useFloraContext debe usarse dentro de FloraProvider');
  }
  return context;
};