import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Upload, FolderTree, AlertCircle, CheckCircle } from 'lucide-react';
import { dbService } from '../lib/supabase';
import { Category, Product } from '../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });

  const loadData = async () => {
    try {
      const [catList, prodList] = await Promise.all([
        dbService.getCategories(),
        dbService.getProducts(),
      ]);
      setCategories(catList);
      setProducts(prodList);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      display_order: categories.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order,
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingCategory
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await dbService.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: url }));
      showNotification('success', 'Category image uploaded');
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await dbService.saveCategory({
        id: editingCategory?.id,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim(),
        display_order: Number(formData.display_order),
        is_active: formData.is_active,
      });

      await loadData();
      setIsModalOpen(false);
      showNotification('success', `Category "${formData.name}" saved!`);
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const count = products.filter((p) => p.category_id === cat.id).length;
    const msg = count > 0
      ? `This category contains ${count} fragrances. Deleting will unassign them. Proceed?`
      : `Delete category "${cat.name}"?`;

    if (window.confirm(msg)) {
      try {
        await dbService.deleteCategory(cat.id);
        await loadData();
        showNotification('success', `Category "${cat.name}" deleted.`);
      } catch (err: any) {
        showNotification('error', err.message);
      }
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await dbService.saveCategory({ ...cat, is_active: !cat.is_active });
      await loadData();
      showNotification('success', `Updated ${cat.name} visibility.`);
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  return (
    <div className="space-y-6">
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
            Taxonomy
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-dark mt-1">
            Fragrance Categories
          </h1>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Organize fragrances into collections such as Eau de Parfum, Attars, Pure Oud, and Gift Sets.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-luxury-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FolderTree className="w-10 h-10 text-luxury-gold mx-auto opacity-70" />
            <p className="font-serif text-lg text-luxury-dark">No categories created yet</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-luxury-gold text-white text-xs uppercase tracking-wider font-semibold rounded"
            >
              Add First Category
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-luxury-border text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Assigned Products</th>
                <th className="py-3 px-4">Display Order</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border font-light">
              {categories.map((c) => {
                const productCount = products.filter(
                  (p) => p.category_id === c.id || p.category_name?.toLowerCase() === c.name.toLowerCase()
                ).length;

                return (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded bg-stone-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-luxury-gold">
                          <FolderTree className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-serif text-sm font-medium text-luxury-dark block">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-stone-500 line-clamp-1">
                          {c.description || 'No description provided'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-stone-400">{c.slug}</td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-luxury-gold font-medium">
                        {productCount} fragrances
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-stone-600">{c.display_order}</td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`w-7 h-4 rounded-full transition-colors relative inline-flex items-center ${
                          c.is_active ? 'bg-emerald-600' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full bg-white transition-transform ${
                            c.is_active ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-stone-400 hover:text-luxury-gold transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-white border border-luxury-border rounded-2xl max-w-lg w-full p-6 space-y-5 text-luxury-dark shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-luxury-border pb-3">
              <h2 className="font-serif text-xl text-luxury-dark">
                {editingCategory ? `Edit "${editingCategory.name}"` : 'New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-luxury-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Pure Oud Collection, Artisanal Attars"
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="pure-oud-collection"
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Atmospheric summary of this fragrance collection..."
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none"
                />
              </div>

              {/* Image Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase tracking-wider text-stone-600 font-medium">
                    Category Cover Image
                  </label>
                  <label className="cursor-pointer text-[11px] text-luxury-gold hover:underline flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-stone-50 border border-luxury-border focus:border-luxury-gold rounded px-3 py-2 text-xs text-luxury-dark focus:outline-none font-mono text-[11px]"
                />
                {formData.image_url && (
                  <div className="w-full h-24 rounded overflow-hidden border border-luxury-border bg-stone-100">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  <span>Category Active</span>
                </label>
              </div>

              <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-stone-100 border border-luxury-border text-xs text-stone-600 hover:text-luxury-dark hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-luxury-gold hover:bg-luxury-goldHover text-white text-xs uppercase tracking-widest font-semibold shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
