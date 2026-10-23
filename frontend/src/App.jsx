import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";

// Contexto de Fidelidad
import { LoyaltyProvider } from "./context/LoyaltyContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { ProfileProvider } from "./context/ProfileContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Contexto de FLORA
import { FloraProvider } from "./context/FloraContext.jsx";
import FloraWidget from "./components/FloraWidget.jsx";

// Páginas existentes
import Home from "./pages/Home.jsx";
import Faq from "./pages/Faq.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyCode from "./pages/VerifyCode.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AboutUs from "./pages/About.jsx";
import ProductsPage from "./pages/BestSellers.jsx";
import PlantCareGuide from "./pages/GuideCarePlants.jsx";
import PlantDetail from "./pages/PlantDetail.jsx";
import Profile from "./pages/MyProfile.jsx";
import UpdateProfile from "./pages/UpdateProfile.jsx";
import AddAddress from "./pages/AddAddress.jsx";
import Pedidos from "./pages/Orders.jsx";
import AddPaymentMethod from "./pages/AddPaymentMethod.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CandleDetailPage from "./pages/CandleDetailPage.jsx";
import OtherDetailPage from "./pages/OtherDetailPage.jsx";
import ComboDetailPage from "./pages/ComboDetailPage.jsx";
import Cotizaciones from "./pages/Quotations.jsx";
import MyQuotations from "./pages/MyQuotations.jsx";
import NotFound from "./pages/NotFound.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Pago3DSResultado from "./pages/Pago3DSResultado.jsx";
import ReviewsProfile from "./pages/ReviewsProfile.jsx";
import CustomOrdersProfile from "./pages/CustomOrdersProfile.jsx";
import SelectReviewProduct from "./pages/SelectReviewProduct.jsx";
import ReviewForm from "./pages/ReviewForm.jsx";
import Wishlist from "./pages/Wishlist";
import TermsAndConditions from "./pages/TermsAndConditions";

// Páginas de Fidelidad
import LoyaltyProgram from "./pages/LoyaltyProgram.jsx";
import EarnPoints from "./pages/EarnPoints.jsx";
import Rewards from "./pages/Rewards.jsx";
import History from "./pages/History.jsx";
import Coupons from "./pages/Coupons.jsx";
import Navbar from "./components/Navbar.jsx";
import WishlistProfile from "./pages/WishlistProfile.jsx";
import WishlistDetail from "./pages/WishlistDetail";
import CartDrawer from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import PotsPage from "./pages/Pots";
import CandlesPage from "./pages/Candles";
import OthersPage from "./pages/Others";
import CombosPage from "./pages/Combos";

function ConditionalNavbar() {
  const location = useLocation();
  const hidePaths = [
    "/login", 
    "/register", 
    "/forgot-password", 
    "/verify-code", 
    "/reset-password",
    "/perfil",
    "/editarperfil",
    "/agregardireccion",
    "/pedidos",
    "/agregarmetododepago",
    "/wishlistPerfil",
    "/resenas",
    "/personalizaciones",
    "/mis-cotizaciones",
    "/productoresena"
  ];

  if (hidePaths.includes(location.pathname)) {
    return null;
  }

  return <Navbar />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
      <LoyaltyProvider>
        <CartProvider>
        <WishlistProvider>
        <ProfileProvider>
        <FloraProvider>
        <Toaster position="top-right" reverseOrder={false} />

        <ConditionalNavbar />

        <Routes>
          {/* Rutas principales */}
          <Route path="/" element={<Home />} />
          <Route path="/preguntas-frecuentes" element={<Faq />} />
          <Route path="/nosotros" element={<AboutUs />} />
          <Route path="/masvendidos" element={<ProductsPage />} />
          <Route path="/plantas-y-cuidados" element={<PlantCareGuide />} />
          <Route path="/plantas-y-cuidados/:id" element={<PlantDetail />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/editarperfil" element={<UpdateProfile />} />
          <Route path="/agregardireccion" element={<AddAddress />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/agregarmetododepago" element={<AddPaymentMethod />} />
          <Route path="/detalleproducto/:id" element={<ProductDetailPage />} />
          <Route path="/detallevela/:id" element={<CandleDetailPage />} />
          <Route path="/detalleotro/:id" element={<OtherDetailPage />} />
          <Route path="/detallecombo/:id" element={<ComboDetailPage />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/mis-cotizaciones" element={<MyQuotations />} />
          <Route path="/wishlistPerfil" element={<WishlistProfile />} />
          <Route path="/resenas" element={<ReviewsProfile />} />
          <Route path="/personalizaciones" element={<CustomOrdersProfile />} />
          <Route path="/productoresena" element={<SelectReviewProduct />} />
          <Route path="/resenaform" element={<ReviewForm />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wishlist/:id" element={<WishlistDetail />} />
          <Route path="/carrito" element={<CartDrawer />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pago-3ds" element={<Pago3DSResultado />} />
          <Route path="/confirmacion-orden" element={<OrderConfirmation />} />
          <Route path="/macetas" element={<PotsPage />} />
          <Route path="/velas" element={<CandlesPage />} />
          <Route path="/otros" element={<OthersPage />} />
          <Route path="/combos" element={<CombosPage />} />
          <Route path="/buscar" element={<SearchResults />} />
          <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />


          {/* 2. Rutas de Fidelidad */}
          <Route path="/programa-de-fidelidad" element={<LoyaltyProgram />} />
          <Route path="/ganar-puntos" element={<EarnPoints />} />
          <Route path="/recompensas" element={<Rewards />} />
          <Route path="/historial" element={<History />} />
          <Route path="/cupones" element={<Coupons />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Widget de FLORA - visible en todas las páginas */}
        <FloraWidget />

        </FloraProvider>
        </ProfileProvider>
        </WishlistProvider>
        </CartProvider>
      </LoyaltyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}