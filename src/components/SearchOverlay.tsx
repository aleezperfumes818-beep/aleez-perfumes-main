import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  const quickPicks = [
    'Oud',
    'Amber',
    'Damask Rose',
    'Attar',
    'Bergamot',
    'Smoked Leather',
    'Vanilla',
  ];

  useEffect(() => {
    if (isOpen) {
      dbService.getProducts().then((data) => {
        setProducts(data.filter((p) => p.is_active));
      });
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchFamily = (p.fragrance_family || '').toLowerCase().includes(q);
      const matchCategory = (p.category_name || '').toLowerCase().includes(q);
      const matchInspired = (p.inspired_by || '').toLowerCase().includes(q);
      const matchNotes =
        (p.top_notes || '').toLowerCase().includes(q) ||
        (p.heart_notes || '').toLowerCase().includes(q) ||
        (p.base_notes || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);

      return matchName || matchFamily || matchCategory || matchInspired || matchNotes || matchDesc;
    });

    setResults(filtered.slice(0, 8));
  }, [query, products]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleQuickPick = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-xl flex flex-col animate-fade-in text-black">
      {/* Top Search Header */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-6 pb-4 flex items-center justify-between border-b border-neutral-200">
        <div className="flex-1 flex items-center space-x-3">
          <Search className="w-5 h-5 text-black" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by fragrance name, notes (Oud, Rose, Amber), or collection..."
            className="w-full bg-transparent text-black placeholder-neutral-400 text-lg sm:text-xl font-light focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-500 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-2 text-neutral-600 hover:text-black border border-neutral-200 rounded-full hover:border-black transition-colors bg-white shadow-sm"
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
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3 flex items-center space-x-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Popular Fragrance Searches</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPicks.map((pick) => (
                  <button
                    key={pick}
                    onClick={() => handleQuickPick(pick)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-light bg-white border border-neutral-200 text-neutral-700 hover:text-black hover:border-black transition-colors shadow-sm"
                  >
                    {pick}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3 font-medium">
                Featured Recommendations
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProduct(item.slug)}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-neutral-200 hover:border-black cursor-pointer group transition-all shadow-sm"
                  >
                    <img
                      src={item.images[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded bg-neutral-100 flex-shrink-0 border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-black group-hover:text-neutral-600 truncate transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate">{item.fragrance_family || item.category_name}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-black">
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
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                {results.length} {results.length === 1 ? 'fragrance found' : 'fragrances found'}
              </p>
              {results.length > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/shop?search=${encodeURIComponent(query)}`);
                  }}
                  className="text-xs text-black hover:underline flex items-center space-x-1 font-medium"
                >
                  <span>View in full shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-lg font-serif text-black">No fragrances matched "{query}"</p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Try searching for notes like "Oud", "Amber", "Rose", or check our bestsellers in the shop.
                </p>
                <button
                  onClick={() => {
                    setQuery('');
                    navigate('/shop');
                    onClose();
                  }}
                  className="mt-4 px-5 py-2 text-xs uppercase tracking-widest bg-black text-white font-semibold rounded hover:bg-neutral-800 transition-colors shadow-sm"
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
                    className="group bg-white border border-neutral-200 hover:border-black rounded-xl p-3 cursor-pointer transition-all duration-300 flex flex-col shadow-sm"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-neutral-100">
                      <img
                        src={product.images[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.is_bestseller && (
                        <span className="absolute top-2 left-2 bg-black text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1 font-medium">
                      {product.category_name || 'Haute Parfumerie'}
                    </span>
                    <h4 className="font-serif text-base text-black group-hover:text-neutral-600 transition-colors truncate font-medium">
                      {product.name}
                    </h4>
                    <p className="text-xs text-neutral-500 line-clamp-1 mb-2 font-light">
                      {product.top_notes ? `Notes: ${product.top_notes}` : product.description}
                    </p>
                    <div className="mt-auto pt-2 border-t border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-black font-mono">
                          {formatPrice(product.sale_price || product.price)}
                        </span>
                        {product.sale_price && (
                          <span className="text-xs text-neutral-400 line-through font-mono">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-600 group-hover:text-black flex items-center space-x-1 font-medium">
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
