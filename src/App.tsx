import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { LoadingScreen } from './components/LoadingScreen';
import { CookieConsentBanner } from './components/CookieConsentBanner';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CreateFragrancePage } from './pages/CreateFragrancePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { PrivacyPolicyPage, TermsPage } from './pages/PolicyPages';
import { DataDeletionPage } from './pages/DataDeletionPage';
import { UnsubscribePage } from './pages/UnsubscribePage';
import { LicensesPage } from './pages/LicensesPage';

// Admin System
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProducts } from './admin/AdminProducts';
import { AdminCategories } from './admin/AdminCategories';
import { AdminOrders } from './admin/AdminOrders';
import { AdminTeam } from './admin/AdminTeam';
import { AdminSettings } from './admin/AdminSettings';
import { AdminHomepage } from './admin/AdminHomepage';

// Helper to scroll to top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main App Container to manage Customer layout vs Admin layout
const MainContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Determine if on product page to extract product name for WhatsApp
  const isProductRoute = location.pathname.startsWith('/product/');

  return (
    <>
      <ScrollToTop />

      {isAdminRoute ? (
        // Completely Separate Protected Admin Layout
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/homepage" element={<AdminHomepage />} />
            <Route path="/admin/team" element={<AdminTeam />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
        </AdminLayout>
      ) : (
        // Public Luxury Customer Layout
        <div className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white">
          {/* Accessible Skip Link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-sm focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-black text-xs font-semibold uppercase tracking-wider"
          >
            Skip to main content
          </a>

          <LoadingScreen />
          <Header onOpenSearch={() => setIsSearchOpen(true)} />
          <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <CartDrawer />
          <FloatingWhatsApp />
          <CookieConsentBanner />

          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/create" element={<CreateFragrancePage />} />
              <Route path="/create-your-fragrance" element={<CreateFragrancePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/shipping" element={<ShippingPolicyPage />} />
              <Route path="/refund" element={<RefundPolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />
              <Route path="/data-deletion" element={<DataDeletionPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/licenses" element={<LicensesPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <WishlistProvider>
              <MainContent />
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
