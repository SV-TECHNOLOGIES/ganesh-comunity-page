'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';

export default function ChairmanMessagePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Chairman Message */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-mitra-gold shadow-md shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
              alt="Dr. Venkat S. Chary"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-bold text-mitra-red dark:text-mitra-gold uppercase tracking-wider block">Founder & Chairman Message</span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Dr. Venkat S. Chary
            </h1>
            <p className="text-xs text-slate-500 font-semibold">Founder President, Mana Indian Telugu Roots Abroad</p>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed relative">
          <Quote className="w-12 h-12 text-mitra-gold/20 absolute -top-4 -left-4 -z-0" />
          <p className="relative z-10">
            "Dear Community Members, Patrons, and Friends,
          </p>
          <p className="relative z-10">
            It gives me immense pride to welcome you to the redesigned digital home of the Mana Indian Telugu Roots Abroad. Over the past decade, our association has grown from a humble vision into a pillar of cultural unity and welfare across Great Britain.
          </p>
          <p className="relative z-10">
            Our commitment remains steadfast: preserving our rich Telugu language and classical arts for our youth, supporting international students navigating life in the UK, and stepping forward whenever a member of our community faces hardship.
          </p>
          <p className="relative z-10 font-bold text-slate-800 dark:text-slate-200">
            I invite every family, student, and professional to join hands with MITRA as we embark on our next decade of service."
          </p>
        </div>
      </div>

      {/* Prominent Message from 10 Downing Street */}
      <div className="bg-gradient-to-r from-mitra-navy to-slate-900 text-white rounded-3xl p-8 sm:p-12 border-2 border-mitra-gold shadow-2xl space-y-6">
        <span className="bg-mitra-gold text-mitra-navy text-[10px] font-black px-3 py-1 rounded-full uppercase">
          Prominent Message Spotlight
        </span>
        <h2 className="text-2xl font-black text-white">
          Message of Appreciation from 10 Downing Street
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          "The Prime Minister extends warmest greetings to the Mana Indian Telugu Roots Abroad. The contribution of the Telugu community in medicine, technology, finance, and the arts enriches the fabric of the United Kingdom. We commend MITRA for its leadership in cultural preservation and international student welfare."
        </p>
        <div className="text-xs text-mitra-gold font-mono pt-2 border-t border-white/10">
          — Office of the Prime Minister, London
        </div>
      </div>

    </div>
  );
}
