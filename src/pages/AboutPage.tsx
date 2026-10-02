import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, Compass, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 text-[#141414]">
      {/* Brand Ethos Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B8860B] font-semibold">
          The Craft of Aleez
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-[#141414] font-medium leading-tight">
          Crafted For Every Moment. <br />
          <span className="italic text-[#B8860B] font-light">Designed For Distinction.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#4A4A4A] font-light leading-relaxed pt-2">
          Aleez Perfumes is an online fragrance atelier created out of a deep reverence for the artistry of perfume creation. We bring together rare botanical extracts, aged woods, and modern olfactory design to deliver scents that resonate intimately with the wearer.
        </p>
      </div>

      {/* Hero Visual */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#EAE5DC] shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1600&q=85"
          alt="Artisanal perfume ingredients and flacon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 max-w-xl">
          <p className="font-serif text-xl sm:text-2xl text-white">
            "Fragrance is the most intimate form of memory—an invisible aura that speaks before words are spoken."
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-white border border-[#EAE5DC] space-y-3 shadow-card">
          <Sparkles className="w-6 h-6 text-[#B8860B]" />
          <h3 className="font-serif text-xl text-[#141414] font-medium">Pure Concentrations</h3>
          <p className="text-xs text-[#555555] font-light leading-relaxed">
            Our formulations prioritize high-potency oil extracts and concentrated Eau de Parfum compositions engineered for natural projection and long-lasting sillage.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EAE5DC] space-y-3 shadow-card">
          <Compass className="w-6 h-6 text-[#B8860B]" />
          <h3 className="font-serif text-xl text-[#141414] font-medium">Artisanal Curation</h3>
          <p className="text-xs text-[#555555] font-light leading-relaxed">
            From rare Cambodian and Assam oud distillations to non-alcoholic floral attars, each creation is curated to meet exacting standards of olfactory harmony.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EAE5DC] space-y-3 shadow-card">
          <ShieldCheck className="w-6 h-6 text-[#B8860B]" />
          <h3 className="font-serif text-xl text-[#141414] font-medium">Direct & Transparent</h3>
          <p className="text-xs text-[#555555] font-light leading-relaxed">
            As an online-first fragrance house, we invest where it matters most: pristine ingredients, exquisite presentation, and direct customer care across India.
          </p>
        </div>
      </div>

      {/* Online Destination Positioning */}
      <div className="bg-[#FAF3E0] border border-[#DFC38A] rounded-2xl p-8 sm:p-12 space-y-6 text-center shadow-sm">
        <span className="text-xs uppercase tracking-[0.25em] text-[#7A5B10] font-semibold">
          Online Fragrance Atelier
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#141414] max-w-xl mx-auto font-medium">
          Experience Fine Fragrances At Your Doorstep
        </h2>
        <p className="text-sm text-[#444444] max-w-2xl mx-auto font-light leading-relaxed">
          Without the overhead of traditional retail showrooms, Aleez Perfumes delivers exceptional quality, custom presentation packaging, and express pan-India insured shipping directly to your hands.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#B8860B] hover:bg-[#9E7307] text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-lg shadow-gold-sm transition-all"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
