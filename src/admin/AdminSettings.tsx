import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, CheckCircle, AlertCircle, RefreshCw, Users, ArrowRight, ShieldCheck, Truck, MessageCircle, Calculator, Search } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { shippingService } from '../lib/shippingService';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    brand_name: settings.brand_name || 'Aleez Perfumes',
    tagline: settings.tagline || 'Discover Your Signature Scent',
    description: settings.description || '',
    phone: settings.phone || '+91 9345526905',
    whatsapp: settings.whatsapp || '+919345526905',
    email: settings.email || 'aleez.perfumes818@gmail.com',
    instagram: settings.instagram || '@aleez.parfums',
    instagram_url: settings.instagram_url || 'https://instagram.com/aleez.parfums',
    currency: settings.currency || 'INR',
    currency_symbol: settings.currency_symbol || '₹',
    free_shipping_threshold: settings.free_shipping_threshold || 999999,
    standard_shipping_fee: settings.standard_shipping_fee || 48,
    shipping_fee_type: settings.shipping_fee_type || 'live_shiprocket',
    announcement_bar: settings.announcement_bar || '',
    is_store_open: settings.is_store_open !== undefined ? settings.is_store_open : true,
    shiprocket_email: settings.shiprocket_email || '',
    shiprocket_password: settings.shiprocket_password || '',
    shiprocket_pickup_location: settings.shiprocket_pickup_location || 'Primary',
    shiprocket_pickup_pincode: settings.shiprocket_pickup_pincode || '608306',
    whatsapp_phone_number_id: settings.whatsapp_phone_number_id || '',
    whatsapp_access_token: settings.whatsapp_access_token || '',
    whatsapp_bsp_api_key: settings.whatsapp_bsp_api_key || '',
    whatsapp_bsp_endpoint: settings.whatsapp_bsp_endpoint || '',
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<{ testing: boolean; message?: string; success?: boolean } | null>(null);

  // Rate calculator state
  const [calculatorPincode, setCalculatorPincode] = useState('');
  const [calculatingRate, setCalculatingRate] = useState(false);
  const [rateQuote, setRateQuote] = useState<any>(null);
  const [rateError, setRateError] = useState<string | null>(null);

  const handleCalculateShiprocketRate = async () => {
    if (!calculatorPincode || !/^\d{6}$/.test(calculatorPincode.trim())) {
      setRateError('Please enter a valid 6-digit delivery pincode (e.g. 600001, 560001, 110001).');
      return;
    }
    setRateError(null);
    setCalculatingRate(true);
    setRateQuote(null);
    try {
      const res = await shippingService.calculateRates(calculatorPincode.trim());
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch courier quote from Shiprocket.');
      }
      setRateQuote(res);
    } catch (err: any) {
      setRateError(err.message || 'Error calculating rate');
    } finally {
      setCalculatingRate(false);
    }
  };

  const handleTestShiprocket = async () => {
    if (!formData.shiprocket_email || !formData.shiprocket_password) {
      setTestStatus({ testing: false, success: false, message: 'Please enter your Shiprocket email & password first.' });
      return;
    }
    setTestStatus({ testing: true });
    const result = await shippingService.testConnection(formData.shiprocket_email, formData.shiprocket_password);
    setTestStatus({
      testing: false,
      success: result.success,
      message: result.success ? 'Successfully verified Shiprocket API connection!' : (result.error || 'Connection failed. Check credentials.'),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as any).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        ...formData,
        free_shipping_threshold: Number(formData.free_shipping_threshold),
        standard_shipping_fee: Number(formData.standard_shipping_fee),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-luxury-border gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
            Configuration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1">
            Store & Brand Settings
          </h1>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Manage global store identity, customer concierge coordinates, and shipping thresholds.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 animate-slide-up shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Global store settings successfully updated and live across the store!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Information */}
        <div className="bg-white border border-luxury-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-lg text-luxury-dark border-b border-luxury-border pb-2">
            1. Brand Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Brand Name
              </label>
              <input
                type="text"
                name="brand_name"
                value={formData.brand_name}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Tagline / Motto
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
              Brand Description
            </label>
            <textarea
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
              Top Announcement Bar Message
            </label>
            <input
              type="text"
              name="announcement_bar"
              value={formData.announcement_bar}
              onChange={handleChange}
              placeholder="e.g. Complimentary luxury express shipping across India on all orders"
              className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
            />
          </div>
        </div>

        {/* Contact Coordinates */}
        <div className="bg-white border border-luxury-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-lg text-luxury-dark border-b border-luxury-border pb-2">
            2. Customer Concierge & Socials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Phone / WhatsApp Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Customer Care Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Instagram Handle
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Instagram Profile Link
              </label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Commerce Settings */}
        <div className="bg-white border border-luxury-border rounded-xl p-6 space-y-5 shadow-sm">
          <h2 className="font-serif text-lg text-luxury-dark border-b border-luxury-border pb-2">
            3. Customer Shipping Fee Option
          </h2>

          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-medium">
              Choose How Shipping Fee is Charged to Customers:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Free */}
              <div
                onClick={() => setFormData({ ...formData, shipping_fee_type: 'free', standard_shipping_fee: 0 })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.shipping_fee_type === 'free'
                    ? 'border-luxury-gold bg-amber-50/40 ring-1 ring-luxury-gold'
                    : 'border-luxury-border bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <input
                    type="radio"
                    name="shipping_fee_type"
                    checked={formData.shipping_fee_type === 'free'}
                    onChange={() => {}}
                    className="accent-luxury-gold"
                  />
                  <span className="text-xs font-semibold text-luxury-dark">Complimentary Free Shipping</span>
                </div>
                <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                  ₹0 charged to customer across India. You pay Shiprocket from flacon profit. (Highest conversion rate)
                </p>
              </div>

              {/* Option 2: Flat Rate */}
              <div
                onClick={() => setFormData({ ...formData, shipping_fee_type: 'flat', standard_shipping_fee: formData.standard_shipping_fee || 49 })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.shipping_fee_type === 'flat'
                    ? 'border-luxury-gold bg-amber-50/40 ring-1 ring-luxury-gold'
                    : 'border-luxury-border bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <input
                    type="radio"
                    name="shipping_fee_type"
                    checked={formData.shipping_fee_type === 'flat'}
                    onChange={() => {}}
                    className="accent-luxury-gold"
                  />
                  <span className="text-xs font-semibold text-luxury-dark">Flat Shipping Rate</span>
                </div>
                <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                  Charge a fixed delivery fee (e.g. ₹49, ₹79, or ₹99) added to checkout total.
                </p>
              </div>

              {/* Option 3: Live Shiprocket Rates */}
              <div
                onClick={() => setFormData({ ...formData, shipping_fee_type: 'live_shiprocket' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.shipping_fee_type === 'live_shiprocket'
                    ? 'border-luxury-gold bg-amber-50/40 ring-1 ring-luxury-gold'
                    : 'border-luxury-border bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <input
                    type="radio"
                    name="shipping_fee_type"
                    checked={formData.shipping_fee_type === 'live_shiprocket'}
                    onChange={() => {}}
                    className="accent-luxury-gold"
                  />
                  <span className="text-xs font-semibold text-luxury-dark">Live Shiprocket Rates</span>
                </div>
                <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                  Calculate and charge exact courier fees quoted by Shiprocket (Delhivery / Blue Dart) based on customer pincode.
                </p>
              </div>
            </div>

            {/* Flat Fee Input when Flat is selected */}
            {formData.shipping_fee_type === 'flat' && (
              <div className="pt-2 max-w-xs animate-fade-in">
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Standard Flat Shipping Fee (₹ INR)
                </label>
                <input
                  type="number"
                  name="standard_shipping_fee"
                  value={formData.standard_shipping_fee}
                  onChange={handleChange}
                  placeholder="49"
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-luxury-border">
            <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                name="is_store_open"
                checked={formData.is_store_open}
                onChange={(e) => setFormData({ ...formData, is_store_open: e.target.checked })}
                className="accent-luxury-gold"
              />
              <span>Store is Active & Accepting Prepaid Orders</span>
            </label>
          </div>
        </div>

        {/* Shiprocket Logistics & Courier Integration */}
        <div className="bg-white border border-luxury-border rounded-xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-border pb-2 gap-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-luxury-gold" />
              <h2 className="font-serif text-lg text-luxury-dark">
                4. Shiprocket Delivery & Live Courier Fee Checker
              </h2>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pan-India Surface (Delhivery • Blue Dart • DTDC)
            </span>
          </div>

          <p className="text-xs text-stone-600 font-light leading-relaxed">
            Connect your <strong>Shiprocket</strong> account to allocate couriers, fetch live freight fees, generate AWB tracking barcodes, and track packages 24/7 across India.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Shiprocket Email ID
              </label>
              <input
                type="email"
                name="shiprocket_email"
                placeholder="your-account@email.com"
                value={formData.shiprocket_email}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Shiprocket Password
              </label>
              <input
                type="password"
                name="shiprocket_password"
                placeholder="••••••••••••"
                value={formData.shiprocket_password}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Pickup Origin Pincode
              </label>
              <input
                type="text"
                name="shiprocket_pickup_pincode"
                placeholder="608306"
                value={formData.shiprocket_pickup_pincode}
                onChange={handleChange}
                maxLength={6}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
              Pickup Location Name in Shiprocket
            </label>
            <input
              type="text"
              name="shiprocket_pickup_location"
              placeholder="Primary (or your exact Shiprocket pickup hub name)"
              value={formData.shiprocket_pickup_location}
              onChange={handleChange}
              className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Must match the "Pickup Address Nickname" in your Shiprocket Settings (default is often "Primary").
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleTestShiprocket}
              disabled={testStatus?.testing}
              className="px-4 py-2 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus?.testing ? 'animate-spin' : ''}`} />
              <span>{testStatus?.testing ? 'Testing Connection...' : 'Test Shiprocket Connection'}</span>
            </button>

            {testStatus?.message && (
              <span
                className={`text-xs flex items-center space-x-1.5 ${
                  testStatus.success ? 'text-emerald-600 font-medium' : 'text-red-500'
                }`}
              >
                {testStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{testStatus.message}</span>
              </span>
            )}
          </div>

          {/* Interactive Live Shiprocket Courier Fee Checker */}
          <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-luxury-border space-y-3">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-luxury-gold" />
              <h3 className="text-xs uppercase tracking-wider font-semibold text-luxury-dark">
                Live Courier Fee Checker (What Shiprocket Quotes)
              </h3>
            </div>
            <p className="text-[11px] text-stone-500">
              Type any customer's 6-digit destination pincode below to see the exact freight fee and courier choices Shiprocket quotes:
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="text"
                maxLength={6}
                value={calculatorPincode}
                onChange={(e) => setCalculatorPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode (e.g. 600001, 560001, 110001)"
                className="flex-1 bg-white border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs font-mono text-luxury-dark focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCalculateShiprocketRate}
                disabled={calculatingRate}
                className="px-4 py-2 bg-luxury-dark hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Search className={`w-3.5 h-3.5 ${calculatingRate ? 'animate-spin' : ''}`} />
                <span>{calculatingRate ? 'Quoting...' : 'Check Fee'}</span>
              </button>
            </div>

            {rateError && (
              <p className="text-xs text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{rateError}</span>
              </p>
            )}

            {rateQuote && (
              <div className="mt-3 p-3.5 bg-white border border-luxury-border rounded-lg space-y-3 animate-fade-in text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-200 gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-mono">
                      Origin ({rateQuote.pickup_postcode}) → Destination ({rateQuote.delivery_postcode})
                    </span>
                    <span className="font-semibold text-stone-900 text-sm">
                      Recommended: {rateQuote.recommended_courier}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Shiprocket Fee</span>
                    <span className="text-base font-bold font-serif text-emerald-700">₹{rateQuote.rate}</span>
                    <span className="text-[11px] text-stone-500 block font-light">Est: {rateQuote.estimated_days}</span>
                  </div>
                </div>

                {rateQuote.couriers && rateQuote.couriers.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold block mb-1.5">
                      Available Courier Partners &amp; Quotes:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rateQuote.couriers.map((c: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded bg-stone-50 border border-stone-200">
                          <span className="font-medium text-stone-800">{c.name}</span>
                          <span className="font-mono font-semibold text-stone-900">₹{c.rate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rateQuote.notice && (
                  <p className="text-[10px] text-stone-400 font-mono italic">
                    ℹ️ {rateQuote.notice}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Business Automation */}
        <div className="bg-white border border-luxury-border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-border pb-2 gap-2">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <h2 className="font-serif text-lg text-luxury-dark">
                5. Automated WhatsApp Notifications & Abandoned Carts
              </h2>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Orders • Dispatches • Carts
            </span>
          </div>

          <p className="text-xs text-stone-600 font-light leading-relaxed">
            Automatically notify customers on WhatsApp when an order is <strong>Confirmed</strong>, <strong>Dispatched</strong> with live tracking, <strong>Delivered</strong>, or <strong>Cancelled</strong>, and re-engage visitors who left items in their cart.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                WhatsApp Phone Number ID (Meta Cloud API)
              </label>
              <input
                type="text"
                name="whatsapp_phone_number_id"
                placeholder="e.g. 104859203847291"
                value={formData.whatsapp_phone_number_id}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                System Access Token (Meta Permanent Token)
              </label>
              <input
                type="password"
                name="whatsapp_access_token"
                placeholder="EAA..."
                value={formData.whatsapp_access_token}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-luxury-border text-xs text-stone-600 space-y-1">
            <span className="font-semibold text-luxury-dark block">⚡ 100% Free 1-Click WhatsApp Concierge is Always Ready</span>
            <p>
              Even without API keys, you can send official formatted updates with <strong>one click</strong> directly from any order’s Details window in <Link to="/admin/orders" className="text-luxury-gold font-medium underline">Admin Orders</Link>!
            </p>
          </div>
        </div>

        {/* Administrators & Team Permissions */}
        <div className="bg-white border border-luxury-border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-border pb-2 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-luxury-gold" />
              <h2 className="font-serif text-lg text-luxury-dark">
                6. Authorized Administrators & Team Staff
              </h2>
            </div>
            <Link
              to="/admin/team"
              className="inline-flex items-center space-x-1.5 text-xs text-luxury-gold hover:text-luxury-goldHover font-medium transition-colors"
            >
              <span>Manage Team Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-stone-500 font-light leading-relaxed">
            Need to grant access to store partners, managers, or fulfillment staff? You can add extra administrators or revoke access at any time from the Admins & Staff portal.
          </p>
          <div className="pt-1">
            <Link
              to="/admin/team"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-stone-900 hover:bg-black text-amber-300 text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Open Admins & Staff Manager</span>
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Store Settings</span>
        </button>
      </form>
    </div>
  );
};
