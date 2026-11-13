import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Percent,
  IndianRupee,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  Globe,
  Calendar,
  MessageSquare,
  RefreshCw,
  X,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Coupon } from '../types';
import {
  getCoupons,
  saveCoupon,
  deleteCoupon,
  toggleCouponStatus,
  resetToDefaultCoupons,
  generateStoreCreditCode,
} from '../lib/couponService';
import { useSettings } from '../context/SettingsContext';

export const AdminCoupons: React.FC = () => {
  const { formatPrice, settings } = useSettings();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'public' | 'private'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnCreditModalOpen, setIsReturnCreditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // General Create / Edit Form State
  const [formData, setFormData] = useState<{
    code: string;
    discount_type: 'percentage' | 'fixed' | 'free_shipping';
    discount_value: number;
    min_order_amount: number;
    description: string;
    is_active: boolean;
    visibility: 'public' | 'private';
    expires_at: string;
    customer_name: string;
    customer_phone: string;
    order_reference: string;
  }>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    description: '',
    is_active: true,
    visibility: 'public',
    expires_at: '',
    customer_name: '',
    customer_phone: '',
    order_reference: '',
  });

  // Dedicated Return Store Credit Form State
  const [returnCreditData, setReturnCreditData] = useState<{
    order_reference: string;
    customer_name: string;
    customer_phone: string;
    original_amount: number;
    return_fee_deducted: number;
    code: string;
  }>({
    order_reference: '',
    customer_name: '',
    customer_phone: '',
    original_amount: 1199,
    return_fee_deducted: 100,
    code: generateStoreCreditCode(),
  });

  const loadData = () => {
    setCoupons(getCoupons());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyWhatsAppText = (coupon: Coupon) => {
    const expiryDate = coupon.expires_at
      ? new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '6 Months from issue';
    
    const text = `Hi ${coupon.customer_name || 'Customer'},\n\nYour return for Order #${coupon.order_reference || 'Recent Order'} has been inspected and approved. As per our policy, a ₹${coupon.return_fee_deducted || 100} return processing fee was deducted, and your Store Credit is ready:\n\n✨ Store Credit Amount: ₹${coupon.discount_value.toLocaleString('en-IN')}\n🔑 Private Coupon Code: ${coupon.code}\n⏳ Validity: 6 Months (Valid until ${expiryDate})\n\nYou can use this private code at checkout on https://www.aleezperfumes.in.\n\nThank you for choosing Aleez Perfumes! 🌟`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsAppMsg(coupon.code);
    setTimeout(() => setCopiedWhatsAppMsg(null), 2500);
    showNotification('success', `Copied customer WhatsApp message for code "${coupon.code}"!`);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      description: '',
      is_active: true,
      visibility: 'public',
      expires_at: '',
      customer_name: '',
      customer_phone: '',
      order_reference: '',
    });
    setIsModalOpen(true);
  };

  const openReturnCreditModal = () => {
    setReturnCreditData({
      order_reference: '',
      customer_name: '',
      customer_phone: '',
      original_amount: 1199,
      return_fee_deducted: 100,
      code: generateStoreCreditCode(),
    });
    setIsReturnCreditModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || 0,
      description: coupon.description,
      is_active: coupon.is_active ?? true,
      visibility: coupon.visibility || 'public',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      customer_name: coupon.customer_name || '',
      customer_phone: coupon.customer_phone || '',
      order_reference: coupon.order_reference || '',
    });
    setIsModalOpen(true);
  };

  const handleToggle = (identifier: string, code: string) => {
    const updated = toggleCouponStatus(identifier);
    setCoupons(updated);
    showNotification('success', `Coupon "${code}" status updated.`);
  };

  const handleDelete = (identifier: string, code: string) => {
    if (window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      const updated = deleteCoupon(identifier);
      setCoupons(updated);
      showNotification('success', `Coupon "${code}" removed.`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all coupons to default factory settings?')) {
      const defaults = resetToDefaultCoupons();
      setCoupons(defaults);
      showNotification('success', 'Restored default luxury coupons.');
    }
  };

  // Submit standard Create/Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedCode = formData.code.trim().toUpperCase();
    if (!normalizedCode) {
      showNotification('error', 'Please provide a valid coupon code.');
      return;
    }

    if (formData.discount_type !== 'free_shipping' && Number(formData.discount_value) <= 0) {
      showNotification('error', 'Discount value must be greater than 0.');
      return;
    }

    // Default expiration for private store credit if not set: 6 months
    let expiry = formData.expires_at;
    if (!expiry && formData.visibility === 'private') {
      expiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expiry && !expiry.includes('T')) {
      expiry = new Date(expiry).toISOString();
    }

    const saved = saveCoupon({
      id: editingCoupon?.id,
      code: normalizedCode,
      discount_type: formData.discount_type,
      discount_value: formData.discount_type === 'free_shipping' ? 0 : Number(formData.discount_value),
      min_order_amount: Number(formData.min_order_amount) || 0,
      description: formData.description.trim() || `${normalizedCode} promotional discount`,
      is_active: formData.is_active,
      visibility: formData.visibility,
      expires_at: expiry || undefined,
      customer_name: formData.customer_name.trim() || undefined,
      customer_phone: formData.customer_phone.trim() || undefined,
      order_reference: formData.order_reference.trim() || undefined,
    });

    setCoupons(saved);
    setIsModalOpen(false);
    showNotification(
      'success',
      editingCoupon
        ? `Coupon "${normalizedCode}" updated successfully.`
        : `New coupon "${normalizedCode}" created successfully.`
    );
  };

  // Submit Return Store Credit
  const handleReturnCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const netCredit = Math.max(0, returnCreditData.original_amount - returnCreditData.return_fee_deducted);
    if (netCredit <= 0) {
      showNotification('error', 'Net credit amount must be greater than ₹0.');
      return;
    }

    const code = returnCreditData.code.trim().toUpperCase() || generateStoreCreditCode();
    // 6 months validity from today
    const sixMonthsExpiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

    const saved = saveCoupon({
      code,
      discount_type: 'fixed',
      discount_value: netCredit,
      min_order_amount: 0,
      description: `Store Credit: Return for Order ${returnCreditData.order_reference || 'ALZ'} (-₹${returnCreditData.return_fee_deducted} fee deducted). Valid 6 months.`,
      is_active: true,
      visibility: 'private',
      expires_at: sixMonthsExpiry,
      customer_name: returnCreditData.customer_name.trim() || 'Store Credit Client',
      customer_phone: returnCreditData.customer_phone.trim() || undefined,
      order_reference: returnCreditData.order_reference.trim() || undefined,
      original_amount: returnCreditData.original_amount,
      return_fee_deducted: returnCreditData.return_fee_deducted,
    });

    setCoupons(saved);
    setIsReturnCreditModalOpen(false);
    showNotification('success', `Private Store Credit code "${code}" (₹${netCredit}) issued successfully! Valid for 6 months.`);
  };

  // Metrics
  const totalCount = coupons.length;
  const activeCount = coupons.filter((c) => c.is_active !== false).length;
  const publicCount = coupons.filter((c) => c.visibility !== 'private').length;
  const privateCount = coupons.filter((c) => c.visibility === 'private').length;

  const filteredCoupons = coupons.filter((c) => {
    if (filterTab === 'public') return c.visibility !== 'private';
    if (filterTab === 'private') return c.visibility === 'private';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 text-xs font-medium border animate-slide-up ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border-red-800 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-luxury-border gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
            Promotions &amp; Store Credit Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1">
            Coupon &amp; Credit Code Manager
          </h1>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Manage Public Promo Codes (visible at checkout) and Private Store Credits (issued privately for returns &amp; exchanges).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
            title="Restore default coupons"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={openReturnCreditModal}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Issue Return Store Credit</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-wider font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
            Total Codes
          </span>
          <div className="text-2xl font-serif font-bold text-luxury-dark">{totalCount}</div>
          <span className="text-[10px] text-stone-400">Public promos &amp; credits</span>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-mono flex items-center space-x-1">
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>Public Promo Codes</span>
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-700">{publicCount}</div>
          <span className="text-[10px] text-stone-400">Visible in checkout offers</span>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-purple-700 font-mono flex items-center space-x-1">
            <Lock className="w-3 h-3 text-purple-600" />
            <span>Private Store Credits</span>
          </span>
          <div className="text-2xl font-serif font-bold text-purple-700">{privateCount}</div>
          <span className="text-[10px] text-stone-400">Valid for 6 months (Hidden)</span>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
            Active Ready
          </span>
          <div className="text-2xl font-serif font-bold text-luxury-gold">{activeCount}</div>
          <span className="text-[10px] text-stone-400">Available for customer use</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-luxury-border pb-2">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
            filterTab === 'all'
              ? 'bg-black text-white'
              : 'text-stone-600 hover:text-black hover:bg-stone-100'
          }`}
        >
          <span>All Codes</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('public')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
            filterTab === 'public'
              ? 'bg-emerald-700 text-white'
              : 'text-stone-600 hover:text-emerald-700 hover:bg-stone-100'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>Public Promo Codes</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {publicCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('private')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
            filterTab === 'private'
              ? 'bg-purple-700 text-white'
              : 'text-stone-600 hover:text-purple-700 hover:bg-stone-100'
          }`}
        >
          <Lock className="w-3 h-3" />
          <span>Private Store Credits</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {privateCount}
          </span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-luxury-border rounded-xl overflow-hidden shadow-sm">
        {filteredCoupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-luxury-gold mx-auto opacity-70" />
            <p className="font-serif text-lg text-luxury-dark">No codes found in this tab</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={openReturnCreditModal}
                className="px-4 py-2 bg-purple-700 text-white text-xs uppercase tracking-wider font-semibold rounded"
              >
                Issue Store Credit
              </button>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-luxury-gold text-white text-xs uppercase tracking-wider font-semibold rounded"
              >
                Create Promo Code
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-luxury-border text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code &amp; Visibility</th>
                  <th className="py-3 px-4">Discount / Credit</th>
                  <th className="py-3 px-4">Type &amp; Customer Details</th>
                  <th className="py-3 px-4">Validity / Expiry</th>
                  <th className="py-3 px-4 text-center">Usage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {filteredCoupons.map((coupon) => {
                  const isActive = coupon.is_active !== false;
                  const isPrivate = coupon.visibility === 'private';
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now();

                  return (
                    <tr
                      key={coupon.id || coupon.code}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        !isActive || isExpired ? 'opacity-60 bg-stone-50/40' : ''
                      }`}
                    >
                      {/* Code & Visibility Badge */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-black uppercase tracking-wider px-2 py-0.5 bg-stone-100 border border-stone-200 rounded">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(coupon.code)}
                              className="text-stone-400 hover:text-black p-1 transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div>
                            {isPrivate ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                <Lock className="w-2.5 h-2.5" />
                                <span>PRIVATE • STORE CREDIT</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Globe className="w-2.5 h-2.5" />
                                <span>PUBLIC • CHECKOUT OFFER</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Discount / Value */}
                      <td className="py-3 px-4">
                        {coupon.discount_type === 'percentage' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Percent className="w-3 h-3" />
                            <span>{coupon.discount_value}% OFF</span>
                          </span>
                        )}
                        {coupon.discount_type === 'fixed' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <IndianRupee className="w-3 h-3" />
                              <span>Flat {formatPrice(coupon.discount_value)} Credit</span>
                            </span>
                            {coupon.return_fee_deducted && (
                              <span className="block text-[10px] text-stone-400">
                                (-{formatPrice(coupon.return_fee_deducted)} return fee)
                              </span>
                            )}
                          </div>
                        )}
                        {coupon.discount_type === 'free_shipping' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <Truck className="w-3 h-3" />
                            <span>FREE SHIPPING</span>
                          </span>
                        )}
                      </td>

                      {/* Details & Target Customer */}
                      <td className="py-3 px-4">
                        {isPrivate ? (
                          <div className="space-y-0.5 text-[11px]">
                            {coupon.customer_name && (
                              <div className="font-semibold text-stone-800 flex items-center space-x-1">
                                <User className="w-3 h-3 text-purple-600" />
                                <span>{coupon.customer_name}</span>
                              </div>
                            )}
                            {coupon.customer_phone && (
                              <div className="text-stone-500 flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-stone-400" />
                                <span>{coupon.customer_phone}</span>
                              </div>
                            )}
                            {coupon.order_reference && (
                              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-block">
                                Order: {coupon.order_reference}
                              </span>
                            )}
                            <p className="text-[10px] text-stone-400 truncate max-w-xs">
                              {coupon.description}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-stone-700 font-medium">{coupon.description}</p>
                            {coupon.min_order_amount && coupon.min_order_amount > 0 ? (
                              <span className="text-[10px] text-stone-500 font-mono">
                                Min Spend: {formatPrice(coupon.min_order_amount)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-400">No minimum spend</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Validity / Expiry */}
                      <td className="py-3 px-4">
                        {coupon.expires_at ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              <span className={`font-mono ${isExpired ? 'text-red-600 font-bold' : 'text-stone-700'}`}>
                                {new Date(coupon.expires_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            {isExpired ? (
                              <span className="text-[10px] text-red-600 font-semibold block">EXPIRED</span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 block">6-Month Guarantee</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400">Never Expires</span>
                        )}
                      </td>

                      {/* Usage Count */}
                      <td className="py-3 px-4 text-center font-mono font-medium text-stone-700">
                        {coupon.usage_count || 0}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon.id || coupon.code, coupon.code)}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                            isActive && !isExpired
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {isActive && !isExpired ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPrivate && (
                            <button
                              type="button"
                              onClick={() => handleCopyWhatsAppText(coupon)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              title="Copy WhatsApp message for client"
                            >
                              {copiedWhatsAppMsg === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <MessageSquare className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(coupon)}
                            className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded transition-colors"
                            title="Edit code"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon.id || coupon.code, coupon.code)}
                            className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEDICATED RETURN STORE CREDIT MODAL */}
      {isReturnCreditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-luxury-border shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="p-6 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-purple-200 font-mono font-semibold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Return &amp; Exchange Store Credit Generator</span>
                </span>
                <h3 className="font-serif text-xl font-normal text-white mt-1">
                  Issue Private Store Credit Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReturnCreditModalOpen(false)}
                className="text-white/70 hover:text-white p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturnCreditSubmit} className="p-6 space-y-4 text-xs">
              {/* Return Policy Notice */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 space-y-1">
                <p className="font-semibold flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>Return Policy Standard: Deduct ₹100 Return Processing Fee</span>
                </p>
                <p className="text-[11px] text-purple-700 font-light">
                  Per Aleez Perfumes policy, returns are credited as private store credit valid for 6 months. No bank reversals.
                </p>
              </div>

              {/* Order Reference & Customer Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={returnCreditData.order_reference}
                    onChange={(e) =>
                      setReturnCreditData((prev) => ({ ...prev, order_reference: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. ALZ-618836"
                    className="w-full px-3 py-2 border border-stone-300 rounded font-mono uppercase text-black font-semibold focus:border-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={returnCreditData.customer_name}
                    onChange={(e) =>
                      setReturnCreditData((prev) => ({ ...prev, customer_name: e.target.value }))
                    }
                    placeholder="e.g. Mohamed Asfar"
                    className="w-full px-3 py-2 border border-stone-300 rounded text-black focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              {/* Customer WhatsApp */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Customer Mobile / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={returnCreditData.customer_phone}
                  onChange={(e) =>
                    setReturnCreditData((prev) => ({ ...prev, customer_phone: e.target.value }))
                  }
                  placeholder="+91 93455 26905"
                  className="w-full px-3 py-2 border border-stone-300 rounded text-black font-mono focus:border-purple-600 outline-none"
                />
              </div>

              {/* Return Calculation */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 uppercase tracking-wider font-medium text-[10px] mb-1">
                      Original Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={returnCreditData.original_amount}
                      onChange={(e) =>
                        setReturnCreditData((prev) => ({
                          ...prev,
                          original_amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded font-mono font-bold text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 uppercase tracking-wider font-medium text-[10px] mb-1">
                      Return Fee Deducted (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={returnCreditData.return_fee_deducted}
                      onChange={(e) =>
                        setReturnCreditData((prev) => ({
                          ...prev,
                          return_fee_deducted: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded font-mono font-bold text-red-600"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="font-semibold text-stone-800 text-xs">
                    Net Store Credit to Credit Customer:
                  </span>
                  <span className="font-mono text-base font-bold text-purple-700">
                    {formatPrice(
                      Math.max(0, returnCreditData.original_amount - returnCreditData.return_fee_deducted)
                    )}
                  </span>
                </div>
              </div>

              {/* Private Code Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-700 uppercase tracking-wider font-semibold text-[11px]">
                    Private Store Credit Code *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setReturnCreditData((prev) => ({ ...prev, code: generateStoreCreditCode() }))
                    }
                    className="text-[10px] text-purple-700 hover:text-purple-900 font-semibold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Regenerate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={returnCreditData.code}
                  onChange={(e) =>
                    setReturnCreditData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  className="w-full px-3 py-2 border-2 border-purple-600 rounded font-mono uppercase text-black font-bold text-sm tracking-widest bg-purple-50/30 outline-none"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  🔒 Private Code: Hidden from public checkout lists. Pre-set with 6-month validity.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsReturnCreditModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded shadow-sm flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Issue Store Credit Code</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STANDARD CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-luxury-border shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-luxury-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-mono font-semibold">
                  {editingCoupon ? 'Modify Promotion' : 'New Offer'}
                </span>
                <h3 className="font-serif text-xl font-normal text-luxury-dark mt-0.5">
                  {editingCoupon ? `Edit Code: ${editingCoupon.code}` : 'Create Promo Code'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-black p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Visibility Choice */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Visibility &amp; Channel *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, visibility: 'public' }))}
                    className={`py-2 px-3 border rounded text-left transition-all ${
                      formData.visibility === 'public'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-bold">Public Code</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-normal">
                      Visible in available offers dropdown to all checkout clients.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, visibility: 'private' }))}
                    className={`py-2 px-3 border rounded text-left transition-all ${
                      formData.visibility === 'private'
                        ? 'border-purple-700 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-600'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <Lock className="w-3.5 h-3.5 text-purple-700" />
                      <span className="font-bold">Private Code</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-normal">
                      Hidden from checkout dropdown. Handed privately to customer.
                    </p>
                  </button>
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. VIP25, SUMMER10, FESTIVE"
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono uppercase text-black font-bold focus:border-black outline-none tracking-wider"
                />
                <p className="text-[10px] text-stone-400 mt-1">Codes are automatically uppercased.</p>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Discount Mechanism *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, discount_type: 'percentage' }))}
                    className={`py-2 px-3 border rounded text-center transition-all ${
                      formData.discount_type === 'percentage'
                        ? 'border-black bg-black text-white font-semibold'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-black'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, discount_type: 'fixed' }))}
                    className={`py-2 px-3 border rounded text-center transition-all ${
                      formData.discount_type === 'fixed'
                        ? 'border-black bg-black text-white font-semibold'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-black'
                    }`}
                  >
                    Flat Rupee (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, discount_type: 'free_shipping' }))}
                    className={`py-2 px-3 border rounded text-center transition-all ${
                      formData.discount_type === 'free_shipping'
                        ? 'border-black bg-black text-white font-semibold'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-black'
                    }`}
                  >
                    Free Shipping
                  </button>
                </div>
              </div>

              {/* Value Input (Hidden if Free Shipping) */}
              {formData.discount_type !== 'free_shipping' && (
                <div>
                  <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                    {formData.discount_type === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discount_type === 'percentage' ? 100 : 100000}
                    required
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-black font-semibold focus:border-black outline-none"
                  />
                </div>
              )}

              {/* Minimum Order Value */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Minimum Order Spend (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0 for no minimum requirement"
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-black focus:border-black outline-none"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-black focus:border-black outline-none"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Private return store credits automatically default to 6 months if left blank.
                </p>
              </div>

              {/* If Private: Optional Customer Info */}
              {formData.visibility === 'private' && (
                <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                    Recipient Customer Info (Optional)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Customer Name"
                      className="px-2.5 py-1.5 bg-white border border-stone-300 rounded text-black text-xs"
                    />
                    <input
                      type="text"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))}
                      placeholder="WhatsApp / Phone"
                      className="px-2.5 py-1.5 bg-white border border-stone-300 rounded text-black text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. 15% off orders above ₹1,999"
                  className="w-full px-3 py-2 border border-stone-300 rounded text-black focus:border-black outline-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded text-black focus:ring-black border-stone-300"
                  />
                  <span className="text-stone-800 font-medium">
                    Activate coupon immediately for online checkout
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-luxury-border flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-gold hover:bg-luxury-goldHover text-white font-semibold rounded shadow-sm"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
