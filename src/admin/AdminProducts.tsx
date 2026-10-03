import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Upload,
  X,
  Check,
  Star,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Eye,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { dbService } from '../lib/supabase';
import { Product, Category, ProductImage } from '../types';
import { useSettings } from '../context/SettingsContext';

export const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    inspired_by: '',
    slug: '',
    category_id: '',
    price: '',
    sale_price: '',
    volume_ml: 50,
    stock_quantity: 20,
    sku: '',
    description: '',
    fragrance_family: '',
    top_notes: '',
    heart_notes: '',
    base_notes: '',
    is_bestseller: false,
    is_new_arrival: false,
    is_featured: false,
    is_active: true,
  });

  const [formImages, setFormImages] = useState<ProductImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { formatPrice } = useSettings();

  const loadData = async () => {
    try {
      const [prodList, catList] = await Promise.all([
        dbService.getProducts(),
        dbService.getCategories(),
      ]);
      setProducts(prodList);
      setCategories(catList);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check if ?action=new is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      inspired_by: '',
      slug: '',
      category_id: categories[0]?.id || '',
      price: '',
      sale_price: '',
      volume_ml: 50,
      stock_quantity: 25,
      sku: `ALZ-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      fragrance_family: '',
      top_notes: '',
      heart_notes: '',
      base_notes: '',
      is_bestseller: false,
      is_new_arrival: true,
      is_featured: false,
      is_active: true,
    });
    setFormImages([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      inspired_by: product.inspired_by || '',
      slug: product.slug,
      category_id: product.category_id,
      price: product.price.toString(),
      sale_price: product.sale_price !== null && product.sale_price !== undefined ? product.sale_price.toString() : '',
      volume_ml: product.volume_ml,
      stock_quantity: product.stock_quantity,
      sku: product.sku,
      description: product.description,
      fragrance_family: product.fragrance_family || '',
      top_notes: product.top_notes || '',
      heart_notes: product.heart_notes || '',
      base_notes: product.base_notes || '',
      is_bestseller: product.is_bestseller,
      is_new_arrival: product.is_new_arrival,
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setFormImages(product.images || []);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => {
      // Auto-generate slug if editing product is not set or slug was unmodified
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return {
        ...prev,
        name: val,
        slug: !editingProduct ? autoSlug : prev.slug,
      };
    });
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newImages: ProductImage[] = [...formImages];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await dbService.uploadImage(file);
        newImages.push({
          id: `img-${Date.now()}-${i}`,
          image_url: imageUrl,
          alt_text: file.name,
          display_order: newImages.length + 1,
          is_primary: newImages.length === 0,
        });
      }

      setFormImages(newImages);
      showNotification('success', 'Images uploaded and attached.');
    } catch (err: any) {
      showNotification('error', `Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index: number) => {
    setFormImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setFormImages((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Fragrance name is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.description.trim()) errors.description = 'Fragrance description is required';

    // Auto-generate slug if omitted
    if (!formData.slug.trim()) {
      formData.slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      showNotification('error', firstError);
    }
    return isValid;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === formData.category_id);

      // Ensure at least one product image is attached; if none uploaded, use luxury placeholder
      const imagesToSave: ProductImage[] =
        formImages.length > 0
          ? formImages
          : [
              {
                id: `img-${Date.now()}`,
                image_url:
                  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
                alt_text: formData.name.trim() || 'Aleez Fragrance',
                display_order: 1,
                is_primary: true,
              },
            ];

      const productPayload: Partial<Product> = {
        id: editingProduct?.id,
        name: formData.name.trim(),
        inspired_by: formData.inspired_by.trim(),
        slug: formData.slug.trim(),
        category_id: formData.category_id,
        category_name: selectedCat?.name || 'Fragrance',
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        volume_ml: Number(formData.volume_ml),
        stock_quantity: Number(formData.stock_quantity),
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        fragrance_family: formData.fragrance_family.trim(),
        top_notes: formData.top_notes.trim(),
        heart_notes: formData.heart_notes.trim(),
        base_notes: formData.base_notes.trim(),
        is_bestseller: formData.is_bestseller,
        is_new_arrival: formData.is_new_arrival,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        images: imagesToSave,
      };

      await dbService.saveProduct(productPayload);
      await loadData();
      setIsModalOpen(false);
      showNotification('success', `Fragrance "${formData.name}" saved and live in store!`);
    } catch (err: any) {
      console.error('Save product error:', err);
      showNotification('error', `Failed to save product: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
      try {
        await dbService.deleteProduct(product.id);
        await loadData();
        showNotification('success', `"${product.name}" removed from boutique.`);
      } catch (err: any) {
        showNotification('error', err.message);
      }
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const dup = await dbService.duplicateProduct(product.id);
      await loadData();
      showNotification('success', `Duplicated "${product.name}". Edit and enable when ready.`);
      openEditModal(dup);
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleToggleStatus = async (product: Product, field: 'is_active' | 'is_bestseller' | 'is_new_arrival' | 'is_featured') => {
    try {
      const updated = { ...product, [field]: !product[field] };
      await dbService.saveProduct(updated);
      await loadData();
      showNotification('success', `Updated ${product.name} ${field.replace('is_', '')}.`);
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.top_notes || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 text-xs font-medium border animate-slide-up ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border-red-800 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-luxury-border gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium">
            Catalogue
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1">
            Fragrance Management
          </h1>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Add, modify, and manage luxury perfume inventory without touching code.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fragrance</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-luxury-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by fragrance name, SKU, or notes..."
            className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded pl-9 pr-3 py-2 text-xs text-luxury-dark focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-stone-50 border border-luxury-border text-luxury-dark text-xs rounded px-3 py-2 focus:outline-none focus:border-luxury-gold w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-luxury-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="font-serif text-lg text-stone-600">No fragrances found</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-luxury-gold text-white text-xs uppercase tracking-wider font-semibold rounded"
            >
              Add First Fragrance
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-luxury-border text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fragrance</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-center">Active</th>
                  <th className="py-3 px-4 text-center">Bestseller</th>
                  <th className="py-3 px-4 text-center">New</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border font-light">
                {filteredProducts.map((p) => {
                  const primaryImg =
                    p.images[0]?.image_url ||
                    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80';

                  return (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img
                          src={primaryImg}
                          alt=""
                          className="w-10 h-10 object-cover rounded bg-stone-100 flex-shrink-0"
                        />
                        <div>
                          <span className="font-serif text-sm font-medium text-luxury-dark block">
                            {p.name}
                          </span>
                          {p.inspired_by && (
                            <span className="text-[10px] text-[#A08040] block font-medium">
                              {p.inspired_by.toLowerCase().startsWith('inspired by') ? p.inspired_by : `Inspired by ${p.inspired_by}`}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400 font-mono">{p.sku}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-600">
                        {p.category_name || 'Unassigned'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-luxury-gold block">
                          {formatPrice(p.sale_price || p.price)}
                        </span>
                        {p.sale_price && (
                          <span className="font-mono text-[10px] text-stone-400 line-through">
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-medium px-2 py-0.5 rounded text-[11px] ${
                            p.stock_quantity <= 5
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'text-stone-700'
                          }`}
                        >
                          {p.stock_quantity}
                        </span>
                      </td>

                      {/* Active Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p, 'is_active')}
                          className={`w-7 h-4 rounded-full transition-colors relative inline-flex items-center ${
                            p.is_active ? 'bg-emerald-600' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full bg-white transition-transform ${
                              p.is_active ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Bestseller Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p, 'is_bestseller')}
                          className={`p-1 rounded ${p.is_bestseller ? 'text-luxury-gold' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Star className={`w-4 h-4 ${p.is_bestseller ? 'fill-luxury-gold' : ''}`} />
                        </button>
                      </td>

                      {/* New Arrival Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p, 'is_new_arrival')}
                          className={`p-1 rounded ${p.is_new_arrival ? 'text-luxury-gold' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-stone-400 hover:text-luxury-gold transition-colors"
                          title="Edit Fragrance"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(p)}
                          className="p-1.5 text-stone-400 hover:text-blue-600 transition-colors"
                          title="Duplicate Fragrance"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete Fragrance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div
            className="bg-white border border-luxury-border rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 text-luxury-dark max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-luxury-border pb-4">
              <h2 className="font-serif text-2xl text-luxury-dark">
                {editingProduct ? `Edit "${editingProduct.name}"` : 'Create New Fragrance'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-luxury-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Product Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Fragrance Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Royal Amber Royale"
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    URL Slug * (SEO-friendly)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="royal-amber-royale"
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                  />
                  {formErrors.slug && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.slug}</p>
                  )}
                </div>
              </div>

              {/* Inspired By Field */}
              <div className="bg-[#FAF7F2] p-3.5 rounded-lg border border-[#E8DFD0]">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs uppercase tracking-wider text-[#7A5B10] font-semibold">
                    Inspired By / Designer Impression (Optional)
                  </label>
                  <span className="text-[10px] text-[#A08040] bg-[#F3ECE0] px-2 py-0.5 rounded-full font-medium">
                    Displayed on product badges &amp; search
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.inspired_by}
                  onChange={(e) => setFormData({ ...formData, inspired_by: e.target.value })}
                  placeholder="e.g. Creed Aventus, Baccarat Rouge 540, Tom Ford Tuscan Leather"
                  className="w-full bg-white border border-[#E0D7C6] focus:border-[#B8860B] rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Enter the designer inspiration (e.g. <em>Creed Aventus</em> or <em>Baccarat Rouge 540</em>). Shoplisters will see an &quot;Inspired by&quot; luxury badge on the card and detail page, and can search for this name in the shop catalog.
                </p>
              </div>

              {/* Category, SKU, Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="ALZ-RAR-050"
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Volume (ML)
                  </label>
                  <input
                    type="number"
                    value={formData.volume_ml}
                    onChange={(e) => setFormData({ ...formData, volume_ml: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Price, Sale Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Regular Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2499"
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                  />
                  {formErrors.price && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Sale Price (₹ INR, Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="1999"
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Available Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Olfactory Pyramid & Fragrance Family */}
              <div className="p-4 bg-stone-50 rounded-lg border border-luxury-border space-y-4">
                <span className="text-xs uppercase tracking-wider text-luxury-gold font-medium block">
                  Olfactory Notes & Accord Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                      Fragrance Family
                    </label>
                    <input
                      type="text"
                      value={formData.fragrance_family}
                      onChange={(e) => setFormData({ ...formData, fragrance_family: e.target.value })}
                      placeholder="e.g. Oriental Amber Woody, Floral Fresh"
                      className="w-full bg-white border border-luxury-border rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                      Top Notes
                    </label>
                    <input
                      type="text"
                      value={formData.top_notes}
                      onChange={(e) => setFormData({ ...formData, top_notes: e.target.value })}
                      placeholder="e.g. Calabrian Bergamot, Cardamom"
                      className="w-full bg-white border border-luxury-border rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                      Heart Notes
                    </label>
                    <input
                      type="text"
                      value={formData.heart_notes}
                      onChange={(e) => setFormData({ ...formData, heart_notes: e.target.value })}
                      placeholder="e.g. Damask Rose, Golden Amber"
                      className="w-full bg-white border border-luxury-border rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                      Base Notes
                    </label>
                    <input
                      type="text"
                      value={formData.base_notes}
                      onChange={(e) => setFormData({ ...formData, base_notes: e.target.value })}
                      placeholder="e.g. Aged Agarwood, Mysore Sandalwood, Vanilla"
                      className="w-full bg-white border border-luxury-border rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed narrative describing the fragrance profile, sillage, and character..."
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                />
                {formErrors.description && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Product Images Uploader */}
              <div className="p-4 bg-stone-50 rounded-lg border border-luxury-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider text-luxury-gold font-medium">
                    Product Imagery ({formImages.length})
                  </span>
                  <label className="cursor-pointer px-3 py-1.5 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 hover:bg-luxury-gold hover:text-white rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingImage && (
                  <div className="flex items-center space-x-2 text-xs text-luxury-gold">
                    <div className="w-3 h-3 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
                    <span>Processing & uploading image files...</span>
                  </div>
                )}

                {formErrors.images && (
                  <p className="text-xs text-red-500">{formErrors.images}</p>
                )}

                {/* Previews and reordering */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formImages.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-stone-100 group ${
                          img.is_primary ? 'border-luxury-gold' : 'border-luxury-border'
                        }`}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />

                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-luxury-gold text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow">
                            Primary
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="space-x-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 'up')}
                                  className="p-1 bg-black/80 text-white rounded hover:text-luxury-gold"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                              )}
                              {idx < formImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 'down')}
                                  className="p-1 bg-black/80 text-white rounded hover:text-luxury-gold"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {!img.is_primary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(idx)}
                                className="text-[10px] uppercase font-semibold text-luxury-gold hover:underline"
                              >
                                Set Primary
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  <span>Publish Active</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  <span>Mark Bestseller</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  <span>Featured Home</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded bg-stone-100 border border-luxury-border text-xs uppercase tracking-wider text-stone-600 hover:text-luxury-dark hover:bg-stone-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || uploadingImage}
                  className="px-6 py-2.5 rounded bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-widest font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {isSaving
                      ? 'Saving Fragrance...'
                      : editingProduct
                      ? 'Save Changes'
                      : 'Publish Fragrance'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
