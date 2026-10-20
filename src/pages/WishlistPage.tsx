import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-black">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Your Curated Vault
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black mt-1 font-medium">
          Saved Fragrances
        </h1>
        <p className="text-xs text-neutral-500 font-light mt-1">
          {wishlist.length} {wishlist.length === 1 ? 'fragrance' : 'fragrances'} in your wishlist
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-black">
            <Heart className="w-7 h-7 opacity-70" />
          </div>
          <h2 className="font-serif text-2xl text-black">Your wishlist is currently empty</h2>
          <p className="text-xs text-neutral-500 font-light">
            Bookmark your favorite fragrances while exploring our artisanal collection.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-neutral-800 transition-colors mt-2 shadow-sm"
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
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-neutral-600 hover:text-black transition-colors shadow-sm border border-neutral-200"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 bg-white">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
                      {product.category_name || 'Haute Parfumerie'}
                    </span>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-serif text-base text-black hover:text-neutral-600 transition-colors truncate font-medium">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                    <span className="font-mono text-sm font-semibold text-black">
                      {formatPrice(currentPrice)}
                    </span>
                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stock_quantity <= 0}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-colors ${
                        product.stock_quantity <= 0
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                          : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
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
