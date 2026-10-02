import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState<boolean>(false);
  const location = useLocation();

  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCollectionsOpen(false);
  }, [location.pathname]);

  const collectionItems = [
    { name: 'All Fragrances', path: '/shop' },
    { name: 'Pour Homme (Men)', path: '/shop?category=oriental-woody' },
    { name: 'Pour Femme (Women)', path: '/shop?category=floral-fresh' },
    { name: 'Noble Oud Collection', path: '/shop?category=pure-oud-collection' },
    { name: 'Artisanal Attars & Oils', path: '/shop?category=artisanal-attars' },
  ];

  return (
    <>
      {/* Top Announcement Bar (Yusuf Bhai Style) */}
      {settings.announcement_bar && (
        <div className="bg-[#141414] text-[#E5C378] text-[10px] sm:text-xs py-2 px-4 text-center tracking-widest uppercase font-light border-b border-[#2A2A2A] flex items-center justify-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
          <span>{settings.announcement_bar}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-[#EAE5DC]'
            : 'bg-white/90 backdrop-blur-sm py-4 border-b border-[#EAE5DC]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile: Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-[#333333] hover:text-[#B8860B] focus:outline-none transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <button
                type="button"
                onClick={onOpenSearch}
                className="p-2 ml-1 text-[#333333] hover:text-[#B8860B] focus:outline-none transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Logo: ALEEZ PERFUMES (With Generous Margin to Prevent Touching Nav) */}
            <div className="flex items-center flex-shrink-0 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              <Link to="/" className="group flex flex-col items-center sm:items-start text-center">
                <span className="font-serif text-xl sm:text-2xl lg:text-2xl tracking-[0.24em] font-semibold text-[#141414] group-hover:text-[#B8860B] transition-colors duration-300">
                  ALEEZ
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.38em] text-[#B8860B] uppercase -mt-0.5 font-medium">
                  Perfumes
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links (Properly Spaced & Organized) */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {/* 1. Home */}
              <Link
                to="/"
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-200 relative py-1 ${
                  location.pathname === '/'
                    ? 'text-[#B8860B] font-semibold'
                    : 'text-[#4A4A4A] hover:text-[#B8860B] font-light'
                }`}
              >
                Home
                {location.pathname === '/' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B8860B] animate-fade-in" />
                )}
              </Link>

              {/* 2. Collections (Dropdown) */}
              <div className="relative group py-2">
                <button
                  type="button"
                  className={`flex items-center space-x-1 text-xs tracking-[0.2em] uppercase transition-colors ${
                    location.pathname.startsWith('/shop') && !location.search.includes('filter=bestseller')
                      ? 'text-[#B8860B] font-semibold'
                      : 'text-[#4A4A4A] hover:text-[#B8860B] font-light'
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-200 text-[#777777] group-hover:text-[#B8860B]" />
                </button>

                {/* Dropdown Card */}
                <div className="absolute top-full left-0 w-60 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-[#EAE5DC] p-2 space-y-1">
                    {collectionItems.map((col) => (
                      <Link
                        key={col.name}
                        to={col.path}
                        className="block px-3.5 py-2 text-xs uppercase tracking-wider text-[#333333] hover:text-[#B8860B] hover:bg-[#FAF3E0] rounded-lg transition-colors font-medium"
                      >
                        {col.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Brand Inspirations */}
              <Link
                to="/shop?filter=bestseller"
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-200 relative py-1 ${
                  location.search.includes('filter=bestseller')
                    ? 'text-[#B8860B] font-semibold'
                    : 'text-[#4A4A4A] hover:text-[#B8860B] font-light'
                }`}
              >
                Brand Inspirations
              </Link>

              {/* 4. CREATE (Yusuf Bhai Style Prominent Option) */}
              <Link
                to="/create-your-fragrance"
                className="group relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37] bg-gradient-to-r from-[#FAF3E0] to-[#F5E9BF]/60 text-[#7A5B10] hover:bg-[#B8860B] hover:text-white hover:border-[#B8860B] transition-all text-xs uppercase tracking-widest font-semibold shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-[#B8860B] group-hover:text-white group-hover:rotate-12 transition-transform" />
                <span>Create</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] group-hover:bg-white animate-pulse" />
              </Link>

              {/* 5. Our Story */}
              <Link
                to="/about"
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-200 relative py-1 ${
                  location.pathname === '/about'
                    ? 'text-[#B8860B] font-semibold'
                    : 'text-[#4A4A4A] hover:text-[#B8860B] font-light'
                }`}
              >
                Our Story
              </Link>

              {/* 6. Contact */}
              <Link
                to="/contact"
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-200 relative py-1 ${
                  location.pathname === '/contact'
                    ? 'text-[#B8860B] font-semibold'
                    : 'text-[#4A4A4A] hover:text-[#B8860B] font-light'
                }`}
              >
                Contact
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-2.5 py-1 text-[11px] tracking-widest uppercase bg-[#B8860B]/10 text-[#8C6D23] border border-[#B8860B]/30 rounded hover:bg-[#B8860B] hover:text-white transition-colors"
                >
                  Admin Portal
                </Link>
              )}
            </nav>

            {/* Right Icons: Search, Account, Wishlist, Cart */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Desktop Search Button */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="hidden lg:flex items-center space-x-2 text-[#4A4A4A] hover:text-[#B8860B] transition-colors py-1.5 px-3 rounded-full border border-[#EAE5DC] hover:border-[#B8860B]/40 bg-[#FAF9F6]"
                aria-label="Search fragrances"
              >
                <Search className="w-3.5 h-3.5 text-[#B8860B]" />
                <span className="text-xs text-[#777777] font-light tracking-wider">Search...</span>
              </button>

              {/* Account Link */}
              <Link
                to={user ? '/account' : '/login'}
                className="p-1.5 text-[#333333] hover:text-[#B8860B] transition-colors relative"
                aria-label="Account"
                title={user ? `Signed in as ${user.full_name || user.email}` : 'Sign in'}
              >
                <User className="w-5 h-5" />
                {user && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#B8860B] rounded-full" />
                )}
              </Link>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="p-1.5 text-[#333333] hover:text-[#B8860B] transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B8860B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-gold-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="p-1.5 text-[#333333] hover:text-[#B8860B] transition-colors relative group"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B8860B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-gold-sm animate-fade-in">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[header-height] z-50 bg-[#FAF9F6]/98 backdrop-blur-xl border-t border-[#EAE5DC] animate-fade-in flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center border-b border-[#EAE5DC] pb-4">
                <span className="text-xs uppercase tracking-[0.25em] text-[#777777]">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#444444] hover:text-[#141414]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                {/* 1. Home */}
                <Link
                  to="/"
                  className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-[#EAE5DC]/60 text-[#141414]"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-[#888888]" />
                </Link>

                {/* 2. Collections Collapsible */}
                <div className="border-b border-[#EAE5DC]/60 py-2">
                  <button
                    onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                    className="w-full text-lg font-serif tracking-widest flex items-center justify-between text-[#141414]"
                  >
                    <span>Collections</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#888888] transition-transform ${
                        mobileCollectionsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileCollectionsOpen && (
                    <div className="pl-4 pt-3 space-y-2.5">
                      {collectionItems.map((col) => (
                        <Link
                          key={col.name}
                          to={col.path}
                          className="block text-sm text-[#555555] hover:text-[#B8860B] py-1"
                        >
                          {col.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Brand Inspirations */}
                <Link
                  to="/shop?filter=bestseller"
                  className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-[#EAE5DC]/60 text-[#141414]"
                >
                  <span>Brand Inspirations</span>
                  <ChevronRight className="w-4 h-4 text-[#888888]" />
                </Link>

                {/* 4. CREATE YOUR FRAGRANCE (Prominent Button) */}
                <Link
                  to="/create-your-fragrance"
                  className="p-3.5 rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#FAF3E0] to-[#F5E9BF] text-[#7A5B10] flex items-center justify-between font-serif text-base tracking-wider shadow-sm font-semibold"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#B8860B]" />
                    <span>Create Your Fragrance</span>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-[#B8860B]">Atelier →</span>
                </Link>

                {/* 5. Our Story */}
                <Link
                  to="/about"
                  className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-[#EAE5DC]/60 text-[#141414]"
                >
                  <span>Our Story</span>
                  <ChevronRight className="w-4 h-4 text-[#888888]" />
                </Link>

                {/* 6. Contact */}
                <Link
                  to="/contact"
                  className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-[#EAE5DC]/60 text-[#141414]"
                >
                  <span>Contact</span>
                  <ChevronRight className="w-4 h-4 text-[#888888]" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-base font-serif tracking-wider text-[#B8860B] flex items-center justify-between py-2"
                  >
                    <span>Admin Dashboard</span>
                    <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Bottom Info */}
            <div className="pt-8 border-t border-[#EAE5DC] space-y-4">
              <div className="flex justify-around text-xs tracking-wider text-[#555555]">
                <Link to={user ? '/account' : '/login'} className="hover:text-[#B8860B]">
                  {user ? 'My Account' : 'Sign In'}
                </Link>
                <Link to="/wishlist" className="hover:text-[#B8860B]">
                  Wishlist ({wishlistCount})
                </Link>
                <Link to="/contact" className="hover:text-[#B8860B]">
                  Support
                </Link>
              </div>

              <p className="text-center text-[11px] text-[#888888] tracking-wider">
                Aleez Perfumes • Luxury Fragrance Destination
              </p>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
