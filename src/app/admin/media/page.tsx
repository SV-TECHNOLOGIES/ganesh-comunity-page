'use client';

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/data-store';
import { MediaAlbum } from '@/lib/types';
import { Image as ImageIcon, BookOpen, Plus, Download, CheckCircle2 } from 'lucide-react';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaAlbum[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MediaAlbum['category']>('MITRA Patrika');
  const [description, setDescription] = useState('');

  useEffect(() => {
    DataStore.init();
    setMedia(DataStore.getMedia());
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Media Library & MITRA Patrika Publisher</h1>
        <p className="text-xs text-slate-400">
          Upload new Patrika PDF issues, souvenir archives, and manage photo/video galleries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {media.map((item) => (
          <div key={item.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex gap-4">
            <div className="w-20 h-24 rounded-xl bg-slate-900 overflow-hidden relative shrink-0 border border-slate-700">
              <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="bg-mitra-red/20 text-mitra-gold font-mono px-2 py-0.5 rounded text-[10px]">
                {item.category}
              </span>
              <h3 className="font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-[11px] line-clamp-2">{item.description}</p>
              <div className="pt-2 text-[10px] text-slate-500">Published on {item.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
