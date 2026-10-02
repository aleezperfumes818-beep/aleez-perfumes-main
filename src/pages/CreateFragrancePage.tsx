import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Check,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  Info,
  Droplets,
  Layers,
  Award,
  Clock,
  ShieldCheck,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Product } from '../types';

interface NoteItem {
  id: string;
  name: string;
  category: 'Citrus' | 'Floral' | 'Woody' | 'Oriental' | 'Spicy' | 'Sweet';
  description: string;
}

const TOP_NOTES: NoteItem[] = [
  { id: 't1', name: 'Calabrian Bergamot', category: 'Citrus', description: 'Crisp, sparkling Italian citrus with an uplifting opening.' },
  { id: 't2', name: 'Kashmiri Saffron', category: 'Spicy', description: 'Precious golden red stigmas offering warm, bittersweet exoticism.' },
  { id: 't3', name: 'Cardamom Pods', category: 'Spicy', description: 'Aromatic, green aromatic warmth with a sophisticated bite.' },
  { id: 't4', name: 'Pink Peppercorn', category: 'Spicy', description: 'Bright, rosy effervescence with modern vibrancy.' },
  { id: 't5', name: 'Mandarin Zest', category: 'Citrus', description: 'Juicy, sun-drenched sweet citrus zest.' },
  { id: 't6', name: 'French Lavender', category: 'Floral', description: 'Clean, soothing herbal floral essence from Provence.' },
];

const HEART_NOTES: NoteItem[] = [
  { id: 'h1', name: 'Bulgarian Damask Rose', category: 'Floral', description: 'Velvety, petal-rich romantic floral absolute.' },
  { id: 'h2', name: 'Royal Frankincense', category: 'Oriental', description: 'Sacred resinous smoke that lends mystery and poise.' },
  { id: 'h3', name: 'Jasmine Sambac', category: 'Floral', description: 'Intoxicating night-blooming white floral nectar.' },
  { id: 'h4', name: 'Golden Amber Resin', category: 'Oriental', description: 'Luminous honeyed warmth that binds the fragrance.' },
  { id: 'h5', name: 'Spiced Cinnamon Bark', category: 'Spicy', description: 'Rich, sensual autumnal gourmand warmth.' },
  { id: 'h6', name: 'Atlas Cedarwood', category: 'Woody', description: 'Dry, elegant forest woods providing structural poise.' },
];

const BASE_NOTES: NoteItem[] = [
  { id: 'b1', name: 'Cambodian Agarwood (Oud)', category: 'Woody', description: 'Rare, aged wild oud providing monumental sillage and depth.' },
  { id: 'b2', name: 'Madagascar Vanilla Bean', category: 'Sweet', description: 'Creamy, decadent dark bourbon vanilla pods.' },
  { id: 'b3', name: 'Tuscan Leather Accord', category: 'Oriental', description: 'Supple, smoky luxury leather with aristocratic poise.' },
  { id: 'b4', name: 'Mysore Sandalwood', category: 'Woody', description: 'Velvety, milky sacred wood that lingers 24+ hours.' },
  { id: 'b5', name: 'Roasted Tonka Bean', category: 'Sweet', description: 'Almond-faceted coumarin with warm tobacco warmth.' },
  { id: 'b6', name: 'White Silk Musk', category: 'Oriental', description: 'Intimate, velvety second-skin clean animalic aura.' },
];

