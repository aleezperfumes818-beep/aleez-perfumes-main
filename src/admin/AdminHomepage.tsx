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
        <div className="border border-neutral-700 rounded-sm overflow-hidden bg-black text-white p-8 relative shadow-2xl animate-fade-in">
          <div className="absolute top-3 right-3 z-20 bg-neutral-900 px-2.5 py-1 rounded-sm border border-neutral-700 text-[10px] uppercase font-mono tracking-wider text-neutral-300">
            Live Hero Preview
          </div>
          <div className="max-w-3xl mx-auto text-center space-y-5 py-6">
            <h2 className="font-serif text-3xl sm:text-5xl text-white leading-tight">
              {content.hero.title_line1} <br />
              <span className="italic font-light text-neutral-300">{content.hero.title_line2}</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl mx-auto leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="px-6 py-2.5 bg-white text-black text-[11px] uppercase tracking-widest font-semibold rounded-sm">
                {content.hero.primary_btn_text}
              </span>
              <span className="px-6 py-2.5 bg-transparent border border-white text-white text-[11px] uppercase tracking-widest font-semibold rounded-sm">
                {content.hero.secondary_btn_text}
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
          { id: 'bestsellers', label: '4. Bestsellers Section', icon: Layers },
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
                The grand focal point of your store. Uses luxury typography and full-bleed looping video.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
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
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none"
                    placeholder="e.g. Artisanal Fragrance &"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-1 font-medium">
                    Headline Line 2 (Italic Accent)
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
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none font-serif italic"
                    placeholder="e.g. Rare Botanicals"
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
            <div>
              <h2 className="font-serif text-lg text-black font-medium">Atelier Specialties Section</h2>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                The 4 signature collection cards on the homepage (e.g. Pour Homme, Pour Femme, Noble Oud, Artisanal Attars).
              </p>
            </div>

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
        {/* TAB 4: BESTSELLERS SECTION                                                */}
        {/* ========================================================================= */}
        {activeTab === 'bestsellers' && (
          <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="font-serif text-lg text-black font-medium">Bestsellers & Inspirations Section</h2>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Customize the header and CTA button above the automated bestsellers grid.
              </p>
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
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-sm px-3.5 py-2.5 text-xs text-black focus:outline-none focus:border-black"
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
