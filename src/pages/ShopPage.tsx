import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Sparkles, Check } from 'lucide-react';
import { ProductCard, inspiredByMap } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Product, Category } from '../types';
import { dbService } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { formatPrice } = useSettings();

  const currentCategory = searchParams.get('category') || 'all';
  const currentFilter = searchParams.get('filter') || 'all';
  const currentSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('search') || '';
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodList, catList] = await Promise.all([
          dbService.getProducts(),
          dbService.getCategories(),
        ]);
        setProducts(prodList.filter((p) => p.is_active));
        setCategories(catList.filter((c) => c.is_active));
      } catch (err) {
        console.error('Error fetching shop data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setMaxPrice(5000);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (currentCategory !== 'all') {
        const cat = categories.find((c) => c.slug === currentCategory);
        if (cat && p.category_id !== cat.id && p.category_name?.toLowerCase() !== cat.name.toLowerCase()) {
          return false;
        }
      }

      if (currentFilter === 'bestseller' && !p.is_bestseller) return false;
      if (currentFilter === 'new' && !p.is_new_arrival) return false;
      if (currentFilter === 'featured' && !p.is_featured) return false;

      const activePrice = p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.price;
      if (activePrice > maxPrice) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = (p.category_name || '').toLowerCase().includes(q);
        const matchesInspired =
          (p.inspired_by || '').toLowerCase().includes(q) ||
          (p.name in inspiredByMap && inspiredByMap[p.name].toLowerCase().includes(q));
        const matchesNotes =
          (p.top_notes || '').toLowerCase().includes(q) ||
          (p.heart_notes || '').toLowerCase().includes(q) ||
          (p.base_notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesInspired && !matchesNotes) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.sale_price !== null && a.sale_price !== undefined ? a.sale_price : a.price;
      const priceB = b.sale_price !== null && b.sale_price !== undefined ? b.sale_price : b.price;

      if (currentSort === 'price-low') return priceA - priceB;
      if (currentSort === 'price-high') return priceB - priceA;
      if (currentSort === 'newest') return (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0);
      if (currentSort === 'bestseller') return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, categories, currentCategory, currentFilter, currentSort, searchQuery, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-black">
      {/* Page Title & Breadcrumbs */}
      <div className="border-b border-neutral-200 pb-8 mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Online Boutique
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-black mt-1 font-medium">
          Fragrance Collection
        </h1>
        <p className="text-sm text-neutral-600 font-light mt-2 max-w-xl">
          Explore handcrafted perfumes, rare attars, and pure aged oud distillations curated for timeless sophistication.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-sm text-xs uppercase tracking-wider text-black hover:border-black shadow-sm transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-black" />
            <span>Filters</span>
          </button>

          {/* Active Search Badge */}
          {searchQuery && (
            <div className="flex items-center space-x-2 bg-neutral-100 text-black px-3 py-1.5 rounded-sm text-xs border border-neutral-300 font-medium">
              <span>Search: "{searchQuery}"</span>
              <button onClick={() => updateParam('search', '')}>
                <X className="w-3.5 h-3.5 hover:text-neutral-600" />
              </button>
            </div>
          )}

          <span className="text-xs text-neutral-500 font-light hidden sm:inline-block">
            Showing <span className="text-black font-mono font-medium">{filteredProducts.length}</span> fragrances
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <span className="text-xs uppercase tracking-wider text-neutral-600 font-medium">Sort By:</span>
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-white border border-neutral-300 text-black text-xs rounded-sm px-3 py-2 focus:outline-none focus:border-black shadow-sm"
          >
            <option value="featured">Featured First</option>
            <option value="bestseller">Curated Bestsellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block space-y-8 pr-6 border-r border-neutral-200">
          {(currentCategory !== 'all' || currentFilter !== 'all' || searchQuery || maxPrice < 5000) && (
            <div className="pb-4 border-b border-neutral-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Active Filters</span>
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-black hover:underline font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Special Collections */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-black">Collections</h3>
            <div className="space-y-1">
              {[
                { label: 'All Fragrances', value: 'all' },
                { label: 'Bestsellers', value: 'bestseller' },
                { label: 'New Arrivals', value: 'new' },
                { label: 'Featured Picks', value: 'featured' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => updateParam('filter', item.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    currentFilter === item.value
                      ? 'bg-black text-white font-semibold'
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {currentFilter === item.value && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3 pt-6 border-t border-neutral-200">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-black">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  currentCategory === 'all'
                    ? 'bg-black text-white font-semibold'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <span>All Categories</span>
                {currentCategory === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    currentCategory === cat.slug
                      ? 'bg-black text-white font-semibold'
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  {currentCategory === cat.slug && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-6 border-t border-neutral-200">
            <div className="flex justify-between items-center text-xs text-black">
              <span className="uppercase tracking-[0.2em] font-semibold">Max Price</span>
              <span className="font-mono text-black font-bold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
              <span>₹1,000</span>
              <span>₹5,000</span>
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID SECTION */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-neutral-200 rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 shadow-sm">
              <Sparkles className="w-10 h-10 text-black mx-auto opacity-70" />
              <h3 className="font-serif text-2xl text-black">No fragrances match your selection</h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto font-light">
                Try loosening your filters, adjusting the price threshold, or clearing the search query.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-white border-r border-neutral-200 p-6 flex flex-col justify-between overflow-y-auto text-black">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                  <h3 className="font-serif text-lg text-black font-medium">Filter Fragrances</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-neutral-500 hover:text-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-neutral-600 font-semibold">Collections</span>
                  <div className="space-y-1">
                    {[
                      { label: 'All Fragrances', value: 'all' },
                      { label: 'Bestsellers', value: 'bestseller' },
                      { label: 'New Arrivals', value: 'new' },
                      { label: 'Featured Picks', value: 'featured' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => updateParam('filter', item.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                          currentFilter === item.value
                            ? 'bg-black text-white font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-200">
                  <span className="text-xs uppercase tracking-wider text-neutral-600 font-semibold">Categories</span>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateParam('category', 'all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                        currentCategory === 'all'
                          ? 'bg-black text-white font-semibold'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateParam('category', cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                          currentCategory === cat.slug
                            ? 'bg-black text-white font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-200">
                  <div className="flex justify-between text-xs text-black">
                    <span className="font-semibold">Max Price</span>
                    <span className="font-mono text-black font-bold">{formatPrice(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-black"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200 space-y-3">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-bold rounded-lg shadow-sm transition-colors"
                >
                  Show {filteredProducts.length} Fragrances
                </button>
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 text-xs text-neutral-600 hover:text-black font-medium transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
