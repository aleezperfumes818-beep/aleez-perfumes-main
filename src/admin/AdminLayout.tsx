import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Settings,
  Users,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAdmin, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [safetyTimeout, setSafetyTimeout] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSafetyTimeout(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Homepage Editor', path: '/admin/homepage', icon: Sparkles },
    { name: 'Admins & Staff', path: '/admin/team', icon: Users },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  if (isLoading && !safetyTimeout) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-black">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Case 1: Unauthenticated visitor attempting to access /admin -> Redirect to login
  if (!user) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Case 2: Authenticated customer attempting to access /admin -> 403 Forbidden Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 text-black select-none">
        <div className="max-w-md w-full bg-white border border-neutral-300 rounded-sm p-8 space-y-6 shadow-xl text-center">
          <div className="w-14 h-14 bg-neutral-100 text-black rounded-full flex items-center justify-center mx-auto border border-neutral-300">
            <Lock className="w-7 h-7 text-black" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-mono font-semibold">
              403 Forbidden
            </span>
            <h1 className="font-serif text-2xl font-normal text-black">
              Administrator Access Denied
            </h1>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              You are signed in as <strong className="text-black">{user.email}</strong>, but this account is classified as a <strong className="text-black">{user.role}</strong> and lacks administrative authorization.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              to="/account"
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded-sm block transition-colors"
            >
              Go to Client Account Portal
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs uppercase tracking-wider font-semibold rounded-sm block transition-colors"
            >
              Return to Boutique
            </Link>
            <button
              onClick={() => logout().then(() => navigate('/admin/login'))}
              className="text-xs text-neutral-500 hover:text-black pt-2 underline block mx-auto"
            >
              Sign out and switch account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-dark flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-white border-b border-luxury-border sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 text-stone-500 hover:text-luxury-dark"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center space-x-2.5">
            <Logo variant="dark" size="sm" showText={false} />
            <span className="font-serif text-lg tracking-[0.2em] font-bold text-luxury-dark">
              ALEEZ
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded font-mono font-medium">
              Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/admin/homepage"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-neutral-100 hover:bg-black text-black hover:text-white border border-neutral-300 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Homepage Editor</span>
          </Link>

          <Link
            to="/"
            target="_blank"
            className="flex items-center space-x-1 text-xs text-stone-600 hover:text-black transition-colors font-light"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-luxury-border pt-16 lg:pt-0 transform lg:translate-x-0 transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static`}
        >
          <div className="p-6 space-y-6">
            <div className="pb-4 border-b border-luxury-border">
              <Link to="/admin" className="block">
                <Logo variant="dark" size="sm" showText={true} />
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono block mt-1.5">
                  Administration Hub
                </span>
              </Link>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono font-medium">
                Store Operations
              </span>
              <nav className="space-y-1.5 pt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-black text-white font-semibold shadow-sm'
                          : 'text-stone-600 hover:text-black hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-luxury-border text-[11px] text-stone-400 space-y-1">
              <p>Aleez Perfumes v1.0</p>
              <p>Database: Synced</p>
            </div>
          </div>
        </aside>

        {/* Main Admin Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
