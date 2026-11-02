import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { dbService } from '../lib/supabase';
import { EcommerceProductPage } from '../components/ui/EcommerceProductPage';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        const currentProd = await dbService.getProductBySlug(slug);
        setProduct(currentProd);

        if (currentProd) {
          const allProds = await dbService.getProducts();
          const related = allProds
            .filter(
              (p) =>
                p.id !== currentProd.id &&
                p.category_id === currentProd.category_id &&
                p.is_active
            )
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-mono">
            Unveiling Fragrance...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4 bg-white">
        <h2 className="font-serif text-3xl text-black">Fragrance Not Found</h2>
        <p className="text-neutral-500 font-light text-sm">
          The requested perfume may be retired or currently unavailable.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-4 px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-none hover:bg-neutral-800 transition-colors shadow-sm"
        >
          Explore All Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <EcommerceProductPage product={product} relatedProducts={relatedProducts} />
    </div>
  );
};
