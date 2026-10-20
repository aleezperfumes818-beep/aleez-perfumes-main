import React, { useState } from 'react';
import { Sparkles, Check, ShoppingBag, Droplets, Clock, ShieldCheck, Award, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

// Note definitions
const TOP_NOTES = [
  { id: 't1', name: 'Calabrian Bergamot', category: 'Citrus', description: 'Crisp, radiant Mediterranean sun opening.' },
  { id: 't2', name: 'Pink Peppercorn', category: 'Spicy', description: 'Faceted sparkle with subtle herbal brightness.' },
  { id: 't3', name: 'Kashmiri Saffron', category: 'Spice', description: 'Regal, bittersweet golden saffron threads.' },
  { id: 't4', name: 'Neroli Blossom', category: 'Floral', description: 'Delicate Moroccan orange blossom distillation.' },
  { id: 't5', name: 'Crushed Cardamom', category: 'Spice', description: 'Aromatic green pods with camphor freshness.' },
  { id: 't6', name: 'French Lavender', category: 'Herbal', description: 'Sun-warmed Provençal lavender sprigs.' },
];

const HEART_NOTES = [
  { id: 'h1', name: 'Bulgarian Damask Rose', category: 'Floral', description: 'Velvety, intoxicating deep red rose petals.' },
  { id: 'h2', name: 'Smoked Frankincense', category: 'Resin', description: 'Sacred Omani tears with meditative mineral smoke.' },
  { id: 'h3', name: 'Night-Blooming Jasmine', category: 'Floral', description: 'Sensual, narcotic white floral grandeur.' },
  { id: 'h4', name: 'Madagascar Vanilla Bourbon', category: 'Gourmand', description: 'Dark, aged alcoholic orchid bean pod.' },
  { id: 'h5', name: 'Nutmeg & Clove Bud', category: 'Warm Spice', description: 'Intimate spice warmth echoing old ateliers.' },
  { id: 'h6', name: 'Black Amber Accord', category: 'Amber', description: 'Dry, salty-sweet resinous amber crystal.' },
];

const BASE_NOTES = [
  { id: 'b1', name: 'Aged Cambodian Oud', category: 'Oud', description: 'Distilled 15-year wild agarwood with deep leather animalic facets.' },
  { id: 'b2', name: 'Dark Indonesian Patchouli', category: 'Earthy', description: 'Dense, damp cellar earth and velvety cocoa nuance.' },
  { id: 'b3', name: 'Tuscan Leather Accord', category: 'Oriental', description: 'Supple, smoky luxury leather with aristocratic poise.' },
  { id: 'b4', name: 'Mysore Sandalwood', category: 'Woody', description: 'Velvety, milky sacred wood that lingers 24+ hours.' },
  { id: 'b5', name: 'Roasted Tonka Bean', category: 'Sweet', description: 'Almond-faceted coumarin with warm tobacco warmth.' },
  { id: 'b6', name: 'White Silk Musk', category: 'Oriental', description: 'Intimate, velvety second-skin clean animalic aura.' },
];

const BOTTLE_STYLES = [
  {
    id: 'crystal-monogram',
    name: 'Crystal Monogram Flacon',
    description: 'Heavy faceted French glass with polished black engraved cap and tassel.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    color: '#000000',
  },
  {
    id: 'obsidian-noir',
    name: 'Obsidian Noir Flacon',
    description: 'Smoked opaque noir flacon with brushed matte geometric lid.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    color: '#1A1A1A',
  },
  {
    id: 'atelier-signature',
    name: 'Atelier Signature Flacon',
    description: 'Minimalist crystal flacon crowned with AZ monogram seal.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
    color: '#333333',
  },
];

export const CreateFragrancePage: React.FC = () => {
  const { addToCart, setIsCartOpen } = useCart();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  // Builder States
  const [selectedBottle, setSelectedBottle] = useState(BOTTLE_STYLES[0]);
  const [selectedVolume, setSelectedVolume] = useState<'50ml' | '100ml'>('50ml');
  const [customName, setCustomName] = useState('');
  const [selectedTopNotes, setSelectedTopNotes] = useState<string[]>(['Calabrian Bergamot']);
  const [selectedHeartNotes, setSelectedHeartNotes] = useState<string[]>(['Bulgarian Damask Rose']);
  const [selectedBaseNotes, setSelectedBaseNotes] = useState<string[]>(['Aged Cambodian Oud']);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Pricing calculation
  const price = selectedVolume === '50ml' ? 2499 : 3499;

  const toggleNote = (name: string, layer: 'top' | 'heart' | 'base') => {
    if (layer === 'top') {
      if (selectedTopNotes.includes(name)) {
        if (selectedTopNotes.length > 1) setSelectedTopNotes(selectedTopNotes.filter((n) => n !== name));
      } else {
        if (selectedTopNotes.length < 3) setSelectedTopNotes([...selectedTopNotes, name]);
      }
    } else if (layer === 'heart') {
      if (selectedHeartNotes.includes(name)) {
        if (selectedHeartNotes.length > 1) setSelectedHeartNotes(selectedHeartNotes.filter((n) => n !== name));
      } else {
        if (selectedHeartNotes.length < 3) setSelectedHeartNotes([...selectedHeartNotes, name]);
      }
    } else {
      if (selectedBaseNotes.includes(name)) {
        if (selectedBaseNotes.length > 1) setSelectedBaseNotes(selectedBaseNotes.filter((n) => n !== name));
      } else {
        if (selectedBaseNotes.length < 3) setSelectedBaseNotes([...selectedBaseNotes, name]);
      }
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    const generatedSlug = `custom-${Date.now()}`;
    const formulationSummary = `Top: ${selectedTopNotes.join(', ')} | Heart: ${selectedHeartNotes.join(', ')} | Base: ${selectedBaseNotes.join(', ')}`;
    const finalName = customName.trim()
      ? `Custom Formula: "${customName.trim()}"`
      : `Personalized Extrait (${selectedVolume})`;

    // Synthetic custom product for Cart Context
    const customProduct = {
      id: `custom-scent-${Date.now()}`,
      name: finalName,
      slug: generatedSlug,
      description: `Formula architecture handcrafted exclusively for client. ${formulationSummary}. Bottle: ${selectedBottle.name} (${selectedVolume}).`,
      price: price,
      sale_price: null,
      category_id: 'custom-creations',
      category_name: 'Custom Atelier',
      sku: `BESP-${selectedVolume.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      stock_quantity: 99,
      is_featured: false,
      is_bestseller: false,
      is_new_arrival: true,
      is_active: true,
      fragrance_family: 'Bespoke Blend',
      concentration: '35% Extrait De Parfum',
      bottle_size: selectedVolume.toUpperCase(),
      top_notes: selectedTopNotes.join(', '),
      heart_notes: selectedHeartNotes.join(', '),
      base_notes: selectedBaseNotes.join(', '),
      ingredients: 'Organic Perfumer Alcohol, Fragrance Essence Oils, Distilled Water',
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: `custom-scent-${Date.now()}`,
          image_url: selectedBottle.image,
          display_order: 0,
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addToCart(customProduct as any, 1);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
    setIsCartOpen(true);
  };

  const handleWhatsAppConsult = () => {
    const text = `Hi Aleez Perfumes, I am creating a custom fragrance formula on your studio!
*Flacon:* ${selectedBottle.name} (${selectedVolume})
*Name on Bottle:* ${customName.trim() || 'Undecided'}
*Top Notes:* ${selectedTopNotes.join(', ')}
*Heart Notes:* ${selectedHeartNotes.join(', ')}
*Base Notes:* ${selectedBaseNotes.join(', ')}

Could your master perfumer advise on this olfactory pyramid harmony?`;

    window.open(`https://wa.me/919345526905?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white text-black min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header / Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-neutral-300 bg-neutral-50 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-600 font-semibold">
              Personalized Fragrance Atelier
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-black tracking-wide leading-tight">
            Create Your Fragrance
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
            Build a fragrance that feels like you. Select up to three notes for each layer to create your signature formula, choose your luxury flacon, and let our master perfumer handcraft your one-of-one Extrait de Parfum.
          </p>
        </div>

        {/* Builder Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT 7 COLS: The Interactive Note & Flacon Builder */}
          <div className="lg:col-span-7 space-y-10">
            {/* 1. Flacon Selection */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-serif font-bold">
                    1
                  </span>
                  <h3 className="font-serif text-xl text-black font-medium">Choose Your Bottle Style</h3>
                </div>
                <span className="text-xs text-neutral-500 font-medium">Select 1</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {BOTTLE_STYLES.map((bottle) => {
                  const isSelected = selectedBottle.id === bottle.id;
                  return (
                    <button
                      key={bottle.id}
                      onClick={() => setSelectedBottle(bottle)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-black bg-neutral-100 shadow-md ring-1 ring-black'
                          : 'border-neutral-200 hover:border-black bg-white'
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                        <img src={bottle.image} alt={bottle.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-sm font-medium text-black">{bottle.name}</h4>
                          {isSelected && <Check className="w-4 h-4 text-black" />}
                        </div>
                        <p className="text-[11px] text-neutral-600 font-light mt-1 line-clamp-2">
                          {bottle.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Volume & Bottle Engraving Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-700 mb-2 font-medium">
                    Volume Size
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedVolume('50ml')}
                      className={`flex-1 py-2.5 rounded-sm border text-xs font-semibold tracking-wider transition-all ${
                        selectedVolume === '50ml'
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-black border-neutral-300 hover:border-black'
                      }`}
                    >
                      50 ml (₹2,499)
                    </button>
                    <button
                      onClick={() => setSelectedVolume('100ml')}
                      className={`flex-1 py-2.5 rounded-sm border text-xs font-semibold tracking-wider transition-all ${
                        selectedVolume === '100ml'
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-black border-neutral-300 hover:border-black'
                      }`}
                    >
                      100 ml (₹3,499)
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="custom-engraving-input" className="block text-xs uppercase tracking-wider text-neutral-700 mb-2 font-medium">
                    Custom Bottle Engraving Name
                  </label>
                  <input
                    id="custom-engraving-input"
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Royal Amber Essence"
                    maxLength={28}
                    className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black text-black"
                  />
                  <span className="text-[10px] text-neutral-500 font-light mt-1 block">
                    Will be hand-engraved on the flacon plaque
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Top Notes Layer */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-serif font-bold">
                    2
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-black font-medium">Top Notes (The Opening)</h3>
                    <p className="text-xs text-neutral-500 font-light">The immediate first impression (lasts 15-45 minutes)</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-black bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-300">
                  {selectedTopNotes.length}/3 selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TOP_NOTES.map((note) => {
                  const isSelected = selectedTopNotes.includes(note.name);
                  return (
                    <button
                      key={note.id}
                      onClick={() => toggleNote(note.name, 'top')}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start justify-between space-x-2 ${
                        isSelected
                          ? 'border-black bg-neutral-100 shadow-sm ring-1 ring-black'
                          : 'border-neutral-200 hover:border-black bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-black">{note.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-700 bg-neutral-200 px-1.5 py-0.5 rounded">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-light mt-1">{note.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-black border-black text-white' : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Heart / Middle Notes Layer */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-serif font-bold">
                    3
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-black font-medium">Heart Notes (The Character)</h3>
                    <p className="text-xs text-neutral-500 font-light">The core identity of your blend (lasts 3-6 hours)</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-black bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-300">
                  {selectedHeartNotes.length}/3 selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HEART_NOTES.map((note) => {
                  const isSelected = selectedHeartNotes.includes(note.name);
                  return (
                    <button
                      key={note.id}
                      onClick={() => toggleNote(note.name, 'heart')}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start justify-between space-x-2 ${
                        isSelected
                          ? 'border-black bg-neutral-100 shadow-sm ring-1 ring-black'
                          : 'border-neutral-200 hover:border-black bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-black">{note.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-700 bg-neutral-200 px-1.5 py-0.5 rounded">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-light mt-1">{note.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-black border-black text-white' : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Base Notes Layer */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-serif font-bold">
                    4
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-black font-medium">Base Notes (The Sillage & Longevity)</h3>
                    <p className="text-xs text-neutral-500 font-light">The foundational accords that anchor your custom sillage and lasting depth</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-black bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-300">
                  {selectedBaseNotes.length}/3 selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BASE_NOTES.map((note) => {
                  const isSelected = selectedBaseNotes.includes(note.name);
                  return (
                    <button
                      key={note.id}
                      onClick={() => toggleNote(note.name, 'base')}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start justify-between space-x-2 ${
                        isSelected
                          ? 'border-black bg-neutral-100 shadow-sm ring-1 ring-black'
                          : 'border-neutral-200 hover:border-black bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-black">{note.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-neutral-700 bg-neutral-200 px-1.5 py-0.5 rounded">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-light mt-1">{note.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-black border-black text-white' : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: Live Formulation Preview & Checkout Card */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-black font-semibold">
                  <Award className="w-4 h-4 text-black" />
                  <span>Custom Formula Summary</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-full font-medium">
                  35% Extrait
                </span>
              </div>

              {/* Live Flacon Image with Engraved Name */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center group">
                <img
                  src={selectedBottle.image}
                  alt={selectedBottle.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Simulated Custom Plaque Engraving */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-neutral-300 shadow-md text-center">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 block font-mono">
                    ALEEZ SIGNATURE ATELIER
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-black truncate">
                    {customName.trim() || 'Your Signature Scent'}
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-light">
                    {selectedVolume} • Handcrafted Extrait de Parfum
                  </span>
                </div>
              </div>

              {/* Formulation Pyramid Overview */}
              <div className="space-y-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs">
                <div>
                  <span className="text-neutral-500 font-mono uppercase text-[10px] block">Top Notes</span>
                  <span className="font-medium text-black">{selectedTopNotes.join(' • ')}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2">
                  <span className="text-neutral-500 font-mono uppercase text-[10px] block">Heart Notes</span>
                  <span className="font-medium text-black">{selectedHeartNotes.join(' • ')}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2">
                  <span className="text-neutral-500 font-mono uppercase text-[10px] block">Base Notes</span>
                  <span className="font-medium text-black">{selectedBaseNotes.join(' • ')}</span>
                </div>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="pt-2 border-t border-neutral-200 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg text-black">Total Price</span>
                  <div className="text-right">
                    <span className="font-serif text-3xl font-bold text-black font-mono">
                      {formatPrice(price)}
                    </span>
                    <span className="text-[11px] text-neutral-500 block font-light">
                      Includes custom compounding & bottle engraving
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added Custom Fragrance To Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order Custom Perfume • {formatPrice(price)}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleWhatsAppConsult}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white border border-neutral-700 text-xs uppercase tracking-[0.18em] font-semibold rounded-sm shadow-sm transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Consult Master Perfumer on WhatsApp</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-2 border-t border-neutral-200">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-black" />
                  <span>24+ Hours Projection</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Droplets className="w-3.5 h-3.5 text-black" />
                  <span>Pure Organic Essences</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span>100% Skin Safe</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Free Pan-India Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
