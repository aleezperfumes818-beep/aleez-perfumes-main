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
import { Logo } from './Logo';
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const collectionItems = [
    { name: 'All Fragrances', path: '/shop' },
    { name: 'Pour Homme (Men)', path: '/shop?category=oriental-woody' },
    { name: 'Pour Femme (Women)', path: '/shop?category=floral-fresh' },
    { name: 'Noble Oud Collection', path: '/shop?category=pure-oud-collection' },
    { name: 'Artisanal Attars & Oils', path: '/shop?category=artisanal-attars' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      {settings.announcement_bar && (
        <div className="bg-black text-white text-[10px] sm:text-xs py-2 px-4 text-center tracking-widest uppercase font-light border-b border-neutral-800 flex items-center justify-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>{settings.announcement_bar}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-2.5 border-b border-neutral-200'
            : 'bg-white/90 backdrop-blur-sm py-3.5 border-b border-neutral-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile: Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-black hover:text-neutral-600 focus:outline-none transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <button
                type="button"
                onClick={onOpenSearch}
                className="p-2 ml-1 text-black hover:text-neutral-600 focus:outline-none transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* AZ Monogram Logo */}
            <div className="flex items-center flex-shrink-0 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              <Link to="/" className="group flex items-center" aria-label="AZ Home">
                <Logo variant="dark" size="md" />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {/* 1. Home */}
              <Link
                to="/"
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-200 relative py-1 ${
                  location.pathname === '/'
                    ? 'text-black font-semibold'
                    : 'text-neutral-600 hover:text-black font-light'
                }`}
              >
                Home
                {location.pathname === '/' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black animate-fade-in" />
                )}
              </Link>

              {/* 2. Collections (Dropdown) */}
              <div className="relative group py-2">
                <button
                  type="button"
                  className={`flex items-center space-x-1 text-xs tracking-[0.2em] uppercase transition-colors ${
                    location.pathname.startsWith('/shop') && !location.search.includes('filter=bestseller')
                      ? 'text-black font-semibold'
                      : 'text-neutral-600 hover:text-black font-light'
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-200 text-neutral-500 group-hover:text-black" />
                </button>

                {/* Dropdown Card */}
                <div className="absolute top-full left-0 w-60 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-neutral-200 p-2 space-y-1">
                    {collectionItems.map((col) => (
                      <Link
                        key={col.name}
                        to={col.path}
                        className="block px-3.5 py-2 text-xs uppercase tracking-wider text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-md transition-colors font-medium"
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
                    ? 'text-black font-semibold'
                    : 'text-neutral-600 hover:text-black font-light'
                }`}
              >
                Brand Inspirations
              </Link>

              {/* 4. CREATE (Prominent Button) */}
              <Link
                to="/create-your-fragrance"
                className="group relative flex items-center space-x-1.5 px-3 py-1.5 rounded-sm border border-black bg-black text-white hover:bg-neutral-800 transition-all text-xs uppercase tracking-widest font-semibold shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-white transition-transform" />
                <span>Create Scent</span>
              </Link>

              {/* 5. Our Story */}
              <Link
                to="/about"
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-200 relative py-1 ${
                  location.pathname === '/about'
                    ? 'text-black font-semibold'
                    : 'text-neutral-600 hover:text-black font-light'
                }`}
              >
                Our Story
              </Link>

              {/* 6. Contact */}
              <Link
                to="/contact"
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-200 relative py-1 ${
                  location.pathname === '/contact'
                    ? 'text-black font-semibold'
                    : 'text-neutral-600 hover:text-black font-light'
                }`}
              >
                Contact
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-2.5 py-1 text-[11px] tracking-widest uppercase bg-neutral-100 text-black border border-neutral-300 rounded-sm hover:bg-black hover:text-white transition-colors"
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
                className="hidden lg:flex items-center space-x-2 text-neutral-700 hover:text-black transition-colors py-1.5 px-3 rounded-sm border border-neutral-200 hover:border-black bg-neutral-50"
                aria-label="Search fragrances"
              >
                <Search className="w-3.5 h-3.5 text-black" />
                <span className="text-xs text-neutral-600 font-medium tracking-wider">Search...</span>
              </button>

              {/* Account Link */}
              <Link
                to={user ? '/account' : '/login'}
                className="p-1.5 text-neutral-800 hover:text-black transition-colors relative"
                aria-label="Account"
                title={user ? `Signed in as ${user.full_name || user.email}` : 'Sign in'}
              >
                <User className="w-5 h-5" />
                {user && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-black rounded-full" />
                )}
              </Link>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="p-1.5 text-neutral-800 hover:text-black transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="p-1.5 text-neutral-800 hover:text-black transition-colors relative group"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-fade-in">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer - OUTSIDE <header> to ensure full viewport on iOS Safari without backdrop-blur containment */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-white w-screen h-[100dvh] flex flex-col justify-between p-6 overflow-y-auto animate-fade-in"
        >
          <div className="space-y-6 pt-2">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center"
                aria-label="AZ Home"
              >
                <Logo variant="dark" size="sm" showText={true} />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-neutral-600 hover:text-black focus:outline-none transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              {/* 1. Home */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-neutral-200 text-black hover:text-neutral-600 transition-colors"
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>

              {/* 2. Collections Collapsible */}
              <div className="border-b border-neutral-200 py-2">
                <button
                  type="button"
                  onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                  className="w-full text-lg font-serif tracking-widest flex items-center justify-between text-black focus:outline-none"
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
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
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-600 hover:text-black py-1 transition-colors"
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
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-neutral-200 text-black hover:text-neutral-600 transition-colors"
              >
                <span>Brand Inspirations</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>

              {/* 4. CREATE YOUR FRAGRANCE (Prominent Button) */}
              <Link
                to="/create-your-fragrance"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 rounded-sm border border-black bg-black text-white flex items-center justify-between font-serif text-base tracking-wider shadow-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Create Your Fragrance</span>
                </div>
                <span className="text-xs uppercase tracking-widest text-neutral-300">Studio →</span>
              </Link>

              {/* 5. Our Story */}
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-neutral-200 text-black hover:text-neutral-600 transition-colors"
              >
                <span>Our Story</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>

              {/* 6. Contact */}
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-serif tracking-widest flex items-center justify-between py-2 border-b border-neutral-200 text-black hover:text-neutral-600 transition-colors"
              >
                <span>Contact</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-serif tracking-wider text-black flex items-center justify-between py-2 border-b border-neutral-200"
                >
                  <span>Admin Dashboard</span>
                  <ShieldCheck className="w-5 h-5 text-black" />
                </Link>
              )}
            </nav>
          </div>

          {/* Mobile Bottom Info */}
          <div className="pt-8 border-t border-neutral-200 space-y-4">
            <div className="flex justify-around text-xs tracking-wider text-neutral-600 font-medium">
              <Link
                to={user ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                {user ? 'My Account' : 'Sign In'}
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Wishlist ({wishlistCount})
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Support
              </Link>
            </div>

            <p className="text-center text-[11px] text-neutral-400 tracking-wider uppercase font-light">
              Aleez Perfumes • Luxury Fragrance Destination
            </p>
          </div>
        </div>
      )}
    </>
  );
};
