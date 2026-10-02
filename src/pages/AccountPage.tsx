import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, LogOut, CheckCircle, Clock, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { dbService } from '../lib/supabase';
import { Order } from '../types';

export const AccountPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      try {
        const userOrders = await dbService.getOrdersByUser(user.email);
        setOrders(userOrders);
      } catch (err) {
        console.warn('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ full_name: fullName, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-[#141414]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAE5DC] gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
            Private Client Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mt-1 font-medium">
            Welcome, {user.full_name || 'Connoisseur'}
          </h1>
          <p className="text-xs text-[#777777] font-light mt-0.5">{user.email}</p>
        </div>

        <div className="flex items-center space-x-3">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-[#B8860B]/10 text-[#7A5B10] border border-[#B8860B]/30 text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#B8860B] hover:text-white transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-[#EAE5DC] text-[#555555] hover:text-red-600 text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Profile Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 space-y-5 shadow-card">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#EAE5DC]">
              <div className="w-10 h-10 rounded-full bg-[#B8860B]/10 text-[#B8860B] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#141414] font-medium">Client Details</h3>
                <span className="text-[10px] uppercase tracking-wider text-[#777777] font-mono">
                  Account Type: {user.role.toUpperCase()}
                </span>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Profile updated successfully</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg px-3 py-2 text-xs text-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1 font-medium">
                  Email (Immutable)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-[#F5F2EB] border border-[#EAE5DC] rounded-lg px-3 py-2 text-xs text-[#888888] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#444444] mb-1 font-medium">
                  Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-lg px-3 py-2 text-xs text-[#141414] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-colors shadow-sm"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#EAE5DC] rounded-2xl p-6 space-y-6 shadow-card">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAE5DC]">
              <h2 className="font-serif text-xl text-[#141414] flex items-center space-x-2 font-medium">
                <Package className="w-5 h-5 text-[#B8860B]" />
                <span>Order History ({orders.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="font-serif text-lg text-[#141414]">No orders placed yet</p>
                <p className="text-xs text-[#777777] max-w-sm mx-auto">
                  When you acquire fragrances from Aleez Perfumes, your verified invoices and dispatch coordinates will appear here.
                </p>
                <Link
                  to="/shop"
                  className="inline-block mt-2 px-5 py-2 text-xs uppercase tracking-widest bg-[#B8860B] text-white font-semibold rounded-lg hover:bg-[#9E7307] shadow-sm"
                >
                  Explore Fragrances
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-[#FAF9F6] border border-[#EAE5DC] rounded-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE5DC] pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#B8860B] block">
                          #{ord.order_number}
                        </span>
                        <span className="text-[11px] text-[#777777]">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider bg-[#B8860B]/10 text-[#7A5B10] border border-[#B8860B]/30">
                          {ord.order_status}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#141414]">
                          {formatPrice(ord.total_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-[#333333]">
                            {it.product_name} <span className="text-[#777777]">× {it.quantity}</span>
                          </span>
                          <span className="font-mono text-[#555555]">
                            {formatPrice(it.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#EAE5DC] flex justify-between items-center text-[11px] text-[#666666]">
                      <span>Shipped to: {ord.shipping_city}, {ord.shipping_pincode}</span>
                      <a
                        href={`https://wa.me/919345526905?text=${encodeURIComponent(
                          `Hi Aleez Perfumes, I would like an update on Order #${ord.order_number}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B8860B] hover:underline font-medium"
                      >
                        Track on WhatsApp →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
