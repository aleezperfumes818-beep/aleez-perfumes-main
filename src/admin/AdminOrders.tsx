import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  MessageCircle,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { dbService } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { useSettings } from '../context/SettingsContext';

export const AdminOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { formatPrice } = useSettings();

  const loadOrders = async () => {
    try {
      const allOrders = await dbService.getOrders();
      setOrders(allOrders);

      // If ?order=ALZ-xxx in query
      const urlOrder = searchParams.get('order');
      if (urlOrder) {
        const found = allOrders.find((o) => o.order_number === urlOrder);
        if (found) setSelectedOrder(found);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchParams]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await dbService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.customer_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-luxury-border gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
            Fulfillment
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1">
            Order Fulfillment
          </h1>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Monitor client orders, inspect purchased items, and update delivery dispatch coordinates.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-luxury-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, client name, phone, or email..."
            className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded pl-9 pr-3 py-2 text-xs text-luxury-dark focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-stone-50 border border-luxury-border text-luxury-dark text-xs rounded px-3 py-2 focus:outline-none focus:border-luxury-gold w-full sm:w-auto"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-luxury-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-luxury-gold mx-auto opacity-70" />
            <p className="font-serif text-lg text-luxury-dark">No orders match criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-luxury-border text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Shipping Destination</th>
                  <th className="py-3 px-4">Items / Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border font-light">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-luxury-gold block">
                        #{ord.order_number}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-luxury-dark font-medium block">{ord.customer_name}</span>
                      <span className="text-[10px] text-stone-500 font-mono block">
                        {ord.customer_phone}
                      </span>
                      <span className="text-[10px] text-stone-400 block">{ord.customer_email}</span>
                    </td>

                    <td className="py-3 px-4 text-stone-600">
                      <span className="block truncate max-w-xs">{ord.shipping_address}</span>
                      <span className="text-[10px] text-stone-400">
                        {ord.shipping_city}, {ord.shipping_state} ({ord.shipping_pincode})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-stone-600 block">
                        {ord.items?.length || 1} {(ord.items?.length || 1) === 1 ? 'bottle' : 'bottles'}
                      </span>
                      <span className="font-mono font-bold text-luxury-gold block">
                        {formatPrice(ord.total_amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{ord.payment_status}</span>
                      </span>
                      <span className="block text-[10px] text-stone-400 font-mono mt-0.5">
                        Razorpay
                      </span>
                    </td>

                    {/* Status updater */}
                    <td className="py-3 px-4">
                      <select
                        value={ord.order_status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className={`text-[10px] uppercase font-semibold px-2 py-1 rounded border focus:outline-none ${getStatusBadge(
                          ord.order_status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 hover:bg-luxury-gold hover:text-white rounded text-[11px] uppercase tracking-wider font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-white border border-luxury-border rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-luxury-dark max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-luxury-border pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-mono font-medium">
                  Order Invoice
                </span>
                <h2 className="font-serif text-2xl text-luxury-dark">
                  #{selectedOrder.order_number}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-luxury-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Status Controller */}
            <div className="p-4 bg-stone-50 rounded-xl border border-luxury-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                  Current Order Status
                </span>
                <span className="text-sm font-semibold text-luxury-dark uppercase tracking-wider">
                  {selectedOrder.order_status}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-stone-500 font-light">Update:</span>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="bg-white border border-luxury-gold text-luxury-gold text-xs rounded px-3 py-1.5 focus:outline-none font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-lg border border-luxury-border space-y-2">
                <span className="uppercase tracking-wider text-luxury-gold font-medium block">
                  Client Coordinates
                </span>
                <p className="text-luxury-dark font-medium text-sm">{selectedOrder.customer_name}</p>
                <p className="text-stone-600 font-mono">{selectedOrder.customer_phone}</p>
                <p className="text-stone-500 break-all">{selectedOrder.customer_email}</p>

                <a
                  href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi ${selectedOrder.customer_name}, this is Aleez Perfumes regarding your Order #${selectedOrder.order_number}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-emerald-600 hover:underline pt-1 text-[11px] font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message Client on WhatsApp</span>
                </a>
              </div>

              <div className="p-4 bg-stone-50 rounded-lg border border-luxury-border space-y-1.5">
                <span className="uppercase tracking-wider text-luxury-gold font-medium block">
                  Delivery Destination
                </span>
                <p className="text-luxury-dark">{selectedOrder.shipping_address}</p>
                <p className="text-stone-600">
                  {selectedOrder.shipping_city}, {selectedOrder.shipping_state}
                </p>
                <p className="font-mono text-stone-500">PIN: {selectedOrder.shipping_pincode}</p>
                {selectedOrder.notes && (
                  <p className="text-[11px] text-stone-500 italic pt-1">
                    Notes: {selectedOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3">
              <span className="uppercase tracking-wider text-stone-500 text-xs font-medium block">
                Purchased Fragrances
              </span>
              <div className="space-y-2 border border-luxury-border rounded-lg overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 flex items-center justify-between border-b border-luxury-border last:border-none text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt=""
                          className="w-12 h-12 object-cover rounded bg-stone-100"
                        />
                      )}
                      <div>
                        <span className="font-medium text-luxury-dark block">{item.product_name}</span>
                        <span className="text-stone-500 font-mono text-[11px]">
                          {formatPrice(item.unit_price)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-luxury-gold font-bold">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-stone-50 rounded-lg border border-luxury-border space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-mono text-luxury-dark">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-luxury-dark">
                    {selectedOrder.shipping_charge === 0 ? 'Free' : formatPrice(selectedOrder.shipping_charge)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-luxury-dark pt-2 border-t border-luxury-border">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-luxury-gold font-bold text-base">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Razorpay Gateway Verification Data */}
            <div className="p-3 rounded bg-stone-100 border border-luxury-border text-[11px] text-stone-600 space-y-1 font-mono">
              <span className="text-luxury-gold block uppercase font-sans font-medium">
                Payment Verification Coordinates
              </span>
              <p>Razorpay Order: {selectedOrder.razorpay_order_id || 'Mock Verified'}</p>
              <p>Razorpay Payment: {selectedOrder.razorpay_payment_id || 'Verified'}</p>
              <p>Payment Method: Online Prepaid (Razorpay)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
