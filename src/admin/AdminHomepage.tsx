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
  AlertCircle,
  Plus,
  Trash2,
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
    if (window.confirm('Are you sure you want to restore original luxury defaults? Any unsaved edits will be lost.')) {
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
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Image upload failed. Please try again or use a direct URL.');
    } finally {
      setUploadingImage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#B8860B] animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#555555]">Loading Homepage Editor...</p>
        </div>
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === content.spotlight.product_id);

  return (
    <div className="max-w-6xl space-y-8 pb-16">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#EAE5DC] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
              Storefront Customizer
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
              Live Production
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#141414] mt-1">
            Homepage Content Management
          </h1>
          <p className="text-xs text-[#555555] font-light mt-0.5">
            Directly control texts, spotlight hero, background video, curation cards, and bespoke atelier copy.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-3.5 py-2 bg-white hover:bg-[#F7F5F0] text-[#141414] border border-[#EAE5DC] rounded-sm text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>{previewMode ? 'Exit Preview' : 'Hero Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-white hover:bg-[#F7F5F0] text-stone-600 border border-[#EAE5DC] rounded-sm text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
            title="Reset form fields to default Haute Parfumerie copy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white hover:bg-[#F7F5F0] text-[#141414] border border-[#EAE5DC] rounded-sm text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#B8860B]" />
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2 bg-[#B8860B] hover:bg-[#9E7307] text-white rounded-sm text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all shadow-gold-sm disabled:opacity-50"
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
        <div className="p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-fade-in shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">
            Homepage published successfully! All changes are now live for your customers.
          </span>
        </div>
      )}

      {/* Interactive Hero Live Preview Box (Toggled) */}
      {previewMode && (
        <div className="border border-[#DFC38A] rounded-sm overflow-hidden bg-black text-white p-8 relative shadow-2xl animate-fade-in">
          <div className="absolute top-3 right-3 z-20 bg-black/80 px-2.5 py-1 rounded-sm border border-white/20 text-[10px] uppercase font-mono tracking-wider text-[#E5C378]">
            Live Hero Preview
          </div>
          <div className="max-w-3xl mx-auto text-center space-y-5 py-6">
            <div className="inline-block px-3 py-1 rounded-sm border border-[#D4AF37]/50 bg-black/60 text-[10px] uppercase tracking-[0.25em] text-[#F5E9BF]">
              {content.hero.badge}
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-white leading-tight">
              {content.hero.title_line1} <br />
              <span className="italic font-light text-[#E5C378]">{content.hero.title_line2}</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl mx-auto leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="px-6 py-2.5 bg-[#B8860B] text-white text-[11px] uppercase tracking-widest font-semibold rounded-sm">
                {content.hero.primary_btn_text}
              </span>
              <span className="px-6 py-2.5 bg-white/10 border border-white/40 text-white text-[11px] uppercase tracking-widest font-semibold rounded-sm">
                {content.hero.secondary_btn_text}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#EAE5DC] overflow-x-auto space-x-1 scrollbar-none">
        {[
          { id: 'hero', label: '1. Hero Banner', icon: Sparkles },
          { id: 'spotlight', label: '2. Weekly Spotlight', icon: Flame },
          { id: 'specialties', label: '3. Specialties (4 Cards)', icon: Layers },
          { id: 'bestsellers', label: '4. Bestsellers Section', icon: Layers },
          { id: 'bespoke', label: '5. Bespoke Atelier', icon: Compass },
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
                  ? 'border-[#B8860B] text-[#B8860B] bg-white'
                  : 'border-transparent text-stone-500 hover:text-[#141414] hover:bg-white/50'
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
          <div className="bg-white border border-[#EAE5DC] rounded-sm p-6 sm:p-8 space-y-6 shadow-card">
            <div>
              <h2 className="font-serif text-lg text-[#141414] font-medium">Hero Cinematic Banner</h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                The grand focal point of your store. Uses luxury typography and full-bleed looping video.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Eyebrow Badge Text
                </label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="e.g. HAUTE PARFUMERIE • PURE OUD EXTRACTIONS & ATTARS"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Headline Line 1 (Standard Serif)
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
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                    placeholder="e.g. Artisanal Fragrance &"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Headline Line 2 (Golden Italic Accent)
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
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none font-serif italic"
                    placeholder="e.g. Rare Botanicals"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] focus:border-[#B8860B] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none leading-relaxed"
                  placeholder="Master-formulated in limited batches using authentic botanical absolutes..."
                />
              </div>

              {/* Call-to-action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE5DC]">
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-[#B8860B] font-semibold">Primary Button</h3>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Button Label</label>
                    <input
                      type="text"
                      value={content.hero.primary_btn_text}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, primary_btn_text: e.target.value },
                        }))
                      }
                      className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3 py-2 text-xs text-[#141414] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Target Link URL</label>
                    <input
                      type="text"
                      value={content.hero.primary_btn_link}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, primary_btn_link: e.target.value },
                        }))
                      }
                      className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3 py-2 text-xs text-[#141414] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-stone-700 font-semibold">Secondary Button</h3>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Button Label</label>
                    <input
                      type="text"
                      value={content.hero.secondary_btn_text}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondary_btn_text: e.target.value },
                        }))
                      }
                      className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3 py-2 text-xs text-[#141414] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Target Link URL</label>
                    <input
                      type="text"
                      value={content.hero.secondary_btn_link}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, secondary_btn_link: e.target.value },
                        }))
                      }
                      className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3 py-2 text-xs text-[#141414] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Background Video & Fallback Poster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EAE5DC]">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-[#B8860B]" />
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
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] font-mono focus:outline-none"
                    placeholder="/videos/aleez-signature.mp4 or CDN video link"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Defaults to bundled high-definition video at <code className="text-[#B8860B]">/videos/aleez-signature.mp4</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>Fallback Image Poster URL</span>
                    </span>
                    <label className="cursor-pointer text-[10px] text-[#B8860B] hover:underline flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'hero_fallback')}
                      />
                    </label>
                  </label>
                  <input
                    type="text"
                    value={content.hero.fallback_image_url}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, fallback_image_url: e.target.value },
                      }))
                    }
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                    placeholder="https://..."
                  />
                  {uploadingImage === 'hero_fallback' && (
                    <p className="text-[11px] text-[#B8860B] mt-1 flex items-center space-x-1">
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
        {/* TAB 2: WEEKLY SPOTLIGHT FRAGRANCE                                         */}
        {/* ========================================================================= */}
        {activeTab === 'spotlight' && (
          <div className="bg-white border border-[#EAE5DC] rounded-sm p-6 sm:p-8 space-y-6 shadow-card">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <div>
                <h2 className="font-serif text-lg text-[#141414] font-medium">Fragrance of the Week Spotlight</h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Showcase a featured masterpiece with full scent notes breakdown and quick add to cart.
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
                  className="rounded text-[#B8860B] focus:ring-[#B8860B] w-4 h-4"
                />
                <span className="text-xs uppercase tracking-wider font-semibold text-[#141414]">
                  Section Visible
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Section Badge Text
                </label>
                <input
                  type="text"
                  value={content.spotlight.badge}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="e.g. Weekly Curation"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Section Title
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="e.g. Fragrance of the Week"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Section Subtitle
              </label>
              <textarea
                rows={2}
                value={content.spotlight.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    spotlight: { ...prev.spotlight, subtitle: e.target.value },
                  }))
                }
                className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                placeholder="Discover this week's handpicked master formulation..."
              />
            </div>

            {/* Product Selector */}
            <div className="p-4 bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm space-y-4">
              <label className="block text-xs uppercase tracking-wider text-stone-700 font-semibold">
                Spotlight Fragrance Selection
              </label>
              <select
                value={content.spotlight.product_id || ''}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    spotlight: { ...prev.spotlight, product_id: e.target.value },
                  }))
                }
                className="w-full bg-white border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none focus:border-[#B8860B]"
              >
                <option value="">-- Automatic (Default to Velvet Oud Noir or Bestseller) --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.sale_price || p.price} {p.category_name ? `(${p.category_name})` : ''}
                  </option>
                ))}
              </select>

              {/* Preview of chosen product */}
              {selectedProduct && (
                <div className="flex items-center space-x-4 p-3 bg-white border border-[#EAE5DC] rounded-sm">
                  <img
                    src={selectedProduct.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f'}
                    alt={selectedProduct.name}
                    className="w-16 h-16 object-cover rounded-sm border border-[#EAE5DC]"
                  />
                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-semibold text-[#141414]">{selectedProduct.name}</h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{selectedProduct.description}</p>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-semibold text-[#B8860B]">₹{selectedProduct.sale_price || selectedProduct.price}</span>
                      {selectedProduct.category_name && (
                        <span className="text-[10px] uppercase font-mono text-stone-400">
                          • {selectedProduct.category_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ATELIER SPECIALTIES (4 Cards)                                      */}
        {/* ========================================================================= */}
        {activeTab === 'specialties' && (
          <div className="bg-white border border-[#EAE5DC] rounded-sm p-6 sm:p-8 space-y-6 shadow-card">
            <div>
              <h2 className="font-serif text-lg text-[#141414] font-medium">Atelier Specialties Section</h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                The 4 signature collection cards on the homepage (e.g. Pour Homme, Pour Femme, Noble Oud, Artisanal Attars).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Section Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={content.specialties.badge}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      specialties: { ...prev.specialties, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="e.g. Atelier Specialties"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="Our True Masterclass Into Handpicked Formulations"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Section Subtitle
              </label>
              <textarea
                rows={2}
                value={content.specialties.subtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    specialties: { ...prev.specialties, subtitle: e.target.value },
                  }))
                }
                className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
              />
            </div>

            {/* 4 Cards Editor */}
            <div className="space-y-6 pt-4 border-t border-[#EAE5DC]">
              <h3 className="text-xs uppercase tracking-wider text-[#B8860B] font-semibold">
                Specialty Cards (4 Highlight Portals)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.specialties.cards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="p-5 bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-2">
                      <span className="font-mono text-xs uppercase font-bold text-[#B8860B]">
                        Card #{idx + 1}
                      </span>
                      <label className="cursor-pointer text-[10px] text-[#B8860B] hover:underline flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload Card Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, `card_${idx}`, idx)}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1">Card Title</label>
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
                          className="w-full bg-white border border-[#EAE5DC] rounded-sm px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1">Eyebrow Subtitle</label>
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
                          className="w-full bg-white border border-[#EAE5DC] rounded-sm px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">Description</label>
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
                        className="w-full bg-white border border-[#EAE5DC] rounded-sm px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1">Target Link URL</label>
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
                          className="w-full bg-white border border-[#EAE5DC] rounded-sm px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1">Image URL</label>
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
                          className="w-full bg-white border border-[#EAE5DC] rounded-sm px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BESTSELLERS SECTION                                                */}
        {/* ========================================================================= */}
        {activeTab === 'bestsellers' && (
          <div className="bg-white border border-[#EAE5DC] rounded-sm p-6 sm:p-8 space-y-6 shadow-card">
            <div>
              <h2 className="font-serif text-lg text-[#141414] font-medium">Bestsellers & Inspirations Section</h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Customize the header and CTA button above the automated bestsellers grid.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Section Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={content.bestsellers_section.badge}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bestsellers_section: { ...prev.bestsellers_section, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="Masterclass Formulations"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="Brand Inspirations & Bestsellers"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="Handcrafted interpretations inspired by the world's most prestigious perfume houses."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  placeholder="View All Inspirations"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BESPOKE ATELIER BANNER                                             */}
        {/* ========================================================================= */}
        {activeTab === 'bespoke' && (
          <div className="bg-white border border-[#EAE5DC] rounded-sm p-6 sm:p-8 space-y-6 shadow-card">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <div>
                <h2 className="font-serif text-lg text-[#141414] font-medium">Bespoke Atelier Counter Banner</h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  The dark obsidian atelier banner inviting clients to custom-formulate their signature scent.
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
                  className="rounded text-[#B8860B] focus:ring-[#B8860B] w-4 h-4"
                />
                <span className="text-xs uppercase tracking-wider font-semibold text-[#141414]">
                  Section Visible
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={content.bespoke_studio.badge}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bespoke_studio: { ...prev.bespoke_studio, badge: e.target.value },
                    }))
                  }
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Title Line 2 (Golden Accent)
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none font-serif italic"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE5DC]">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
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
            <div className="bg-white border border-[#EAE5DC] rounded-sm p-6 sm:p-8 space-y-6 shadow-card">
              <div>
                <h2 className="font-serif text-lg text-[#141414] font-medium">4 Core Pillars</h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  The trust badges displayed across the customer homepage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.pillars.map((pillar, idx) => (
                  <div key={pillar.id || idx} className="p-4 bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm space-y-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#B8860B]">
                      Pillar #{idx + 1}
                    </span>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const newPillars = [...content.pillars];
                          newPillars[idx] = { ...newPillars[idx], title: e.target.value };
                          setContent((prev) => ({ ...prev, pillars: newPillars }));
                        }}
                        className="w-full bg-white border border-[#EAE5DC] rounded-sm px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={pillar.description}
                        onChange={(e) => {
                          const newPillars = [...content.pillars];
                          newPillars[idx] = { ...newPillars[idx], description: e.target.value };
                          setContent((prev) => ({ ...prev, pillars: newPillars }));
                        }}
                        className="w-full bg-white border border-[#EAE5DC] rounded-sm px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Newsletter */}
            <div className="bg-white border border-[#EAE5DC] rounded-sm p-6 sm:p-8 space-y-4 shadow-card">
              <div>
                <h2 className="font-serif text-lg text-[#141414] font-medium">VIP Atelier Newsletter Banner</h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  The newsletter signup invitation at the bottom of the homepage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                    Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    value={content.newsletter.badge}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        newsletter: { ...prev.newsletter, badge: e.target.value },
                      }))
                    }
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
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
                    className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1 font-medium">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={content.newsletter.subtitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, subtitle: e.target.value },
                    }))
                  }
                  className="w-full bg-[#FAF9F6] border border-[#EAE5DC] rounded-sm px-3.5 py-2.5 text-xs text-[#141414] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EAE5DC]">
          <span className="text-[11px] text-stone-500 font-light">
            Remember to click "Publish Changes" to push your edits to Supabase and live visitors.
          </span>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#B8860B] hover:bg-[#9E7307] text-white rounded-sm text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all shadow-gold-sm disabled:opacity-50"
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
