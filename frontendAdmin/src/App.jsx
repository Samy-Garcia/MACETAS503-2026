import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import VerifyCode from './pages/VerifyCode';
import RecoverPassword from './pages/RecoverPassword';
import Register from './pages/Register';
import NewPassword from './pages/NewPassword';
import Dashboard from './pages/Dashboard';
import PotsPage from './pages/Pots';
import CandlesPage from './pages/Candles';
import OthersPage from './pages/Others';
import CombosPage from './pages/Combos';
import QuotationsPage from './pages/Quotations';
import PlantsPage from './pages/Plants';
import PlantCarePage from './pages/PlantCare';
import OffersPage from './pages/Offers';
import RewardsPage from './pages/Rewards';
import EarnMethodsPage from './pages/EarnMethods';
import SettingsPage from './pages/Settings';
import AdminApprovalsPage from './pages/AdminApprovals';
import InventoryPage from './pages/Inventory';
import ReportsPage from './pages/Reports';
import OrdersPage from './pages/Orders';
import CustomOrdersPage from './pages/CustomOrders';
import ReviewsPage from './pages/Reviews';
import SubscribersPage from './pages/Subscribers';
import RedemptionsPage from './pages/Redemptions';
import Flora from './pages/Flora';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes (públicas) */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<RecoverPassword />} />
        <Route path="/verificar" element={<VerifyCode />} />
        <Route path="/nueva-contrasena" element={<NewPassword />} />

        {/* Main Routes (protegidas: requieren sesión) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ordenes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/resenas" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/suscriptores" element={<ProtectedRoute><SubscribersPage /></ProtectedRoute>} />
        <Route path="/canjes" element={<ProtectedRoute><RedemptionsPage /></ProtectedRoute>} />
        <Route path="/ordenespersonalizadas" element={<ProtectedRoute><CustomOrdersPage /></ProtectedRoute>} />
        <Route path="/macetas" element={<ProtectedRoute><PotsPage /></ProtectedRoute>} />
        <Route path="/velas" element={<ProtectedRoute><CandlesPage /></ProtectedRoute>} />
        <Route path="/otros" element={<ProtectedRoute><OthersPage /></ProtectedRoute>} />
        <Route path="/combos" element={<ProtectedRoute><CombosPage /></ProtectedRoute>} />
        <Route path="/cotizaciones" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
        <Route path="/plantas" element={<ProtectedRoute><PlantsPage /></ProtectedRoute>} />
        <Route path="/cuidado-plantas" element={<ProtectedRoute><PlantCarePage /></ProtectedRoute>} />
        <Route path="/ofertas" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />
        <Route path="/recompensas" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
        <Route path="/formas-de-ganar" element={<ProtectedRoute><EarnMethodsPage /></ProtectedRoute>} />
        <Route path="/inventario" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/ajustes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/administradores" element={<ProtectedRoute><AdminApprovalsPage /></ProtectedRoute>} />
        <Route path="/flora" element={<ProtectedRoute><Flora /></ProtectedRoute>} />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