const BOTTLE_STYLES = [
  {
    id: 'crystal-gold',
    name: 'Crystal Gold Flacon',
    description: 'Heavy faceted French glass with 24k gold engraved cap and tassel.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    color: '#D4AF37',
  },
  {
    id: 'obsidian-noir',
    name: 'Obsidian Noir Flacon',
    description: 'Smoked opaque noir flacon with brushed bronze geometric lid.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    color: '#1A1A1A',
  },
  {
    id: 'amber-royale',
    name: 'Amber Royale Flacon',
    description: 'Warm cognac tinted crystal crowned with polished gold crest.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
    color: '#B8860B',
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
  const [selectedBaseNotes, setSelectedBaseNotes] = useState<string[]>(['Cambodian Agarwood (Oud)']);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const price = selectedVolume === '50ml' ? 2499 : 3499;

  const toggleNote = (noteName: string, layer: 'top' | 'heart' | 'base') => {
    if (layer === 'top') {
      if (selectedTopNotes.includes(noteName)) {
        if (selectedTopNotes.length > 1) setSelectedTopNotes(selectedTopNotes.filter((n) => n !== noteName));
      } else {
        if (selectedTopNotes.length < 3) setSelectedTopNotes([...selectedTopNotes, noteName]);
      }
    } else if (layer === 'heart') {
      if (selectedHeartNotes.includes(noteName)) {
        if (selectedHeartNotes.length > 1) setSelectedHeartNotes(selectedHeartNotes.filter((n) => n !== noteName));
      } else {
        if (selectedHeartNotes.length < 3) setSelectedHeartNotes([...selectedHeartNotes, noteName]);
      }
    } else {
      if (selectedBaseNotes.includes(noteName)) {
        if (selectedBaseNotes.length > 1) setSelectedBaseNotes(selectedBaseNotes.filter((n) => n !== noteName));
      } else {
        if (selectedBaseNotes.length < 3) setSelectedBaseNotes([...selectedBaseNotes, noteName]);
      }
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    const bottleTitle = customName.trim() ? customName.trim() : 'Custom Bespoke Extrait';
    const customProduct: Product = {
      id: `bespoke-${Date.now()}`,
      name: `Bespoke Creation: ${bottleTitle}`,
      slug: `bespoke-${Date.now()}`,
      category_id: 'cat-bespoke',
      category_name: 'Bespoke Atelier',
      price: price,
      sale_price: null,
      description: `Personalized Bespoke Formulation (${selectedVolume}). Flacon: ${selectedBottle.name}. Top: ${selectedTopNotes.join(
        ', '
      )}. Heart: ${selectedHeartNotes.join(', ')}. Base: ${selectedBaseNotes.join(', ')}. Handcrafted 35% Extrait De Parfum.`,
      fragrance_family: 'Bespoke Atelier Formulation',
      top_notes: selectedTopNotes.join(', '),
      heart_notes: selectedHeartNotes.join(', '),
      base_notes: selectedBaseNotes.join(', '),
      volume_ml: selectedVolume === '50ml' ? 50 : 100,
      stock_quantity: 99,
      sku: `ALZ-BESPOKE-${Date.now()}`,
      is_bestseller: false,
      is_new_arrival: true,
      is_featured: false,
      is_active: true,
      rating: 5.0,
      review_count: 1,
      images: [
        {
          id: `img-bespoke-${Date.now()}`,
          image_url: selectedBottle.image,
          alt_text: bottleTitle,
          display_order: 1,
          is_primary: true,
        },
      ],
    };

    const res = addToCart(customProduct, 1);
    if (res.success) {
      setJustAdded(true);
      setIsCartOpen(true);
      setTimeout(() => setJustAdded(false), 2500);
    }
    setIsAdding(false);
  };

  const handleWhatsAppConsult = () => {
    const text = `Hi Aleez Perfumes, I would like to order my Bespoke Custom Fragrance formulation:
• Flacon: ${selectedBottle.name} (${selectedVolume})
• Name on Bottle: ${customName.trim() || 'My Signature Scent'}
• Top Notes: ${selectedTopNotes.join(', ')}
• Heart Notes: ${selectedHeartNotes.join(', ')}
• Base Notes: ${selectedBaseNotes.join(', ')}
• Concentration: 35% Extrait De Parfum (₹${price})
Please guide me with the final maceration and order confirmation.`;

    window.open(`https://wa.me/919345526905?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-[#FAF9F6] text-[#141414] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header / Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/60 bg-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#B8860B] animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#7A5B10] font-semibold">
              Personalised Fragrance Atelier
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#141414] tracking-wide leading-tight">
            Create Your Fragrance
          </h1>

          <p className="text-sm sm:text-base text-[#555555] font-light leading-relaxed">
            Build a fragrance that feels like you. Select up to three notes for each layer to create your signature formula, choose your luxury flacon, and let our master perfumer handcraft your one-of-one Extrait de Parfum.
          </p>
        </div>

        {/* Builder Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT 7 COLS: The Interactive Note & Flacon Builder */}
          <div className="lg:col-span-7 space-y-10">
            {/* 1. Flacon Selection */}
            <div className="bg-white rounded-2xl border border-[#EAE5DC] p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3E0] border border-[#DFC38A] text-[#7A5B10] flex items-center justify-center text-xs font-serif font-bold">
                    1
                  </span>
                  <h3 className="font-serif text-xl text-[#141414] font-medium">Choose Your Bottle Style</h3>
                </div>
                <span className="text-xs text-[#777777] font-light">Select 1</span>
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
                          ? 'border-[#B8860B] bg-[#FAF3E0]/30 shadow-md ring-1 ring-[#B8860B]'
                          : 'border-[#EAE5DC] hover:border-[#DFC38A] bg-white'
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-[#F7F5F0]">
                        <img src={bottle.image} alt={bottle.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-sm font-medium text-[#141414]">{bottle.name}</h4>
                          {isSelected && <Check className="w-4 h-4 text-[#B8860B]" />}
                        </div>
                        <p className="text-[11px] text-[#777777] font-light mt-1 line-clamp-2">
                          {bottle.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Volume & Bottle Engraving Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EAE5DC]">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#666666] mb-2 font-medium">
                    Volume Size
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedVolume('50ml')}
                      className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold tracking-wider transition-all ${
                        selectedVolume === '50ml'
                          ? 'bg-[#B8860B] text-white border-[#B8860B] shadow-sm'
                          : 'bg-white text-[#333333] border-[#EAE5DC] hover:border-[#B8860B]'
                      }`}
                    >
                      50 ml (₹2,499)
                    </button>
                    <button
                      onClick={() => setSelectedVolume('100ml')}
                      className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold tracking-wider transition-all ${
                        selectedVolume === '100ml'
                          ? 'bg-[#B8860B] text-white border-[#B8860B] shadow-sm'
                          : 'bg-white text-[#333333] border-[#EAE5DC] hover:border-[#B8860B]'
                      }`}
                    >
                      100 ml (₹3,499)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#666666] mb-2 font-medium">
                    Custom Bottle Engraving Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Signature Farhan Noir"
                    maxLength={28}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EAE5DC] rounded-lg focus:outline-none focus:border-[#B8860B] text-[#141414]"
                  />
                  <span className="text-[10px] text-[#888888] font-light mt-1 block">
                    Will be hand-engraved on the flacon plaque
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Top Notes Layer */}
            <div className="bg-white rounded-2xl border border-[#EAE5DC] p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3E0] border border-[#DFC38A] text-[#7A5B10] flex items-center justify-center text-xs font-serif font-bold">
                    2
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-[#141414] font-medium">Top Notes (The Opening)</h3>
                    <p className="text-xs text-[#777777] font-light">The immediate first impression (lasts 15-45 minutes)</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#B8860B] bg-[#FAF3E0] px-2.5 py-1 rounded-full border border-[#DFC38A]">
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
                          ? 'border-[#B8860B] bg-[#FAF3E0]/40 shadow-sm ring-1 ring-[#B8860B]'
                          : 'border-[#EAE5DC] hover:border-[#DFC38A] bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-[#141414]">{note.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-[#7A5B10] bg-[#FAF3E0] px-1.5 py-0.5 rounded">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666666] font-light mt-1">{note.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#B8860B] border-[#B8860B] text-white' : 'border-[#CCCCCC]'
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
            <div className="bg-white rounded-2xl border border-[#EAE5DC] p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3E0] border border-[#DFC38A] text-[#7A5B10] flex items-center justify-center text-xs font-serif font-bold">
                    3
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-[#141414] font-medium">Heart Notes (The Character)</h3>
                    <p className="text-xs text-[#777777] font-light">The core identity of your blend (lasts 3-6 hours)</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#B8860B] bg-[#FAF3E0] px-2.5 py-1 rounded-full border border-[#DFC38A]">
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
                          ? 'border-[#B8860B] bg-[#FAF3E0]/40 shadow-sm ring-1 ring-[#B8860B]'
                          : 'border-[#EAE5DC] hover:border-[#DFC38A] bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-[#141414]">{note.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-[#7A5B10] bg-[#FAF3E0] px-1.5 py-0.5 rounded">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666666] font-light mt-1">{note.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#B8860B] border-[#B8860B] text-white' : 'border-[#CCCCCC]'
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
            <div className="bg-white rounded-2xl border border-[#EAE5DC] p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3E0] border border-[#DFC38A] text-[#7A5B10] flex items-center justify-center text-xs font-serif font-bold">
                    4
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-[#141414] font-medium">Base Notes (The Sillage & Longevity)</h3>
                    <p className="text-xs text-[#777777] font-light">The foundation that projects for 18-24+ hours on skin and clothes</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#B8860B] bg-[#FAF3E0] px-2.5 py-1 rounded-full border border-[#DFC38A]">
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
                          ? 'border-[#B8860B] bg-[#FAF3E0]/40 shadow-sm ring-1 ring-[#B8860B]'
                          : 'border-[#EAE5DC] hover:border-[#DFC38A] bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-[#141414]">{note.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-[#7A5B10] bg-[#FAF3E0] px-1.5 py-0.5 rounded">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666666] font-light mt-1">{note.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#B8860B] border-[#B8860B] text-white' : 'border-[#CCCCCC]'
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
            <div className="bg-white rounded-3xl border border-[#EAE5DC] p-6 sm:p-8 shadow-luxury space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
                <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-[#B8860B] font-semibold">
                  <Award className="w-4 h-4 text-[#B8860B]" />
                  <span>Bespoke Formula Summary</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  35% Extrait
                </span>
              </div>

              {/* Live Flacon Image with Engraved Name */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7F5F0] border border-[#EAE5DC] flex items-center justify-center group">
                <img
                  src={selectedBottle.image}
                  alt={selectedBottle.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Simulated Custom Plaque Engraving */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#DFC38A] shadow-md text-center">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#7A5B10] block font-mono">
                    ALEEZ BESPOKE ATELIER
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-[#141414] truncate">
                    {customName.trim() || 'Your Signature Scent'}
                  </h4>
                  <span className="text-[10px] text-[#666666] font-light">
                    {selectedVolume} • Handcrafted Extrait de Parfum
                  </span>
                </div>
              </div>

              {/* Formulation Pyramid Overview */}
              <div className="space-y-3 bg-[#FAF9F6] border border-[#EAE5DC] rounded-xl p-4 text-xs">
                <div>
                  <span className="text-[#888888] font-mono uppercase text-[10px] block">Top Notes</span>
                  <span className="font-medium text-[#141414]">{selectedTopNotes.join(' • ')}</span>
                </div>
                <div className="border-t border-[#EAE5DC] pt-2">
                  <span className="text-[#888888] font-mono uppercase text-[10px] block">Heart Notes</span>
                  <span className="font-medium text-[#141414]">{selectedHeartNotes.join(' • ')}</span>
                </div>
                <div className="border-t border-[#EAE5DC] pt-2">
                  <span className="text-[#888888] font-mono uppercase text-[10px] block">Base Notes</span>
                  <span className="font-medium text-[#141414]">{selectedBaseNotes.join(' • ')}</span>
                </div>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="pt-2 border-t border-[#EAE5DC] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg text-[#141414]">Total Price</span>
                  <div className="text-right">
                    <span className="font-serif text-3xl font-bold text-[#B8860B]">
                      {formatPrice(price)}
                    </span>
                    <span className="text-[11px] text-[#777777] block font-light">
                      Includes custom compounding & bottle engraving
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full py-4 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-gold-sm transition-all duration-300 flex items-center justify-center space-x-2"
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
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs uppercase tracking-[0.18em] font-semibold rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Consult Master Perfumer on WhatsApp</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#555555] pt-2 border-t border-[#EAE5DC]">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>24+ Hours Projection</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Pure Organic Essences</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>100% Skin Safe</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
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
