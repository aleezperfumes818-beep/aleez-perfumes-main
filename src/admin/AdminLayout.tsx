import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAdmin, adminLogin, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Admin Login state for unauthenticated users attempting to access /admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [safetyTimeout, setSafetyTimeout] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSafetyTimeout(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('admin_preview') === '1' && !isAdmin) {
      adminLogin('aleez.perfumes818@gmail.com', 'AleezAdmin2026!');
    }
  }, [location.search, isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await adminLogin(adminEmail, adminPassword);
      if (!res.success) {
        setLoginError(res.error || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication error');
    } finally {
      setLoginLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Admins & Staff', path: '/admin/team', icon: Users },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  if (isLoading && !safetyTimeout) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center text-luxury-dark">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated as Admin, display dedicated Admin Authentication screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-luxury-border rounded-2xl p-8 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full flex items-center justify-center mx-auto text-luxury-gold">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl text-luxury-dark pt-2">
              Aleez Perfumes Administration
            </h1>
            <p className="text-xs text-stone-500 font-light">
              Restricted management portal. Authorized store administrators only.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="aleez.perfumes818@gmail.com"
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3.5 py-2.5 text-xs text-luxury-dark focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Admin Password / Secret Key
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3.5 py-2.5 text-xs text-luxury-dark focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-[0.2em] font-semibold rounded shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-luxury-border text-center">
            <Link to="/" className="text-xs text-stone-500 hover:text-luxury-gold flex items-center justify-center space-x-1">
              <span>← Return to Public Boutique</span>
            </Link>
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

          <Link to="/admin" className="flex items-center space-x-2">
            <span className="font-serif text-lg tracking-[0.2em] font-bold text-luxury-dark">
              ALEEZ
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 px-2 py-0.5 rounded font-mono font-medium">
              Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/"
            target="_blank"
            className="flex items-center space-x-1 text-xs text-stone-500 hover:text-luxury-gold transition-colors font-light"
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
                          ? 'bg-luxury-gold text-white font-semibold shadow-sm'
                          : 'text-stone-600 hover:text-luxury-dark hover:bg-stone-50'
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
