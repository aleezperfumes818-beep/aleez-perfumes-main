import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCode, Image as ImageIcon, Type } from 'lucide-react';

export const LicensesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-black">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-black font-medium" aria-current="page">
          Intellectual Property & Asset Licensing
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold">
          Legal Compliance & Open Source Attributions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-black font-medium">
          Fonts, Images & Software Licensing Disclosures
        </h1>
        <p className="text-sm text-neutral-600 font-light max-w-2xl leading-relaxed">
          Aleez Perfumes is committed to rigorous legal integrity, intellectual property respect, and complete transparency. This document details the licensing agreements, open source attributions, and permissions governing all creative assets deployed across our online boutique.
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Typography & Fonts Licensing */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 text-black">
            <Type className="w-6 h-6" aria-hidden="true" />
            <h2 className="font-serif text-2xl text-black font-medium">1. Typography & Font Licenses</h2>
          </div>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            All typefaces utilized across the Aleez Perfumes digital platform are legally licensed under the Open Font License (OFL) or commercial open distribution permissions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                Primary Editorial Serif
              </span>
              <h3 className="font-serif text-lg text-black font-medium">Cormorant Garamond</h3>
              <p className="text-xs text-neutral-600 font-light">
                Designed by Christian Thalmann (Catharsis Fonts). Distributed via Google Fonts.
              </p>
              <div className="pt-2 text-[11px] font-mono text-neutral-700">
                License: SIL Open Font License, Version 1.1 (OFL-1.1)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                Modern Geometry UI Sans-Serif
              </span>
              <h3 className="font-sans text-lg text-black font-semibold">Plus Jakarta Sans</h3>
              <p className="text-xs text-neutral-600 font-light">
                Designed by Tokotype. Distributed via Google Fonts.
              </p>
              <div className="pt-2 text-[11px] font-mono text-neutral-700">
                License: SIL Open Font License, Version 1.1 (OFL-1.1)
              </div>
            </div>
          </div>
        </section>

        {/* 2. Visual Photography & Media Licensing */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 text-black">
            <ImageIcon className="w-6 h-6" aria-hidden="true" />
            <h2 className="font-serif text-2xl text-black font-medium">2. Photography & Cinematography Licenses</h2>
          </div>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            All photographic stills, editorial bottle captures, and video loops displayed across our storefront are either original custom assets produced by Aleez Perfumes or deployed under verified royalty-free commercial licenses:
          </p>

          <div className="space-y-3 pt-2 text-xs text-neutral-600 font-light">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <h3 className="font-medium text-black text-sm">Editorial Bottle & Fragrance Photography</h3>
              <p className="leading-relaxed">
                Images sourced via Unsplash and Pexels are used in compliance with the Unsplash License and Pexels Commercial Free License. These licenses grant an irrevocable, worldwide, non-exclusive copyright license to download, copy, modify, distribute, perform, and use photos for commercial purposes without attribution requirements.
              </p>
              <p className="text-[11px] text-neutral-500 pt-1">
                Photographers credited: Fulvio Ciccolo, Laura Chouette, Valeria Boltneva, and studio collaborators.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
              <h3 className="font-medium text-black text-sm">Cinematic Hero Video Footage</h3>
              <p className="leading-relaxed">
                The ambient macro fragrance video showcasing atmospheric perfume mist and botanical distillations is licensed for commercial digital web embedding under royalty-free creative licenses.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Iconography & Software Components */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 text-black">
            <FileCode className="w-6 h-6" aria-hidden="true" />
            <h2 className="font-serif text-2xl text-black font-medium">3. Iconography & Open Source Code</h2>
          </div>
          <div className="space-y-2 text-xs text-neutral-600 font-light leading-relaxed">
            <p>
              <strong>Lucide Icons:</strong> Lucide project icons are licensed under the ISC License (Open Source Software). Copyright (c) 2022-2026 Lucide Contributors.
            </p>
            <p>
              <strong>React & Tailwind CSS:</strong> Frontend interfaces are powered by React (MIT License) and Tailwind CSS (MIT License).
            </p>
            <p>
              <strong>Payment Gateway SDK:</strong> Razorpay Checkout JavaScript SDK is deployed under official merchant terms authorized by Razorpay Software Private Limited for secure PCI-DSS tokenized payment capture.
            </p>
          </div>
        </section>

        {/* 4. Trademark & Brand Asset Protection */}
        <section className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-black">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-serif text-lg text-black font-medium">Trademark Notice</h2>
          </div>
          <p className="text-xs text-neutral-600 font-light leading-relaxed">
            The brand name "Aleez Perfumes", the monogram logo, custom fragrance formula names (e.g. Royal Amber Royale, Velvet Oud Noir, Santal Imperial), and proprietary custom perfume atelier concepts are protected intellectual property of <strong>Aleez Perfumes & Fragrances Private Limited</strong>. All rights reserved. Third-party brand names mentioned as olfactory scent inspirations (e.g. Tom Ford, Baccarat Rouge) remain the exclusive registered trademarks of their respective luxury design houses and are cited purely for comparative olfactory characterization.
          </p>
        </section>
      </div>
    </div>
  );
};
