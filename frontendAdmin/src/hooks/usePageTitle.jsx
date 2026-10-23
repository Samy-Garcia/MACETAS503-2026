import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/ordenes': 'Órdenes',
      '/ordenespersonalizadas': 'Órdenes Personalizadas',
      '/macetas': 'Macetas',
      '/velas': 'Velas',
      '/cuidado-plantas': 'Cuidado de Plantas',
      '/plantas': 'Plantas',
      '/ofertas': 'Ofertas',
      '/formas-de-ganar': 'Formas de Ganar Puntos',
      '/inventario': 'Inventario',
      '/reportes': 'Reportes y Análisis',
      '/ajustes': 'Ajustes',
      '/login': 'Iniciar Sesión',
      '/registro': 'Registro',
      '/recuperar-password': 'Recuperar Contraseña',
      '/verificar-codigo': 'Verificar Código',
      '/nueva-contrasena': 'Nueva Contraseña',
      '/recompensas': 'Recompensas'

    };

    let pageTitle = 'Macetas503';
    
    if (titles[currentPath]) {
      pageTitle = titles[currentPath];
    }

    document.title = `${pageTitle} | Macetas503`;
  }, [currentPath]);
};

export default usePageTitle;