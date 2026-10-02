import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { dbService } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const all = await dbService.getProducts();
        setProducts(all.filter((p) => p.is_active));
      } catch (e) {
        console.warn('Could not load products for search:', e);
      }
    };
    if (isOpen) {
      loadProducts();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const q = query.toLowerCase().trim();
    const filtered = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const catMatch = (p.category_name || '').toLowerCase().includes(q);
      const familyMatch = (p.fragrance_family || '').toLowerCase().includes(q);
      const notesMatch =
        (p.top_notes || '').toLowerCase().includes(q) ||
        (p.heart_notes || '').toLowerCase().includes(q) ||
        (p.base_notes || '').toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);

      return nameMatch || catMatch || familyMatch || notesMatch || descMatch;
    });

    setResults(filtered);
    setLoading(false);
  }, [query, products]);

  if (!isOpen) return null;

  const quickPicks = ['Oud', 'Amber', 'Sandalwood', 'Attar', 'Taif Rose', 'Saffron'];

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleQuickPick = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6]/98 backdrop-blur-xl flex flex-col animate-fade-in text-[#141414]">
      {/* Top Search Header */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-6 pb-4 flex items-center justify-between border-b border-[#EAE5DC]">
        <div className="flex-1 flex items-center space-x-3">
          <Search className="w-5 h-5 text-[#B8860B]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by fragrance name, notes (Oud, Rose, Amber), or collection..."
            className="w-full bg-transparent text-[#141414] placeholder-[#888888] text-lg sm:text-xl font-light focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#666666] hover:text-[#141414]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-2 text-[#555555] hover:text-[#141414] border border-[#EAE5DC] rounded-full hover:border-[#B8860B] transition-colors bg-white shadow-sm"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto px-4 py-8 flex-1 overflow-y-auto">
        {!query.trim() ? (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#777777] mb-3 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Popular Fragrance Searches</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPicks.map((pick) => (
                  <button
                    key={pick}
                    onClick={() => handleQuickPick(pick)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-light bg-white border border-[#EAE5DC] text-[#444444] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors shadow-sm"
                  >
                    {pick}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE5DC]">
              <p className="text-xs uppercase tracking-widest text-[#777777] mb-3">
                Featured Recommendations
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item.slug)}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-[#EAE5DC] hover:border-[#B8860B] cursor-pointer group transition-all shadow-card"
                  >
                    <img
                      src={item.images[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded bg-[#F5F2EB] flex-shrink-0 border border-[#EAE5DC]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#141414] group-hover:text-[#B8860B] truncate transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#777777] truncate">{item.fragrance_family || item.category_name}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#B8860B]">
                      {formatPrice(item.sale_price || item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs uppercase tracking-widest text-[#666666]">
                {results.length} {results.length === 1 ? 'fragrance found' : 'fragrances found'}
              </p>
              {results.length > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/shop?search=${encodeURIComponent(query)}`);
                  }}
                  className="text-xs text-[#B8860B] hover:underline flex items-center space-x-1 font-medium"
                >
                  <span>View in full shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-lg font-serif text-[#141414]">No fragrances matched "{query}"</p>
                <p className="text-xs text-[#777777] max-w-md mx-auto">
                  Try searching for notes like "Oud", "Amber", "Rose", or check our bestsellers in the shop.
                </p>
                <button
                  onClick={() => {
                    setQuery('');
                    navigate('/shop');
                    onClose();
                  }}
                  className="mt-4 px-5 py-2 text-xs uppercase tracking-widest bg-[#B8860B] text-white font-semibold rounded hover:bg-[#9E7307] transition-colors shadow-sm"
                >
                  Browse Full Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="group bg-white border border-[#EAE5DC] hover:border-[#B8860B] rounded-xl p-3 cursor-pointer transition-all duration-300 flex flex-col shadow-card hover:shadow-luxury"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#F5F2EB]">
                      <img
                        src={product.images[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.is_bestseller && (
                        <span className="absolute top-2 left-2 bg-[#B8860B] text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#777777] block mb-1">
                      {product.category_name || 'Haute Parfumerie'}
                    </span>
                    <h4 className="font-serif text-base text-[#141414] group-hover:text-[#B8860B] transition-colors truncate font-medium">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#666666] line-clamp-1 mb-2 font-light">
                      {product.top_notes ? `Notes: ${product.top_notes}` : product.description}
                    </p>
                    <div className="mt-auto pt-2 border-t border-[#EAE5DC] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-[#B8860B] font-mono">
                          {formatPrice(product.sale_price || product.price)}
                        </span>
                        {product.sale_price && (
                          <span className="text-xs text-[#999999] line-through font-mono">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#666666] group-hover:text-[#B8860B] flex items-center space-x-1 font-medium">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
