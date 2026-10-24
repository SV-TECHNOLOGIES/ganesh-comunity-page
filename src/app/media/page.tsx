'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Image as ImageIcon,
  Video,
  BookOpen,
  Download,
  Play,
  X,
  Calendar,
  MapPin,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Film,
  Eye,
  Loader2,
  Share2,
  Check,
  Lock,
  CheckSquare,
  Square,
  Archive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface EventAlbum {
  id: string;
  title: string;
  category: string;
  date: string;
  time?: string;
  venue: string;
  address?: string;
  description?: string;
  bannerUrl: string;
  featuredMediaUrl?: string;
  photosCount: number;
  videosCount: number;
  totalMediaCount: number;
  status?: string;
}

interface MediaItem {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  category: string;
  url: string;
  images?: string[];
  coverImage?: string | null;
  description?: string | null;
  eventId?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, isYouTubeUrl } from '@/lib/youtube';
import { getOptimizedImageUrl, getOriginalImageUrl } from '@/lib/image-utils';

// Thumbnails rendered inline on album cards; the full set lives in the album grid view
const CARD_STRIP_LIMIT = 4;
// Album grid renders strictly 10 photos per page for fast loading and balanced 2x5 grid
const ALBUM_PAGE_SIZE = 10;

const isExternalAlbum = (url: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('photos.app.goo.gl') || 
         lowerUrl.includes('photos.google.com') || 
         lowerUrl.includes('drive.google.com') ||
         lowerUrl.includes('dropbox.com') ||
         lowerUrl.includes('onedrive') ||
         lowerUrl.includes('sharepoint.com') ||
         lowerUrl.includes('icloud.com');
};


function MediaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeEventIdParam = searchParams?.get('event') || null;
  const activeTabParam = searchParams?.get('tab') || 'events';
  const activeAlbumIdParam = searchParams?.get('album') || null;

  const [topTab, setTopTab] = useState<'events' | 'patrika'>(
    activeTabParam === 'patrika' ? 'patrika' : 'events'
  );

  const [events, setEvents] = useState<EventAlbum[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Event & Media Filter within the event
  const [selectedEventId, setSelectedEventId] = useState<string | null>(activeEventIdParam);
  const [eventMediaFilter, setEventMediaFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');

  // Auth & Download state
  const { user, isLoggedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadingPhotoUrl, setDownloadingPhotoUrl] = useState<string | null>(null);
  const [downloadStatusMsg, setDownloadStatusMsg] = useState('');

  // Lightbox & Video Player Modal states
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activeGroupSubIndex, setActiveGroupSubIndex] = useState<number>(0);
  const [publicCardActiveIndex, setPublicCardActiveIndex] = useState<Record<string, number>>({});
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch from /api/media
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/media');
        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data.events || []);
          setMediaItems(json.data.mediaItems || []);
        }
      } catch (err) {
        console.error('Failed to load media data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    if (activeEventIdParam) {
      setSelectedEventId(activeEventIdParam);
    } else {
      setSelectedEventId(null);
    }
  }, [activeEventIdParam]);

  // Handler to open an event gallery
  const handleOpenEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventMediaFilter('ALL');
    router.push(`/media?event=${eventId}`);
  };

  // Handler to go back to all events
  const handleBackToEvents = () => {
    setSelectedEventId(null);
    router.push('/media');
  };

  // Currently opened event object
  const currentEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e.id === selectedEventId) || null;
  }, [selectedEventId, events]);

  // Media linked to currently opened event
  const currentEventMedia = useMemo(() => {
    if (!selectedEventId) return [];
    return mediaItems.filter((m) => m.eventId === selectedEventId);
  }, [selectedEventId, mediaItems]);

  // Filtered by type (Photos / Videos)
  const filteredMedia = useMemo(() => {
    if (eventMediaFilter === 'ALL') return currentEventMedia;
    return currentEventMedia.filter((m) => m.type === eventMediaFilter);
  }, [currentEventMedia, eventMediaFilter]);

  // Current list of photo items for lightbox navigation
  const eventPhotos = useMemo(() => {
    return currentEventMedia.filter((m) => m.type === 'IMAGE');
  }, [currentEventMedia]);

  // Album (grouped photo item) opened as a full grid via ?album=<mediaId>
  const openAlbum = useMemo(() => {
    if (!activeAlbumIdParam) return null;
    return eventPhotos.find((m) => m.id === activeAlbumIdParam) || null;
  }, [activeAlbumIdParam, eventPhotos]);

  const openAlbumImages = useMemo(() => {
    if (!openAlbum) return [];
    return openAlbum.images && openAlbum.images.length > 0 ? openAlbum.images : [openAlbum.url];
  }, [openAlbum]);

  // Album Grid Pagination (Strictly 10 photos per page for fast rendering and balanced 2x5 grid)
  const initialPage = useMemo(() => {
    const p = parseInt(searchParams?.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const [albumPage, setAlbumPage] = useState<number>(initialPage);
  const albumGridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = parseInt(searchParams?.get('page') || '1', 10);
    setAlbumPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams, activeAlbumIdParam]);

  const totalAlbumPages = Math.max(1, Math.ceil(openAlbumImages.length / ALBUM_PAGE_SIZE));
  const safeAlbumPage = Math.min(Math.max(albumPage, 1), totalAlbumPages);
  const pageStartIndex = (safeAlbumPage - 1) * ALBUM_PAGE_SIZE;
  const pageEndIndex = Math.min(pageStartIndex + ALBUM_PAGE_SIZE, openAlbumImages.length);

  const currentAlbumPageImages = useMemo(() => {
    return openAlbumImages.slice(pageStartIndex, pageEndIndex);
  }, [openAlbumImages, pageStartIndex, pageEndIndex]);

  const handlePageChange = (newPage: number) => {
    const clamped = Math.min(Math.max(newPage, 1), totalAlbumPages);
    setAlbumPage(clamped);
    router.push(`/media?event=${selectedEventId}&album=${openAlbum?.id}&page=${clamped}`, { scroll: false });
    if (albumGridTopRef.current) {
      albumGridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenAlbum = (mediaId: string, page = 1) => {
    setAlbumPage(page);
    router.push(`/media?event=${selectedEventId}&album=${mediaId}&page=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAlbum = () => {
    setActivePhotoIndex(null);
    setActiveGroupSubIndex(0);
    router.push(`/media?event=${selectedEventId}`);
  };

  // Lightbox navigation — when opened from an album grid, navigation stays inside that album
  const lightboxItem = activePhotoIndex !== null ? eventPhotos[activePhotoIndex] || null : null;
  const lightboxUrls = lightboxItem
    ? (lightboxItem.images && lightboxItem.images.length > 0 ? lightboxItem.images : [lightboxItem.url])
    : [];
  const lightboxSubIdx = lightboxUrls.length ? activeGroupSubIndex % lightboxUrls.length : 0;
  const canLightboxPrev = Boolean(lightboxItem) && (lightboxSubIdx > 0 || (!openAlbum && (activePhotoIndex ?? 0) > 0));
  const canLightboxNext = Boolean(lightboxItem) && (
    lightboxSubIdx < lightboxUrls.length - 1 || (!openAlbum && (activePhotoIndex ?? 0) < eventPhotos.length - 1)
  );

  const goLightboxPrev = () => {
    if (activePhotoIndex === null) return;
    if (lightboxSubIdx > 0) {
      setActiveGroupSubIndex(lightboxSubIdx - 1);
    } else if (!openAlbum && activePhotoIndex > 0) {
      setActivePhotoIndex(activePhotoIndex - 1);
      setActiveGroupSubIndex(0);
    }
  };

  const goLightboxNext = () => {
    if (activePhotoIndex === null) return;
    if (lightboxSubIdx < lightboxUrls.length - 1) {
      setActiveGroupSubIndex(lightboxSubIdx + 1);
    } else if (!openAlbum && activePhotoIndex < eventPhotos.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
      setActiveGroupSubIndex(0);
    }
  };

  const closeLightbox = () => {
    setActivePhotoIndex(null);
    setActiveGroupSubIndex(0);
  };

  // Keyboard navigation for the lightbox (useful when browsing 300+ photo albums)
  useEffect(() => {
    if (activePhotoIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goLightboxPrev();
      else if (e.key === 'ArrowRight') goLightboxNext();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleShareEvent = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadPhoto = async (photoUrl: string, title?: string, mediaId?: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    const rawUrl = getOriginalImageUrl(photoUrl);
    setDownloadingPhotoUrl(rawUrl);
    setDownloadStatusMsg(`Downloading "${title || 'photo'}"...`);

    try {
      const res = await fetch('/api/media/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: rawUrl,
          mediaId: mediaId || undefined,
        }),
      });

      if (res.status === 401) {
        setShowAuthModal(true);
        return;
      }

      if (!res.ok) {
        // Direct browser download fallback
        const a = document.createElement('a');
        a.href = rawUrl;
        a.target = '_blank';
        a.download = rawUrl.split('/').pop()?.split('?')[0] || `${(title || 'photo').replace(/[^a-zA-Z0-9_\-]/g, '_')}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadStatusMsg('Photo downloaded!');
        setTimeout(() => setDownloadStatusMsg(''), 2500);
        return;
      }

      const blob = await res.blob();
      const downloadBlobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadBlobUrl;
      const filename = rawUrl.split('/').pop()?.split('?')[0] || `${(title || 'photo').replace(/[^a-zA-Z0-9_\-]/g, '_')}.jpg`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadBlobUrl);

      setDownloadStatusMsg('Photo downloaded!');
      setTimeout(() => setDownloadStatusMsg(''), 2500);
    } catch (err: any) {
      // Direct browser fallback
      const a = document.createElement('a');
      a.href = rawUrl;
      a.target = '_blank';
      a.download = rawUrl.split('/').pop() || 'photo.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadStatusMsg('Photo downloaded!');
      setTimeout(() => setDownloadStatusMsg(''), 2500);
    } finally {
      setDownloadingPhotoUrl(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Top Main Header */}
      {!selectedEventId && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mitra-red/10 border border-mitra-gold/20 text-mitra-gold text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Media Archives &amp; Highlights</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Festival Memories &amp; Event Media
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Explore photo albums, live festival streams, high-energy teaser reels, and historic Kuchipudi recitals tagged across MITRA UK cultural events.
          </p>
        </div>
      )}

      {/* VIEW 0: OPENED ALBUM — full photo grid */}
      {selectedEventId && currentEvent && openAlbum ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            <button
              onClick={handleCloseAlbum}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-mitra-red hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="truncate max-w-[220px]">Back to {currentEvent.title}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleShareEvent}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-mitra-gold text-xs font-bold transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Album</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div ref={albumGridTopRef} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-mitra-gold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{openAlbumImages.length} High-Resolution Photos · 10 per page · {currentEvent.title}</span>
              </span>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Page {safeAlbumPage} of {totalAlbumPages}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{openAlbum.title}</h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing photos {pageStartIndex + 1}–{pageEndIndex} of {openAlbumImages.length}
              </span>
            </div>

            {openAlbum.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl">{openAlbum.description}</p>
            )}
          </div>

          {/* Top Pagination Controls */}
          {totalAlbumPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-5xl mx-auto">
              <button
                type="button"
                disabled={safeAlbumPage <= 1}
                onClick={() => handlePageChange(safeAlbumPage - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#E65C00] transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: totalAlbumPages }).map((_, pIdx) => {
                  const pNum = pIdx + 1;
                  const isCurrent = pNum === safeAlbumPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handlePageChange(pNum)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white shadow-md shadow-[#E65C00]/20 scale-105'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#E65C00]'
                      }`}
                      title={`Go to page ${pNum}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={safeAlbumPage >= totalAlbumPages}
                onClick={() => handlePageChange(safeAlbumPage + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#E65C00] transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Reduced Grid Size: Symmetrical 5-column layout (10 photos = exactly 2 rows of 5) with reduced 280px WebP fetch */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-5xl mx-auto w-full">
            {currentAlbumPageImages.map((imgUrl, idx) => {
              const globalIdx = pageStartIndex + idx;
              return (
                <button
                  key={`${imgUrl}-${globalIdx}`}
                  type="button"
                  onClick={() => {
                    setActivePhotoIndex(eventPhotos.findIndex((p) => p.id === openAlbum.id));
                    setActiveGroupSubIndex(globalIdx);
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-[#E65C00] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E65C00] transition-all cursor-pointer"
                  title={`View photo ${globalIdx + 1} of ${openAlbumImages.length}`}
                >
                  <img
                    src={getOptimizedImageUrl(imgUrl, 280, 65)}
                    alt={`${openAlbum.title} — photo ${globalIdx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <span className="text-[10px] font-bold text-white">#{globalIdx + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPhoto(imgUrl, `${openAlbum.title}_photo_${globalIdx + 1}`, openAlbum.id);
                        }}
                        className="w-6 h-6 rounded-md bg-black/60 hover:bg-[#E65C00] text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                        title="Download original photo"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </span>
                      <span className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/60 group-hover:opacity-0 text-white font-mono text-[8px] px-1 py-0.2 rounded transition-opacity">
                    {globalIdx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Pagination Controls */}
          {totalAlbumPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 max-w-5xl mx-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-bold text-slate-900 dark:text-white">{safeAlbumPage}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalAlbumPages}</span> ({openAlbumImages.length} total photos · 10/page)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeAlbumPage <= 1}
                  onClick={() => handlePageChange(safeAlbumPage - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#E65C00] transition-all shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev Page</span>
                </button>

                <button
                  type="button"
                  disabled={safeAlbumPage >= totalAlbumPages}
                  onClick={() => handlePageChange(safeAlbumPage + 1)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white text-xs font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-md"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : selectedEventId && currentEvent ? (
        <div className="space-y-8 animate-fadeIn">

          {/* Breadcrumbs / Back button & Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
            <button
              onClick={handleBackToEvents}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-mitra-red hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Albums</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* Share Button */}
              <button
                onClick={handleShareEvent}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-mitra-gold text-xs font-bold transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>



          {/* Media Category Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEventMediaFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${eventMediaFilter === 'ALL'
                    ? 'bg-mitra-red text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                All Media ({currentEventMedia.length})
              </button>

              <button
                onClick={() => setEventMediaFilter('IMAGE')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${eventMediaFilter === 'IMAGE'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos ({currentEvent.photosCount})</span>
              </button>

              <button
                onClick={() => setEventMediaFilter('VIDEO')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${eventMediaFilter === 'VIDEO'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videos ({currentEvent.videosCount})</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              Click any photo to open Lightbox, or play video reel
            </div>
          </div>

          {/* Media Items Masonry / Grid */}
          {filteredMedia.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 space-y-3">
              <Film className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                No media uploaded in this filter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Admin can add photos and videos for this event via the Admin Media Manager.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((item) => {
                if (item.type === 'VIDEO') {
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveVideo(item)}
                      className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:border-amber-500/50 transition-all flex flex-col"
                    >
                      {/* Video Thumbnail with Play Button */}
                      <div className="relative aspect-video bg-slate-950 overflow-hidden shrink-0">
                        <img
                          src={item.coverImage || (isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null) || '/assets/poster.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const ytThumb = isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null;
                            if (ytThumb && (e.target as HTMLImageElement).src !== ytThumb) {
                              (e.target as HTMLImageElement).src = ytThumb;
                            } else {
                              (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                        {/* Animated Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-mitra-red text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-white ml-1" />
                          </div>
                        </div>

                        {/* Video Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                            <Video className="w-3 h-3" />
                            <span>Video Reel</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mitra-red transition-colors">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 pt-3">
                          <Play className="w-3 h-3 fill-amber-500" />
                          <span>Watch Video</span>
                        </span>
                      </div>
                    </div>
                  );
                }

                // IMAGE CARD
                const isExt = isExternalAlbum(item.url);
                const photoIndex = eventPhotos.findIndex((p) => p.id === item.id);
                const itemImages = (item.images && item.images.length > 0) ? item.images : [item.url];
                const isGroup = itemImages.length > 1;
                const activeCardIdx = (publicCardActiveIndex[item.id] || 0) % itemImages.length;
                const activeCardUrl = itemImages[activeCardIdx] || item.coverImage || item.url;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isExt) {
                        window.open(item.url, '_blank');
                      } else if (isGroup) {
                        handleOpenAlbum(item.id);
                      } else {
                        setActivePhotoIndex(photoIndex >= 0 ? photoIndex : 0);
                        setActiveGroupSubIndex(activeCardIdx);
                      }
                    }}
                    className="group cursor-pointer bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col relative border-slate-200 dark:border-slate-800 hover:border-mitra-gold/50"
                  >
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden shrink-0">
                      <img
                        src={getOptimizedImageUrl(activeCardUrl || item.coverImage || (isExt ? '/assets/poster.jpg' : item.url), 600, 75)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap max-w-[70%]">
                        {isExt && (
                          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg border border-blue-400 uppercase tracking-widest">
                            <BookOpen className="w-3 h-3" />
                            <span>Media Album</span>
                          </span>
                        )}
                        {isGroup && (
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg border border-amber-300/30 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Group ({itemImages.length} Photos)</span>
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="inline-flex items-center gap-1 bg-mitra-gold text-mitra-navy text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-lg">
                            <Sparkles className="w-3 h-3" />
                            <span>Featured Highlight</span>
                          </span>
                        )}
                      </div>

                      {/* Floating Prev/Next arrows on preview for grouped photos */}
                      {isGroup && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPublicCardActiveIndex((prev) => ({
                                ...prev,
                                [item.id]: (activeCardIdx - 1 + itemImages.length) % itemImages.length,
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-[#E65C00] text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-95"
                            title="Previous photo in group"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPublicCardActiveIndex((prev) => ({
                                ...prev,
                                [item.id]: (activeCardIdx + 1) % itemImages.length,
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-[#E65C00] text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-95"
                            title="Next photo in group"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <div className="absolute bottom-3 right-3 z-10">
                            <span className="bg-black/75 backdrop-blur-md text-amber-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/10 shadow">
                              {activeCardIdx + 1} / {itemImages.length}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Quick Download Button */}
                      <div className="absolute top-3 right-3 z-10">
                        {!isExt && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPhoto(activeCardUrl || item.coverImage || item.url, item.title, item.id);
                            }}
                            className="w-8 h-8 rounded-full bg-black/60 hover:bg-[#E65C00] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md hover:scale-110"
                            title="Download original photo"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 text-white max-w-[70%]">
                        <span className="text-[10px] text-mitra-gold font-bold block">
                          {isExt ? 'Open External Album ↗' : (isGroup ? `Open album · ${itemImages.length} photos` : 'Click to enlarge')}
                        </span>
                        <h4 className="text-xs font-bold truncate">{item.title}</h4>
                      </div>
                    </div>

                    {/* Grouped Images Gallery Strip right on card */}
                    {isGroup && (
                      <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-b border-slate-200 dark:border-slate-800 px-3 py-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#E65C00] flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-[#E65C00]" />
                            <span>Group Gallery ({itemImages.length} Photos)</span>
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[9px]">
                            Photo {activeCardIdx + 1} of {itemImages.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                          {itemImages.slice(0, CARD_STRIP_LIMIT).map((imgUrl, gIdx) => {
                            const isCurrent = activeCardIdx === gIdx;
                            return (
                              <button
                                key={gIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPublicCardActiveIndex((prev) => ({ ...prev, [item.id]: gIdx }));
                                }}
                                className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 transition-all border ${
                                  isCurrent
                                    ? 'border-[#E65C00] ring-2 ring-[#E65C00] scale-105 shadow-md'
                                    : 'border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-400'
                                }`}
                                title={`Switch to photo ${gIdx + 1}`}
                              >
                                <img src={getOptimizedImageUrl(imgUrl, 200, 70)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                <span className={`absolute bottom-0 right-0 text-[8px] font-mono px-1 rounded-tl ${
                                  isCurrent ? 'bg-[#E65C00] text-white font-bold' : 'bg-black/80 text-white'
                                }`}>
                                  {gIdx + 1}
                                </span>
                              </button>
                            );
                          })}
                          {itemImages.length > CARD_STRIP_LIMIT && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAlbum(item.id);
                              }}
                              className="w-11 h-11 rounded-lg shrink-0 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#E65C00] text-[10px] font-black hover:border-[#E65C00]"
                              title="View all photos in this album"
                            >
                              +{itemImages.length - CARD_STRIP_LIMIT}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {item.description && (
                      <div className="p-3.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* VIEW 2: GRID OF EVENTS (Showing major main featured image) */
        <div className="space-y-6">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-mitra-gold animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading festival media albums...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No events with media albums yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => handleOpenEvent(evt.id)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-mitra-gold/50 transition-all flex flex-col"
                >
                  {/* Major Main Featured Image */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden shrink-0">
                    <img
                      src={evt.featuredMediaUrl || evt.bannerUrl || '/assets/poster.jpg'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Media Count Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{evt.photosCount} Photos</span>
                      </span>

                      {evt.videosCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/90 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow">
                          <Video className="w-3.5 h-3.5" />
                          <span>{evt.videosCount} Videos</span>
                        </span>
                      )}
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-mitra-red/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        {evt.category}
                      </span>
                    </div>

                    {/* Event Highlights bottom overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                      <div className="flex items-center gap-3 text-xs text-mitra-gold font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{evt.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-mitra-gold transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Description & CTA */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {evt.description || 'View official high-resolution photographs, cultural presentations, and video reels.'}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Total {evt.totalMediaCount} Media Assets
                      </span>

                      <div className="flex items-center gap-1 text-xs font-extrabold text-mitra-red dark:text-mitra-gold group-hover:translate-x-1 transition-transform">
                        <span>View All Photos &amp; Videos</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoIndex !== null && lightboxItem && (() => {
        const currentItem = lightboxItem;
        const groupUrls = lightboxUrls;
        const isGroup = groupUrls.length > 1;
        const currentSubIdx = lightboxSubIdx;
        const currentImgUrl = groupUrls[currentSubIdx] || currentItem.coverImage || currentItem.url;

        return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Lightbox Top Controls */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              {!openAlbum && <span className="font-bold">Photo {activePhotoIndex + 1} of {eventPhotos.length}</span>}
              {isGroup && (
                <span className="bg-[#E65C00] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Group Photo {currentSubIdx + 1} of {groupUrls.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadPhoto(currentImgUrl, `${currentItem.title || 'photo'}_${currentSubIdx + 1}`, currentItem.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow transition-all cursor-pointer"
                title="Download original full-resolution photo (MITRA Members Only)"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Photo</span>
              </button>
              <button
                onClick={() => {
                  if (currentImgUrl) window.open(currentImgUrl, '_blank');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                title="Open original uncompressed full-resolution photo (Opens in new tab)"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Original HD</span>
              </button>
              <button
                onClick={closeLightbox}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                title="Close Lightbox (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Image with Prev/Next Navigation */}
          <div className="relative flex-1 flex items-center justify-center py-4">
            {canLightboxPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goLightboxPrev();
                }}
                className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative max-w-5xl max-h-[72vh] w-full h-full flex items-center justify-center">
              <img
                src={getOptimizedImageUrl(currentImgUrl, 1400, 80)}
                alt={currentItem.title}
                className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {canLightboxNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goLightboxNext();
                }}
                className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Grouped thumbnails strip in lightbox */}
          {isGroup && (
            <div className={`flex items-center gap-2 overflow-x-auto py-2 z-10 w-full max-w-4xl mx-auto scrollbar-thin scrollbar-thumb-white/20 ${
              groupUrls.length > 10 ? 'justify-start' : 'justify-center'
            }`}>
              {groupUrls.map((gUrl, gIdx) => (
                <button
                  key={gIdx}
                  type="button"
                  ref={currentSubIdx === gIdx ? (el) => el?.scrollIntoView({ block: 'nearest', inline: 'center' }) : undefined}
                  onClick={() => setActiveGroupSubIndex(gIdx)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border transition-all ${
                    currentSubIdx === gIdx
                      ? 'border-[#E65C00] ring-2 ring-[#E65C00] scale-105 shadow-lg'
                      : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                  }`}
                  title={`View photo ${gIdx + 1}`}
                >
                  <img src={getOptimizedImageUrl(gUrl, 160, 65)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] text-white px-1 font-mono">
                    {gIdx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Lightbox Bottom Caption */}
          <div className="text-center text-white space-y-1 max-w-2xl mx-auto z-10 pb-2">
            <h4 className="text-sm sm:text-base font-bold text-mitra-gold">
              {currentItem.title}
            </h4>
            {currentItem.description && (
              <p className="text-xs text-slate-300">
                {currentItem.description}
              </p>
            )}
          </div>
        </div>
        );
      })()}

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Video Reel
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-xl">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {getYouTubeEmbedUrl(activeVideo.url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.url) || ''}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Caption */}
            {activeVideo.description && (
              <div className="p-4 bg-slate-900/80 text-xs text-slate-300">
                {activeVideo.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEMBER LOGIN REQUIRED MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mitra-red/10 text-mitra-red dark:text-mitra-gold text-[11px] font-black uppercase tracking-wider">
                Member Benefit
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Member Login Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Downloading original high-resolution photos and complete album ZIP packages is reserved for registered MITRA UK members.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-mitra-red to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-mitra-red/25 transition-all"
              >
                <span>Log In with Member Account</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/join"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold transition-all"
              >
                <span>Register for Free Membership</span>
              </Link>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Downloads are recorded to maintain photo library security and community integrity.
            </p>
          </div>
        </div>
      )}

      {/* FLOATING DOWNLOAD STATUS TOAST */}
      {(downloadingPhotoUrl || downloadStatusMsg) && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-950/95 border border-amber-500/40 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-slideUp">
          {downloadingPhotoUrl ? (
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {downloadingPhotoUrl ? 'Downloading Original Photo' : 'Download Complete'}
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              {downloadStatusMsg || 'Downloading high-resolution original...'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading festival media archives...</div>}>
      <MediaContent />
    </Suspense>
  );
}
