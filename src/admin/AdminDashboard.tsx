import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  FolderTree,
  Settings,
} from 'lucide-react';
import { dbService } from '../lib/supabase';
import { Product, Order, Category } from '../types';
import { useSettings } from '../context/SettingsContext';

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { formatPrice } = useSettings();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [prodList, orderList, catList] = await Promise.all([
          dbService.getProducts(),
          dbService.getOrders(),
          dbService.getCategories(),
        ]);
        setProducts(prodList);
        setOrders(orderList);
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalSales = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const paidOrders = orders.filter((o) => o.payment_status === 'paid').length;
  const pendingOrders = orders.filter((o) => o.order_status === 'pending' || o.payment_status === 'pending').length;
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 5);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-luxury-border gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
            Overview
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1">
            Store Performance & Metrics
          </h1>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products?action=new"
            className="px-5 py-2.5 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Obvious Quick Navigation Tiles for Store Owner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/admin/products?action=new"
          className="p-4 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 hover:bg-luxury-gold/20 transition-all flex items-center space-x-3 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-luxury-gold text-white flex items-center justify-center font-bold">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-luxury-dark group-hover:text-luxury-gold">Add Product</h4>
            <p className="text-[11px] text-stone-500">Publish new scent</p>
          </div>
        </Link>

        <Link
          to="/admin/products"
          className="p-4 rounded-xl bg-white border border-luxury-border hover:border-luxury-gold/50 transition-all flex items-center space-x-3 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-stone-50 border border-luxury-border flex items-center justify-center text-luxury-gold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-luxury-dark group-hover:text-luxury-gold">Manage Products</h4>
            <p className="text-[11px] text-stone-500">{products.length} in catalog</p>
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="p-4 rounded-xl bg-white border border-luxury-border hover:border-luxury-gold/50 transition-all flex items-center space-x-3 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-stone-50 border border-luxury-border flex items-center justify-center text-luxury-gold">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-luxury-dark group-hover:text-luxury-gold">Categories</h4>
            <p className="text-[11px] text-stone-500">{categories.length} fragrance groups</p>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="p-4 rounded-xl bg-white border border-luxury-border hover:border-luxury-gold/50 transition-all flex items-center space-x-3 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-stone-50 border border-luxury-border flex items-center justify-center text-luxury-gold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-luxury-dark group-hover:text-luxury-gold">Orders</h4>
            <p className="text-[11px] text-stone-500">{orders.length} total orders</p>
          </div>
        </Link>
      </div>

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Sales */}
        <div className="p-4 rounded-xl bg-white border border-luxury-border space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Total Sales</span>
            <TrendingUp className="w-4 h-4 text-luxury-gold" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-luxury-gold block">
            {formatPrice(totalSales)}
          </span>
          <span className="text-[10px] text-stone-400">Verified Razorpay</span>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-xl bg-white border border-luxury-border space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-luxury-dark block">
            {orders.length}
          </span>
          <span className="text-[10px] text-stone-400">All channels</span>
        </div>

        {/* Paid Orders */}
        <div className="p-4 rounded-xl bg-white border border-luxury-border space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Paid Orders</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-600 block">
            {paidOrders}
          </span>
          <span className="text-[10px] text-stone-400">Ready for dispatch</span>
        </div>

        {/* Pending Orders */}
        <div className="p-4 rounded-xl bg-white border border-luxury-border space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-amber-600 block">
            {pendingOrders}
          </span>
          <span className="text-[10px] text-stone-400">In process</span>
        </div>

        {/* Total Products */}
        <div className="p-4 rounded-xl bg-white border border-luxury-border space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Total Products</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-luxury-dark block">
            {products.length}
          </span>
          <span className="text-[10px] text-stone-400">Active catalog</span>
        </div>

        {/* Low Stock Alert */}
        <div className="p-4 rounded-xl bg-white border border-luxury-border space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-stone-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <span className="font-mono text-xl sm:text-2xl font-bold text-red-600 block">
            {lowStockProducts.length}
          </span>
          <span className="text-[10px] text-stone-400">Stock ≤ 5 bottles</span>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-red-800">
                Low Stock Alert ({lowStockProducts.length} Fragrances)
              </h4>
              <p className="text-[11px] text-red-700 font-light">
                {lowStockProducts.map((p) => `${p.name} (${p.stock_quantity} left)`).join(', ')}
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="text-xs text-luxury-gold hover:underline font-medium whitespace-nowrap"
          >
            Update Inventory →
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white border border-luxury-border rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-luxury-border pb-4">
          <h2 className="font-serif text-xl text-luxury-dark">Recent Customer Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs text-luxury-gold hover:text-luxury-dark flex items-center space-x-1 font-medium"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">No orders registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-luxury-border text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border font-light">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 font-mono font-medium text-luxury-gold">
                      {ord.order_number}
                    </td>
                    <td className="py-3">
                      <span className="text-luxury-dark font-medium block">{ord.customer_name}</span>
                      <span className="text-[10px] text-stone-500">{ord.customer_phone}</span>
                    </td>
                    <td className="py-3 text-stone-600">
                      {ord.shipping_city}, {ord.shipping_state}
                    </td>
                    <td className="py-3 font-mono font-medium text-luxury-dark">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30">
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/orders?order=${ord.order_number}`}
                        className="text-luxury-gold hover:underline font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
