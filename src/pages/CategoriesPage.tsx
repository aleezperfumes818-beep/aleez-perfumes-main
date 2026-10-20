import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';
import { dbService } from '../lib/supabase';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbService.getCategories().then((data) => {
      setCategories(data.filter((c) => c.is_active));
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-black">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Olfactory Archetypes
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-black font-medium">
          Fragrance Collections
        </h1>
        <p className="text-sm text-neutral-600 font-light leading-relaxed">
          From the smoky majesty of aged agarwood to delicate petal extractions and radiant amber bouquets, explore each realm of our craftsmanship.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-neutral-200 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 hover:border-black transition-all duration-500 shadow-sm flex flex-col justify-end p-6 bg-neutral-100"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="relative z-10 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-mono block font-semibold">
                  Curated Family
                </span>
                <h3 className="font-serif text-2xl text-white group-hover:text-neutral-200 transition-colors font-medium">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-neutral-300 font-light line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
                <div className="pt-2 flex items-center space-x-1.5 text-xs text-white tracking-wider uppercase font-semibold">
                  <span>Explore Fragrances</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
