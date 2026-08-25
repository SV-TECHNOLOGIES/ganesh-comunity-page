'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DataStore } from '@/lib/data-store';
import { BlogPost } from '@/lib/types';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    DataStore.init();
    const found = DataStore.getNews().find(n => n.slug === slug);
    if (found) setPost(found);
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Article Not Found</h1>
        <Link href="/news" className="text-ukta-red underline text-xs font-bold">Back to News Hub</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link href="/news" className="inline-flex items-center gap-1 text-xs font-bold text-ukta-red dark:text-ukta-gold hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All News</span>
      </Link>

      <div className="space-y-4">
        <span className="bg-ukta-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-slate-500 border-y border-slate-100 dark:border-slate-800 py-3">
          <Calendar className="w-4 h-4 text-ukta-gold" />
          <span>Published on {post.date}</span>
          <span>&bull; Author: {post.author}</span>
        </div>
      </div>

      <div className="relative h-96 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 text-sm leading-relaxed space-y-4 whitespace-pre-line">
        {post.content}
      </div>
    </div>
  );
}
