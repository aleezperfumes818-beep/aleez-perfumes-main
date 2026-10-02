import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#141414]">
      <div className="border-b border-[#EAE5DC] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
          Your Curated Vault
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141414] mt-1 font-medium">
          Saved Fragrances
        </h1>
        <p className="text-xs text-[#777777] font-light mt-1">
          {wishlist.length} {wishlist.length === 1 ? 'fragrance' : 'fragrances'} in your wishlist
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#EAE5DC] p-8 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#EAE5DC] flex items-center justify-center mx-auto text-[#B8860B]">
            <Heart className="w-7 h-7 opacity-70" />
          </div>
          <h2 className="font-serif text-2xl text-[#141414]">Your wishlist is currently empty</h2>
          <p className="text-xs text-[#666666] font-light">
            Bookmark your favorite fragrances while exploring our artisanal collection.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 bg-[#B8860B] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#9E7307] transition-colors mt-2 shadow-sm"
          >
            Explore Fragrances
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const currentPrice =
              product.sale_price !== null && product.sale_price !== undefined
                ? product.sale_price
                : product.price;

            const primaryImage =
              product.images && product.images.length > 0
                ? product.images[0].image_url
                : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={product.id}
                className="bg-white border border-[#EAE5DC] rounded-xl overflow-hidden flex flex-col justify-between group shadow-card hover:shadow-luxury transition-all"
              >
                <div className="relative aspect-[4/5] bg-[#F7F5F0] overflow-hidden">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#666666] hover:text-red-600 transition-colors shadow-sm border border-[#EAE5DC]"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 bg-white">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#777777] block">
                      {product.category_name || 'Haute Parfumerie'}
                    </span>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-serif text-base text-[#141414] group-hover:text-[#B8860B] transition-colors truncate font-medium">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE5DC]">
                    <span className="font-mono text-sm font-semibold text-[#B8860B]">
                      {formatPrice(currentPrice)}
                    </span>
                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stock_quantity <= 0}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 ${
                        product.stock_quantity <= 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-[#B8860B] text-white hover:bg-[#9E7307] shadow-sm'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{product.stock_quantity <= 0 ? 'Sold Out' : 'Add to Bag'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
