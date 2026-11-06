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
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';
import { Coupon } from '../types';
import {
  getCoupons,
  saveCoupon,
  deleteCoupon,
  toggleCouponStatus,
  resetToDefaultCoupons,
} from '../lib/couponService';
import { useSettings } from '../context/SettingsContext';

export const AdminCoupons: React.FC = () => {
  const { formatPrice } = useSettings();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    code: string;
    discount_type: 'percentage' | 'fixed' | 'free_shipping';
    discount_value: number;
    min_order_amount: number;
    description: string;
    is_active: boolean;
  }>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    description: '',
    is_active: true,
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

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      description: '',
      is_active: true,
    });
    setIsModalOpen(true);
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

    const saved = saveCoupon({
      id: editingCoupon?.id,
      code: normalizedCode,
      discount_type: formData.discount_type,
      discount_value: formData.discount_type === 'free_shipping' ? 0 : Number(formData.discount_value),
      min_order_amount: Number(formData.min_order_amount) || 0,
      description: formData.description.trim() || `${normalizedCode} promotional discount`,
      is_active: formData.is_active,
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

  // Metrics
  const totalCount = coupons.length;
  const activeCount = coupons.filter((c) => c.is_active !== false).length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);
  const freeShipCount = coupons.filter((c) => c.discount_type === 'free_shipping').length;

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
            Promotions &amp; Incentives
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1">
            Coupons &amp; Promo Codes
          </h1>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Configure discount codes, minimum basket thresholds, and automated checkout promotions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
            title="Restore default coupons"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
            Total Coupons
          </span>
          <div className="text-2xl font-serif font-bold text-luxury-dark">{totalCount}</div>
          <span className="text-[10px] text-stone-400">Configured in registry</span>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
            Active Codes
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-600">{activeCount}</div>
          <span className="text-[10px] text-stone-400">Ready for checkout</span>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
            Free Shipping Offers
          </span>
          <div className="text-2xl font-serif font-bold text-luxury-dark">{freeShipCount}</div>
          <span className="text-[10px] text-stone-400">Courier waiver codes</span>
        </div>

        <div className="bg-white border border-luxury-border rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
            Total Orders Discounted
          </span>
          <div className="text-2xl font-serif font-bold text-luxury-gold">{totalUsage}</div>
          <span className="text-[10px] text-stone-400">Customer redemptions</span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-luxury-border rounded-xl overflow-hidden shadow-sm">
        {coupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tag className="w-10 h-10 text-luxury-gold mx-auto opacity-70" />
            <p className="font-serif text-lg text-luxury-dark">No coupons created yet</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-luxury-gold text-white text-xs uppercase tracking-wider font-semibold rounded"
            >
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-luxury-border text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min. Spend</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Usage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {coupons.map((coupon) => {
                  const isActive = coupon.is_active !== false;
                  return (
                    <tr
                      key={coupon.id || coupon.code}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        !isActive ? 'opacity-60 bg-stone-50/40' : ''
                      }`}
                    >
                      {/* Code */}
                      <td className="py-3 px-4">
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
                      </td>

                      {/* Discount Value & Badge */}
                      <td className="py-3 px-4">
                        {coupon.discount_type === 'percentage' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Percent className="w-3 h-3" />
                            <span>{coupon.discount_value}% OFF</span>
                          </span>
                        )}
                        {coupon.discount_type === 'fixed' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <IndianRupee className="w-3 h-3" />
                            <span>Flat {formatPrice(coupon.discount_value)} OFF</span>
                          </span>
                        )}
                        {coupon.discount_type === 'free_shipping' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <Truck className="w-3 h-3" />
                            <span>FREE SHIPPING</span>
                          </span>
                        )}
                      </td>

                      {/* Min Order Amount */}
                      <td className="py-3 px-4 font-mono text-stone-700">
                        {coupon.min_order_amount && coupon.min_order_amount > 0 ? (
                          formatPrice(coupon.min_order_amount)
                        ) : (
                          <span className="text-stone-400 text-[11px] font-sans">No Minimum</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                        {coupon.description}
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
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {isActive ? (
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
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(coupon)}
                            className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded transition-colors"
                            title="Edit coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon.id || coupon.code, coupon.code)}
                            className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete coupon"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-luxury-border shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-luxury-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-mono font-semibold">
                  {editingCoupon ? 'Modify Promotion' : 'New Offer'}
                </span>
                <h3 className="font-serif text-xl font-normal text-luxury-dark mt-0.5">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Promo Code'}
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
                <p className="text-[10px] text-stone-400 mt-1">Codes will be automatically uppercased.</p>
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
                    max={formData.discount_type === 'percentage' ? 100 : 10000}
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
                <p className="text-[10px] text-stone-400 mt-1">Set to 0 to apply to all order values.</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-stone-700 uppercase tracking-wider font-semibold mb-1 text-[11px]">
                  Description &amp; Public Customer Label *
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
