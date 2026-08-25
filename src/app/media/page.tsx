'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { DataStore } from '@/lib/data-store';
import { MediaAlbum } from '@/lib/types';
import { Image as ImageIcon, Video, BookOpen, Download, Play, X } from 'lucide-react';

function MediaContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'photos';
  
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'patrika'>(
    initialTab === 'patrika' ? 'patrika' : initialTab === 'videos' ? 'videos' : 'photos'
  );
  
  const [mediaItems, setMediaItems] = useState<MediaAlbum[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    DataStore.init();
    setMediaItems(DataStore.getMedia());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-ukta-red/10 text-ukta-red dark:bg-ukta-gold/10 dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Media Archives
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Photo Gallery, Videos & UKTA Patrika
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Relive grand festival highlights, Guinness World Record performances, and download digital Patrika magazines.
        </p>
      </div>

      {/* Media Tabs */}
      <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-2 sm:gap-6">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'photos'
              ? 'bg-ukta-red text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Photo Gallery</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'videos'
              ? 'bg-ukta-red text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Gallery & YouTube</span>
        </button>

        <button
          onClick={() => setActiveTab('patrika')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'patrika'
              ? 'bg-ukta-navy text-ukta-gold border border-ukta-gold/40 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>UKTA Patrika & Souvenir (PDFs)</span>
        </button>
      </div>

      {/* Tab 1: Photo Lightbox Grid */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { title: 'Ugadi Celebrations London', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800' },
            { title: 'Kuchipudi Guinness World Record Ensemble', url: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&q=80&w=800' },
            { title: 'TTD Kalyanam Devotional Tour', url: 'https://images.unsplash.com/photo-1545232979-fbf34fe37b38?auto=format&fit=crop&q=80&w=800' },
            { title: 'Business Summit Networking Forum', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800' },
            { title: 'Nari Shakthi Women Workshop', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800' },
            { title: 'Annual Badminton Tournament', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhoto(item.url)}
              className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group shadow-md border border-slate-200 dark:border-slate-800"
            >
              <Image src={item.url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-extrabold">{item.title}</span>
                <span className="block text-[10px] text-ukta-gold">Click to open Lightbox</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Video Embeds */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: 'Guinness World Record Kuchipudi Highlights (London)', desc: 'Official video recording of 500+ dancers at Logan Hall.' },
            { title: 'TTD Celestial Srinivasa Kalyanam Highlights', desc: 'Devotional ceremonies across major UK cities.' }
          ].map((vid, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-ukta-gold/30 group">
                <Image src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800" alt="Video cover" fill className="object-cover opacity-70 group-hover:scale-105 transition-transform" />
                <div className="w-14 h-14 rounded-full bg-ukta-red text-white flex items-center justify-center shadow-2xl relative z-10">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{vid.title}</h3>
              <p className="text-xs text-slate-500">{vid.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: PDF Magazines */}
      {activeTab === 'patrika' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mediaItems.filter(m => m.category === 'UKTA Patrika' || m.category === 'UKTA Souvenir').map((pub) => (
            <div key={pub.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex gap-6 items-center">
              <div className="relative w-28 h-36 rounded-xl overflow-hidden shadow-md border border-ukta-gold shrink-0">
                <Image src={pub.coverImage} alt={pub.title} fill className="object-cover" />
              </div>
              <div className="space-y-2 flex-1">
                <span className="text-[10px] font-bold bg-ukta-navy text-ukta-gold px-2 py-0.5 rounded">
                  {pub.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pub.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{pub.description}</p>
                <button
                  onClick={() => alert(`Opening PDF viewer for ${pub.title}...`)}
                  className="bg-ukta-red hover:bg-ukta-red-dark text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Read / Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 text-white p-2">
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-4xl w-full h-[80vh]">
            <Image src={selectedPhoto} alt="Enlarged view" fill className="object-contain" />
          </div>
        </div>
      )}

    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading media archives...</div>}>
      <MediaContent />
    </Suspense>
  );
}
