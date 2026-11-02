import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Save,
  CheckCircle,
  ExternalLink,
  Flame,
  Layers,
  Compass,
  ShieldCheck,
  Upload,
  RefreshCw,
  Video,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  Copy,
  Star,
  Search,
  Check,
  ArrowRight,
} from 'lucide-react';
import { dbService } from '../lib/supabase';
import { initialHomepageContent } from '../lib/initialData';
import { HomepageContent, Product } from '../types';

export const AdminHomepage: React.FC = () => {
  const [content, setContent] = useState<HomepageContent>(initialHomepageContent);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'hero' | 'spotlight' | 'specialties' | 'bestsellers' | 'bespoke' | 'pillars'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [bestsellerSearch, setBestsellerSearch] = useState('');
  const [togglingBestsellerId, setTogglingBestsellerId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [homeData, prodData] = await Promise.all([
          dbService.getHomepageContent(),
          dbService.getProducts(),
        ]);
        if (homeData) {
          setContent(homeData);
        }
        setProducts(prodData);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updated = await dbService.saveHomepageContent(content);
      setContent(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Failed to save homepage content:', err);
      alert('Could not save homepage content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to restore original storefront defaults? Any unsaved edits will be lost.')) {
      setContent(initialHomepageContent);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, cardIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(fieldKey);
    try {
      const uploadedUrl = await dbService.uploadImage(file);
      if (cardIndex !== undefined) {
        // Specialty card image
        setContent((prev) => {
          const updatedCards = [...prev.specialties.cards];
          updatedCards[cardIndex] = { ...updatedCards[cardIndex], image_url: uploadedUrl };
          return {
            ...prev,
            specialties: { ...prev.specialties, cards: updatedCards },
          };
        });
      } else if (fieldKey === 'hero_fallback') {
        setContent((prev) => ({
          ...prev,
          hero: { ...prev.hero, fallback_image_url: uploadedUrl },
        }));
      } else if (fieldKey === 'spotlight') {
        setContent((prev) => ({
          ...prev,
          spotlight: { ...prev.spotlight, custom_image_url: uploadedUrl },
        }));
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      alert('Photo upload or optimization failed: ' + (err?.message || 'Please try another photo.'));
    } finally {
      setUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleAutofillFromProduct = (p: Product) => {
    setContent((prev) => ({
      ...prev,
      spotlight: {
        ...prev.spotlight,
        product_id: p.id,
        custom_name: p.name,
        custom_inspired_by: p.inspired_by || '',
        custom_category: p.category_name || '',
        custom_description: p.description || '',
        custom_image_url: p.images?.[0]?.image_url || '',
        custom_price: p.price,
        custom_sale_price: p.sale_price,
        top_notes: p.top_notes || '',
        heart_notes: p.heart_notes || '',
        base_notes: p.base_notes || '',
      },
    }));
  };

  const handleToggleBestseller = async (product: Product) => {
    setTogglingBestsellerId(product.id);
    try {
      const updated = await dbService.saveProduct({
        ...product,
        is_bestseller: !product.is_bestseller,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      console.error('Failed to toggle bestseller status:', err);
      alert('Could not update product bestseller status.');
    } finally {
      setTogglingBestsellerId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-black animate-spin" />
          <p className="text-xs uppercase tracking-widest text-neutral-500">Loading Homepage Editor...</p>
        </div>
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === content.spotlight.product_id);

  return (
    <div className="max-w-6xl space-y-8 pb-16">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-black font-semibold">
              Storefront Customizer
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono">
              Live Production
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-black mt-1">
            Homepage Content Management
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Directly control headlines, weekly spotlight, hero video, curation cards, and custom fragrance studio.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-black border border-neutral-300 rounded-sm text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-black" />
            <span>{previewMode ? 'Exit Preview' : 'Hero Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-sm text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
            title="Reset form fields to default copy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-black border border-neutral-300 rounded-sm text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-black" />
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-sm text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="p-4 rounded-sm bg-neutral-900 border border-black text-white text-xs flex items-center space-x-2.5 animate-fade-in shadow-sm">
          <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
          <span className="font-medium">
            Homepage published successfully! All changes are now live for your customers.
          </span>
        </div>
      )}

      {/* Interactive Hero Live Preview Box (Toggled) */}
      {previewMode && (
        <div className="border border-neutral-800 rounded-sm overflow-hidden bg-black text-white p-6 sm:p-10 relative shadow-2xl animate-fade-in">
          <div className="absolute top-3 right-3 z-20 bg-neutral-900/90 backdrop-blur-md px-3 py-1 rounded-sm border border-neutral-700 text-[10px] uppercase font-mono tracking-wider text-neutral-300">
            Live Left-Aligned Hero Preview
          </div>
          <div className="max-w-3xl space-y-6 text-left py-4">
            {/* Status Chip */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-medium">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{content.hero.badge || 'Haute Parfumerie • 35% Pure Extrait'}</span>
            </div>

            {/* Left-Aligned Headline */}
            <h2 className="font-sans text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {content.hero.title_line1} <br />
              <span className="font-light text-neutral-300 block pt-1">{content.hero.title_line2}</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-neutral-300 font-normal max-w-xl leading-relaxed">
              {content.hero.subtitle}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-6 py-3 bg-white text-black text-[11px] uppercase tracking-widest font-semibold rounded-sm shadow-md">
                {content.hero.primary_btn_text}
              </span>
              <span className="px-6 py-3 bg-black/40 border border-white/40 text-white text-[11px] uppercase tracking-widest font-semibold rounded-sm">
                {content.hero.secondary_btn_text}
              </span>
            </div>

            {/* Proof Badges */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-neutral-300 text-[10px] uppercase tracking-wider font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="text-white">●</span>
                <span>100% Pure Oils</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-white">●</span>
                <span>Extrait Strength</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="text-white">●</span>
                <span>Express Delivery</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 overflow-x-auto space-x-1 scrollbar-none">
        {[
          { id: 'hero', label: '1. Hero Banner', icon: Sparkles },
          { id: 'spotlight', label: '2. Weekly Spotlight', icon: Flame },
          { id: 'specialties', label: '3. Specialties (4 Cards)', icon: Layers },
          { id: 'bestsellers', label: '4. Bestsellers Carousel', icon: Layers },
          { id: 'bespoke', label: '5. Custom Fragrance Studio', icon: Compass },
          { id: 'pillars', label: '6. Trust Pillars & Newsletter', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-neutral-500 hover:text-black hover:bg-neutral-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: HERO BANNER SECTION                                                */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="font-serif text-lg text-black font-medium">Hero Cinematic Banner</h2>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Left-aligned luxury hero section with clean typography, status chip, and full-bleed looping video background.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Status Chip / Pill */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Top Status Chip (Live Badge)
                </label>
                <input
                  type="text"
                  value={content.hero.badge || ''}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none"
                  placeholder="e.g. Haute Parfumerie • 35% Pure Extrait"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Displayed inside the floating glowing pill badge directly above the main hero headline.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                    Main Headline Line 1 (Bold Sans-Serif)
                  </label>
                  <input
                    type="text"
                    value={content.hero.title_line1}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title_line1: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none font-bold"
                    placeholder="e.g. Aleez Perfumes"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                    Headline Line 2 (Light Sans Accent)
                  </label>
                  <input
                    type="text"
                    value={content.hero.title_line2}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title_line2: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none"
                    placeholder="e.g. Rare Botanicals & Pure Extrait"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Hero Subtitle Description
                </label>
                <textarea
                  rows={3}
                  value={content.hero.subtitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none leading-relaxed"
                  placeholder="Master-formulated in limited batches using authentic botanical absolutes..."
                />
              </div>

              {/* Call-to-action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-black font-semibold">Primary Button</h3>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Button Label</label>
                    <input
                      type="text"
                      value={content.hero.primary_btn_text}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, primary_btn_text: e.target.value },
                        }))
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Target Link URL</label>
                    <input
                      type="text"
                      value={content.hero.primary_btn_link}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, primary_btn_link: e.target.value },
                        }))
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-black font-semibold">Secondary Button</h3>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Button Label</label>
                    <input
                      type="text"
                      value={content.hero.secondary_btn_text}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondary_btn_text: e.target.value },
                        }))
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Target Link URL</label>
                    <input
                      type="text"
                      value={content.hero.secondary_btn_link}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondary_btn_link: e.target.value },
                        }))
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Background Video & Fallback Poster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-black" />
                    <span>Looping Video URL / Path (.mp4)</span>
                  </label>
                  <input
                    type="text"
                    value={content.hero.video_url}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, video_url: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                    placeholder="/videos/aleez-signature.mp4 or CDN video link"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Defaults to bundled high-definition video at <code className="text-black font-semibold">/videos/aleez-signature.mp4</code>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center space-x-1.5 text-xs uppercase tracking-wider text-neutral-700 font-medium">
                      <ImageIcon className="w-3.5 h-3.5 text-black" />
                      <span>Fallback Image Poster</span>
                    </span>
                    <div className="relative inline-flex items-center">
                      <button
                        type="button"
                        disabled={uploadingImage === 'hero_fallback'}
                        className="px-2.5 py-1 text-[11px] bg-white border border-neutral-300 hover:border-black text-black rounded-sm flex items-center space-x-1 font-medium transition-colors shadow-xs"
                      >
                        {uploadingImage === 'hero_fallback' ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-black" />
                            <span>Optimizing & Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 text-black" />
                            <span>Upload Photo</span>
                          </>
                        )}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage === 'hero_fallback'}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => handleImageUpload(e, 'hero_fallback')}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={content.hero.fallback_image_url}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, fallback_image_url: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                    placeholder="https://..."
                  />
                  {uploadingImage === 'hero_fallback' && (
                    <p className="text-[11px] text-black mt-1 flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Uploading to CDN...</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WEEKLY SPOTLIGHT FRAGRANCE (FULLY EDITABLE)                        */}
        {/* ========================================================================= */}
        {activeTab === 'spotlight' && (
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h2 className="font-serif text-lg text-black font-medium">Fragrance of the Week Spotlight</h2>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  Directly customize the featured spotlight name, inspired-by tag, pricing, image, and scent notes.
                </p>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.spotlight.enabled}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, enabled: e.target.checked },
                    }))
                  }
                  className="rounded text-black focus:ring-black w-4 h-4"
                />
                <span className="text-xs uppercase tracking-wider font-semibold text-black">
                  Section Visible
                </span>
              </label>
            </div>

            {/* Section Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={content.spotlight.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, title: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                  placeholder="e.g. Fragrance of the Week"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={content.spotlight.subtitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, subtitle: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                  placeholder="Discover this week's handpicked master formulation..."
                />
              </div>
            </div>

            {/* Catalog Product Link & Autofill */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                  Link Inventory Product (Optional)
                </label>
                {selectedProduct && (
                  <button
                    type="button"
                    onClick={() => handleAutofillFromProduct(selectedProduct)}
                    className="inline-flex items-center space-x-1.5 text-xs text-black hover:underline font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Autofill Form with "{selectedProduct.name}"</span>
                  </button>
                )}
              </div>
              <select
                value={content.spotlight.product_id || ''}
                onChange={(e) => {
                  const pid = e.target.value;
                  const p = products.find((prod) => prod.id === pid);
                  setContent((prev) => ({
                    ...prev,
                    spotlight: { ...prev.spotlight, product_id: pid },
                  }));
                  if (p) {
                    handleAutofillFromProduct(p);
                  }
                }}
                className="w-full bg-white border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
              >
                <option value="">-- Choose a Product or Fill Manually Below --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.sale_price || p.price} {p.category_name ? `(${p.category_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Spotlight Customization Inputs */}
            <div className="space-y-4 pt-2 border-t border-neutral-200">
              <h3 className="text-xs uppercase tracking-wider text-black font-semibold">
                Spotlight Fragrance Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Fragrance Name</label>
                  <input
                    type="text"
                    value={content.spotlight.custom_name || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, custom_name: e.target.value },
                      }))
                    }
                    placeholder="e.g. Velvet Oud Noir"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Inspired By (e.g. Tom Ford Ombré Leather)</label>
                  <input
                    type="text"
                    value={content.spotlight.custom_inspired_by || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, custom_inspired_by: e.target.value },
                      }))
                    }
                    placeholder="e.g. Tom Ford Ombré Leather"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Category / Collection Tag</label>
                  <input
                    type="text"
                    value={content.spotlight.custom_category || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, custom_category: e.target.value },
                      }))
                    }
                    placeholder="e.g. Pure Oud Collection"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={content.spotlight.custom_price || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, custom_price: Number(e.target.value) || 0 },
                      }))
                    }
                    placeholder="1999"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Sale Price (₹)</label>
                  <input
                    type="number"
                    value={content.spotlight.custom_sale_price || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, custom_sale_price: Number(e.target.value) || 0 },
                      }))
                    }
                    placeholder="1499"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={content.spotlight.custom_description || ''}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, custom_description: e.target.value },
                    }))
                  }
                  placeholder="Master formulation description..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              {/* Spotlight Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-neutral-600 font-medium">Spotlight Bottle Photo</span>
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      disabled={uploadingImage === 'spotlight'}
                      className="px-2.5 py-1 text-[11px] bg-white border border-neutral-300 hover:border-black text-black rounded-sm flex items-center space-x-1 font-medium transition-colors shadow-xs"
                    >
                      {uploadingImage === 'spotlight' ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-black" />
                          <span>Optimizing & Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 text-black" />
                          <span>Upload Photo</span>
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage === 'spotlight'}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleImageUpload(e, 'spotlight')}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 bg-white border border-neutral-200 rounded-sm">
                  {content.spotlight.custom_image_url ? (
                    <div className="relative w-14 h-16 rounded overflow-hidden bg-neutral-100 border border-neutral-300 flex-shrink-0">
                      <img
                        src={content.spotlight.custom_image_url}
                        alt="Spotlight"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-16 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-[10px] flex-shrink-0">
                      No Photo
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5 font-mono">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={content.spotlight.custom_image_url || ''}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          spotlight: { ...prev.spotlight, custom_image_url: e.target.value },
                        }))
                      }
                      placeholder="Paste image URL or tap Upload Photo above"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-2.5 py-1 text-xs text-black focus:outline-none focus:border-black font-mono truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Scent Notes Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Top Notes</label>
                  <input
                    type="text"
                    value={content.spotlight.top_notes || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, top_notes: e.target.value },
                      }))
                    }
                    placeholder="e.g. Kashmiri Saffron, Cinnamon"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Heart Notes</label>
                  <input
                    type="text"
                    value={content.spotlight.heart_notes || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, heart_notes: e.target.value },
                      }))
                    }
                    placeholder="e.g. Damask Rose, Frankincense"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Base Notes</label>
                  <input
                    type="text"
                    value={content.spotlight.base_notes || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, base_notes: e.target.value },
                      }))
                    }
                    placeholder="e.g. Cambodian Oud, Tuscan Leather"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Badges & Button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Concentration Text</label>
                  <input
                    type="text"
                    value={content.spotlight.concentration_text || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, concentration_text: e.target.value },
                      }))
                    }
                    placeholder="e.g. 35% Extrait De Parfum"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Bottle Size Text</label>
                  <input
                    type="text"
                    value={content.spotlight.bottle_size_text || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, bottle_size_text: e.target.value },
                      }))
                    }
                    placeholder="e.g. 50 ML"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1 font-medium">Button Text</label>
                  <input
                    type="text"
                    value={content.spotlight.button_text || ''}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, button_text: e.target.value },
                      }))
                    }
                    placeholder="e.g. Add To Cart"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ATELIER SPECIALTIES (4 Cards)                                      */}
        {/* ========================================================================= */}
        {activeTab === 'specialties' && (
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-lg text-black font-medium">Atelier Specialties (4 Cards)</h2>
                  <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm border ${
                    content.specialties?.enabled
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                  }`}>
                    {content.specialties?.enabled ? 'Visible on Site' : 'Hidden from Site'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  The 4 curated signature collection cards (Pour Homme, Pour Femme, Noble Oud, Artisanal Attars).
                </p>
              </div>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-sm transition-colors">
                <input
                  type="checkbox"
                  checked={!!content.specialties?.enabled}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      specialties: { ...prev.specialties, enabled: e.target.checked },
                    }))
                  }
                  className="rounded text-black focus:ring-black w-4 h-4 cursor-pointer"
                />
                <span className="text-xs uppercase tracking-wider font-semibold text-black select-none">
                  Enable Section
                </span>
              </label>
            </div>

            {!content.specialties?.enabled && (
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs rounded-sm flex items-center justify-between">
                <span>
                  This 4-card section is currently <strong>hidden</strong> on the homepage. Toggle "Enable Section" above and click "Publish Changes" to show it.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Section Main Title
                </label>
                <input
                  type="text"
                  value={content.specialties.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      specialties: { ...prev.specialties, title: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                  placeholder="Our True Masterclass Into Handpicked Formulations"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={content.specialties.subtitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      specialties: { ...prev.specialties, subtitle: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* 4 Cards Editor */}
            <div className="space-y-6 pt-4 border-t border-neutral-200">
              <h3 className="text-xs uppercase tracking-wider text-black font-semibold">
                Specialty Cards (4 Highlight Portals)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.specialties.cards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="p-5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <span className="font-mono text-xs uppercase font-bold text-black">
                        Card #{idx + 1}
                      </span>
                      <div className="relative inline-flex items-center">
                        <button
                          type="button"
                          disabled={uploadingImage === `card_${idx}`}
                          className="px-2.5 py-1 text-[11px] bg-white border border-neutral-300 hover:border-black text-black rounded-sm flex items-center space-x-1 font-medium transition-colors shadow-xs"
                        >
                          {uploadingImage === `card_${idx}` ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-black" />
                              <span>Optimizing & Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 text-black" />
                              <span>Upload Photo</span>
                            </>
                          )}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage === `card_${idx}`}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleImageUpload(e, `card_${idx}`, idx)}
                        />
                      </div>
                    </div>

                    {/* Image Preview & URL Field */}
                    <div className="flex items-center space-x-3 p-2 bg-white border border-neutral-200 rounded-sm">
                      {card.image_url ? (
                        <div className="relative w-14 h-16 rounded overflow-hidden bg-neutral-100 border border-neutral-300 flex-shrink-0">
                          <img
                            src={card.image_url}
                            alt={card.title || `Card ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-16 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-[10px] flex-shrink-0">
                          No Photo
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5 font-mono">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={card.image_url}
                          onChange={(e) => {
                            const newCards = [...content.specialties.cards];
                            newCards[idx] = { ...newCards[idx], image_url: e.target.value };
                            setContent((prev) => ({
                              ...prev,
                              specialties: { ...prev.specialties, cards: newCards },
                            }));
                          }}
                          placeholder="Paste image URL or tap Upload Photo above"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-2.5 py-1 text-xs text-black focus:outline-none focus:border-black font-mono truncate"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">Card Title</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const newCards = [...content.specialties.cards];
                            newCards[idx] = { ...newCards[idx], title: e.target.value };
                            setContent((prev) => ({
                              ...prev,
                              specialties: { ...prev.specialties, cards: newCards },
                            }));
                          }}
                          className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-500 mb-1">Subtitle Tag</label>
                        <input
                          type="text"
                          value={card.subtitle}
                          onChange={(e) => {
                            const newCards = [...content.specialties.cards];
                            newCards[idx] = { ...newCards[idx], subtitle: e.target.value };
                            setContent((prev) => ({
                              ...prev,
                              specialties: { ...prev.specialties, cards: newCards },
                            }));
                          }}
                          className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => {
                          const newCards = [...content.specialties.cards];
                          newCards[idx] = { ...newCards[idx], description: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            specialties: { ...prev.specialties, cards: newCards },
                          }));
                        }}
                        className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">Destination URL</label>
                      <input
                        type="text"
                        value={card.link}
                        onChange={(e) => {
                          const newCards = [...content.specialties.cards];
                          newCards[idx] = { ...newCards[idx], link: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            specialties: { ...prev.specialties, cards: newCards },
                          }));
                        }}
                        className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BESTSELLERS SECTION (3D STRAIGHT-SQUARE SLIDING CAROUSEL)          */}
        {/* ========================================================================= */}
        {activeTab === 'bestsellers' && (
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif text-lg text-black font-medium">Bestsellers Carousel Section</h2>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-neutral-100 text-neutral-800 border border-neutral-300">
                    3D Straight-Square Carousel
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  Controls the section headline and manages the products displayed in the interactive straight-square carousel.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-sm text-black font-semibold">
                  {products.filter((p) => p.is_bestseller).length} Fragrances Active
                </span>
                <Link
                  to="/admin/products"
                  className="text-xs bg-black text-white px-3 py-1.5 rounded-sm hover:bg-neutral-800 transition-colors uppercase tracking-wider font-semibold flex items-center space-x-1"
                >
                  <span>All Products</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Section Heading Title
                </label>
                <input
                  type="text"
                  value={content.bestsellers_section.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bestsellers_section: { ...prev.bestsellers_section, title: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black font-serif text-base"
                  placeholder="Brand Inspirations & Bestsellers"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  CTA Link Text
                </label>
                <input
                  type="text"
                  value={content.bestsellers_section.cta_text}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bestsellers_section: { ...prev.bestsellers_section, cta_text: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                  placeholder="View All Inspirations"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                Section Subtitle
              </label>
              <input
                type="text"
                value={content.bestsellers_section.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    bestsellers_section: { ...prev.bestsellers_section, subtitle: e.target.value },
                  }))
                }
                className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                placeholder="Handcrafted interpretations inspired by the world's most prestigious perfume houses."
              />
            </div>

            {/* Live Straight-Square Carousel Preview Cards */}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-black font-semibold">
                    Live Carousel Cards Preview
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-light">
                    These items are displayed in the straight-square sliding cards with soft elevation shadows.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  Showing {products.filter((p) => p.is_bestseller).length} active items
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
                {products
                  .filter((p) => p.is_bestseller)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-neutral-100 rounded-none shadow-[0_10px_25px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col group relative"
                    >
                      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                        <img
                          src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80'}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-black text-white text-[9px] uppercase font-bold px-1.5 py-0.5 tracking-wider">
                          Bestseller
                        </span>
                        <div className="absolute bottom-1.5 right-1.5 bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold text-black border border-neutral-200 flex items-center space-x-0.5">
                          <Star className="w-2.5 h-2.5 fill-black text-black" />
                          <span>{p.rating || 4.9}</span>
                        </div>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                        <div>
                          <h4 className="font-serif text-xs text-black font-medium truncate" title={p.name}>
                            {p.name}
                          </h4>
                          {p.inspired_by && (
                            <p className="text-[10px] text-neutral-500 italic truncate" title={p.inspired_by}>
                              {p.inspired_by}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-semibold text-xs text-black">
                            ₹{p.sale_price || p.price}
                          </span>
                          <button
                            type="button"
                            disabled={togglingBestsellerId === p.id}
                            onClick={() => handleToggleBestseller(p)}
                            title="Remove from Carousel"
                            className="text-[10px] text-neutral-500 hover:text-black hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Product Carousel Manager (1-Click Toggle for Catalog) */}
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-black font-semibold">
                    Curate Products for Carousel
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-light">
                    Click the toggle to immediately add or remove fragrances from the homepage bestsellers carousel.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={bestsellerSearch}
                    onChange={(e) => setBestsellerSearch(e.target.value)}
                    placeholder="Search fragrance name..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm pl-8 pr-3 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="border border-neutral-200 rounded-sm overflow-hidden divide-y divide-neutral-100 max-h-96 overflow-y-auto">
                {products
                  .filter((p) => {
                    if (!bestsellerSearch) return true;
                    const query = bestsellerSearch.toLowerCase();
                    return (
                      p.name.toLowerCase().includes(query) ||
                      (p.inspired_by && p.inspired_by.toLowerCase().includes(query)) ||
                      (p.category_name && p.category_name.toLowerCase().includes(query))
                    );
                  })
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-white hover:bg-neutral-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-sm bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200">
                          <img
                            src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=100&q=80'}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-serif text-xs font-semibold text-black truncate">
                              {p.name}
                            </span>
                            {p.category_name && (
                              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                                • {p.category_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-neutral-500 truncate">
                            {p.inspired_by && <span>{p.inspired_by}</span>}
                            <span>•</span>
                            <span className="font-semibold text-black">₹{p.sale_price || p.price}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          disabled={togglingBestsellerId === p.id}
                          onClick={() => handleToggleBestseller(p)}
                          className={`px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                            p.is_bestseller
                              ? 'bg-black text-white hover:bg-neutral-800 shadow-xs'
                              : 'bg-white text-neutral-700 border border-neutral-300 hover:border-black hover:text-black'
                          }`}
                        >
                          {togglingBestsellerId === p.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : p.is_bestseller ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>In Carousel</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Carousel</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CUSTOM FRAGRANCE STUDIO BANNER                                     */}
        {/* ========================================================================= */}
        {activeTab === 'bespoke' && (
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h2 className="font-serif text-lg text-black font-medium">Custom Fragrance Studio Banner</h2>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  The dark obsidian studio banner inviting clients to custom-formulate their signature scent.
                </p>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.bespoke_studio.enabled}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bespoke_studio: { ...prev.bespoke_studio, enabled: e.target.checked },
                    }))
                  }
                  className="rounded text-black focus:ring-black w-4 h-4"
                />
                <span className="text-xs uppercase tracking-wider font-semibold text-black">
                  Section Visible
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Title Line 1
                </label>
                <input
                  type="text"
                  value={content.bespoke_studio.title_line1}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bespoke_studio: { ...prev.bespoke_studio, title_line1: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Title Line 2 (Accent)
                </label>
                <input
                  type="text"
                  value={content.bespoke_studio.title_line2}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bespoke_studio: { ...prev.bespoke_studio, title_line2: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black font-serif italic"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                Description Paragraph
              </label>
              <textarea
                rows={3}
                value={content.bespoke_studio.description}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    bespoke_studio: { ...prev.bespoke_studio, description: e.target.value },
                  }))
                }
                className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  Studio Launch Button Text
                </label>
                <input
                  type="text"
                  value={content.bespoke_studio.button_text}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bespoke_studio: { ...prev.bespoke_studio, button_text: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                  WhatsApp Concierge Button Text
                </label>
                <input
                  type="text"
                  value={content.bespoke_studio.whatsapp_consult_text}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bespoke_studio: { ...prev.bespoke_studio, whatsapp_consult_text: e.target.value },
                    }))
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: TRUST PILLARS & VIP NEWSLETTER                                     */}
        {/* ========================================================================= */}
        {activeTab === 'pillars' && (
          <div className="space-y-6">
            {/* 4 Trust Pillars */}
            <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h2 className="font-serif text-lg text-black font-medium">4 Core Pillars</h2>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  The trust badges displayed across the customer homepage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.pillars.map((pillar, idx) => (
                  <div key={pillar.id || idx} className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-black">
                      Pillar #{idx + 1}
                    </span>
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const newPillars = [...content.pillars];
                          newPillars[idx] = { ...newPillars[idx], title: e.target.value };
                          setContent((prev) => ({ ...prev, pillars: newPillars }));
                        }}
                        className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={pillar.description}
                        onChange={(e) => {
                          const newPillars = [...content.pillars];
                          newPillars[idx] = { ...newPillars[idx], description: e.target.value };
                          setContent((prev) => ({ ...prev, pillars: newPillars }));
                        }}
                        className="w-full bg-white border border-neutral-200 rounded-sm px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Newsletter */}
            <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-4 shadow-sm">
              <div>
                <h2 className="font-serif text-lg text-black font-medium">Newsletter Signup Banner</h2>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  The newsletter signup invitation at the bottom of the homepage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                    Heading Title
                  </label>
                  <input
                    type="text"
                    value={content.newsletter.title}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        newsletter: { ...prev.newsletter, title: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={content.newsletter.subtitle}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        newsletter: { ...prev.newsletter, subtitle: e.target.value },
                      }))
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <span className="text-[11px] text-neutral-500 font-light">
            Remember to click "Publish Changes" to push your edits to Supabase and live visitors.
          </span>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-sm text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing Updates...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
