'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DataStore } from '@/lib/data-store';
import { BlogPost } from '@/lib/types';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    DataStore.init();
    setPosts(DataStore.getNews());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-ukta-red/10 text-ukta-red dark:bg-ukta-gold/10 dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Community News & Press
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Latest Announcements & News
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Official press releases, festival updates, and parliamentary commendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="relative h-56 w-full">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 bg-ukta-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {post.category}
              </span>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{post.date}</span>
                  <span>&bull; By {post.author}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-ukta-red dark:group-hover:text-ukta-gold transition-colors">
                  <Link href={`/news/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map((t, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
                <Link href={`/news/${post.slug}`} className="text-xs font-bold text-ukta-red dark:text-ukta-gold hover:underline flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
