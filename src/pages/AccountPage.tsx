import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, LogOut, CheckCircle, ShieldCheck, Lock, Eye, EyeOff, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { dbService } from '../lib/supabase';
import { Order } from '../types';

export const AccountPage: React.FC = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState(user?.address_line1 || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/account');
      return;
    }

    // Sync state if user updates
    setFullName(user.full_name || '');
    setPhone(user.phone || '');
    setAddressLine1(user.address_line1 || '');
    setCity(user.city || '');
    setState(user.state || '');
    setPincode(user.pincode || '');

    const loadOrders = async () => {
      try {
        const userOrders = await dbService.getOrdersByUser(user.id || user.email);
        setOrders(userOrders);
      } catch (err) {
        console.warn('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);

    const res = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      address_line1: addressLine1.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    });

    setProfileSaving(false);

    if (res.success) {
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } else {
      setProfileError(res.error || 'Failed to update profile details.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else {
        setPasswordError(res.error || 'Failed to change password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
            Private Client Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-black mt-1 font-medium">
            Welcome, {user.full_name || 'Connoisseur'}
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">{user.email}</p>
        </div>

        <div className="flex items-center space-x-3">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-neutral-100 text-black border border-neutral-300 text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Profile Settings & Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Client Details & Shipping Address */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 text-black flex items-center justify-center border border-neutral-300">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-black font-medium">Client Details</h3>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
                    Account: {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {profileSavedSuccess && (
              <div className="p-3 bg-neutral-100 border border-neutral-300 text-black text-xs rounded-lg flex items-center space-x-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-black flex-shrink-0" />
                <span>Profile details saved successfully.</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-neutral-200">
                <span className="text-xs uppercase tracking-wider text-neutral-700 font-semibold block mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-black" />
                  <span>Default Delivery Coordinates</span>
                </span>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                      Street Address & Apt
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Street address, building, floor"
                      className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg px-2.5 py-2 text-xs text-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg px-2.5 py-2 text-xs text-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-500 mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="PIN"
                        maxLength={6}
                        className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg px-2.5 py-2 text-xs text-black focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60"
              >
                {profileSaving ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* 2. Security & Password Management */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-black pb-2 border-b border-neutral-200">
              <Lock className="w-4 h-4 text-black" />
              <h3 className="font-serif text-lg text-black font-medium">Security & Password</h3>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-neutral-100 border border-neutral-300 text-black text-xs rounded-lg flex items-center space-x-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-black flex-shrink-0" />
                <span>Password updated successfully.</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg pl-3 pr-9 py-2 text-xs text-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2 text-neutral-400 hover:text-black p-0.5"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-black rounded-lg pl-3 pr-9 py-2 text-xs text-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 text-neutral-400 hover:text-black p-0.5"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2 bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-300 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-60"
              >
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* 3. Privacy & Data Rights Management */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-black">
              <ShieldCheck className="w-5 h-5 text-black" aria-hidden="true" />
              <h3 className="font-serif text-lg text-black font-medium">Privacy & Data Rights</h3>
            </div>
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              Under data protection regulations, you maintain full autonomy over your records.
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <Link
                to="/data-deletion"
                className="w-full py-2 px-3 bg-neutral-50 hover:bg-neutral-100 text-black border border-neutral-200 rounded-lg flex items-center justify-between font-medium transition-colors"
              >
                <span>Request Data Deletion / Erasure</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                to="/unsubscribe"
                className="w-full py-2 px-3 bg-neutral-50 hover:bg-neutral-100 text-black border border-neutral-200 rounded-lg flex items-center justify-between transition-colors"
              >
                <span>Email Preferences & Unsubscribe</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <h2 className="font-serif text-xl text-black flex items-center space-x-2 font-medium">
                <Package className="w-5 h-5 text-black" />
                <span>Order History ({orders.length})</span>
              </h2>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="font-serif text-lg text-black">No orders placed yet</p>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                  When you acquire fragrances from Aleez Perfumes, your verified invoices and dispatch coordinates will appear here.
                </p>
                <Link
                  to="/shop"
                  className="inline-block mt-2 px-5 py-2 text-xs uppercase tracking-widest bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 shadow-sm transition-colors"
                >
                  Explore Fragrances
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-black block">
                          #{ord.order_number}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider bg-black text-white font-mono">
                          {ord.order_status}
                        </span>
                        <span className="font-mono text-sm font-bold text-black">
                          {formatPrice(ord.total_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-black font-medium">
                            {it.product_name} <span className="text-neutral-500 font-normal">× {it.quantity}</span>
                          </span>
                          <span className="font-mono text-neutral-800">
                            {formatPrice(it.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-[11px] text-neutral-600">
                      <span>Shipped to: {ord.shipping_city}, {ord.shipping_pincode}</span>
                      <a
                        href={`https://wa.me/919345526905?text=${encodeURIComponent(
                          `Hi Aleez Perfumes, I would like an update on Order #${ord.order_number}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:underline font-medium"
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
