'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Loader2, 
  CheckCircle, 
  X, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Eye, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  Film, 
  Search,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Download,
  Archive,
  Users,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileText
} from 'lucide-react';
import { isYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';
import { getOptimizedImageUrl } from '@/lib/image-utils';
import { useAdminGlobalEvent } from '../admin-context';

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

interface EventOption {
  id: string;
  title: string;
  date: string;
  venue: string;
  bannerUrl: string;
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
  event?: EventOption | null;
}

interface DownloadLog {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  role: string | null;
  eventId: string | null;
  eventTitle: string | null;
  mediaId: string | null;
  mediaTitle: string | null;
  fileCount: number;
  downloadType: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface MediaFormData {
  title: string;
  type: 'IMAGE' | 'VIDEO';
  category: string;
  url: string;
  images: string[];
  coverImage: string;
  description: string;
  eventId: string;
  isFeatured: boolean;
  displayOrder: number;
}

// Parallel uploads for bulk album uploads (each upload opens its own SFTP session server-side)
const UPLOAD_CONCURRENCY = 4;
const UPLOAD_MAX_RETRIES = 2;
// Thumbnails rendered inline on album cards; the rest are summarised as "+N"
const CARD_STRIP_LIMIT = 12;
// Album thumbnails rendered per batch inside the edit modal
const MODAL_PAGE_SIZE = 48;

const initialFormData: MediaFormData = {
  title: '',
  type: 'IMAGE',
  category: 'Photo',
  url: '',
  images: [],
  coverImage: '',
  description: '',
  eventId: '',
  isFeatured: false,
  displayOrder: 0,
};

export default function AdminMediaPage() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'downloads'>('gallery');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMedia: 0,
    totalPhotos: 0,
    totalVideos: 0,
    totalEventsCovered: 0,
  });

  // Track active preview image for grouped gallery cards
  const [cardActiveIndex, setCardActiveIndex] = useState<Record<string, number>>({});

  const getItemImages = (item: MediaItem): string[] => {
    if (Array.isArray(item.images) && item.images.length > 0) return item.images;
    if (item.url && (item.url.includes(',') || item.url.includes('\n'))) {
      return item.url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    }
    return item.url ? [item.url] : [];
  };

  // Download Logs & Member Tracking State
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  const [downloadStats, setDownloadStats] = useState({
    totalDownloads: 0,
    totalFilesDownloaded: 0,
    uniqueUsersCount: 0,
  });
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [downloadSearchQuery, setDownloadSearchQuery] = useState('');

  // Filters
  const { globalEventId: selectedEventFilter, setGlobalEventId: setSelectedEventFilter } = useAdminGlobalEvent();
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drag-and-Drop & Reorder State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);

  // Modal & Edit State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [formData, setFormData] = useState<MediaFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // FTP Upload State (matching Profile Photo Upload pattern)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ done: 0, failed: 0, total: 0 });
  const [uploadFailures, setUploadFailures] = useState<{ file: File; error: string }[]>([]);
  const [modalVisibleCount, setModalVisibleCount] = useState(MODAL_PAGE_SIZE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Album pre-caching state & modal preview/delete toggles
  const [cachingAlbumId, setCachingAlbumId] = useState<string | null>(null);
  const [cacheToastMsg, setCacheToastMsg] = useState<string>('');
  const [showModalPreviews, setShowModalPreviews] = useState<boolean>(true);
  const [enableDeleteMode, setEnableDeleteMode] = useState<boolean>(false);

  const handleCacheAlbum = async (albumId: string, albumTitle: string) => {
    setCachingAlbumId(albumId);
    setCacheToastMsg(`Caching & optimizing "${albumTitle}" in the background...`);

    try {
      const res = await fetch('/api/admin/media/cache-album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId }),
      });
      const data = await res.json();
      if (data.success) {
        setCacheToastMsg(`✓ Successfully cached ${data.data?.cachedCount || 0} images for "${albumTitle}"!`);
      } else {
        setCacheToastMsg(`Failed to cache: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setCacheToastMsg(`Error: ${err?.message || 'Network error'}`);
    } finally {
      setCachingAlbumId(null);
      setTimeout(() => setCacheToastMsg(''), 5000);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const json = await res.json();
      if (json.success && json.data) {
        setMediaItems(json.data.mediaItems || []);
        setEvents(json.data.events || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching admin media:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadLogs = async () => {
    setLoadingDownloads(true);
    try {
      const params = new URLSearchParams();
      if (downloadSearchQuery.trim()) params.set('q', downloadSearchQuery.trim());
      if (selectedEventFilter && selectedEventFilter !== 'all') params.set('eventId', selectedEventFilter);
      const res = await fetch(`/api/admin/media/downloads?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDownloadLogs(json.data.logs || []);
        if (json.data.stats) {
          setDownloadStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching download logs:', err);
    } finally {
      setLoadingDownloads(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    if (activeTab === 'downloads') {
      fetchDownloadLogs();
    }
  }, [activeTab, selectedEventFilter]);

  const openCreateModal = (defaultEventId?: string) => {
    setEditingItem(null);
    setUploadSuccessMsg('');
    setUploadProgressMsg('');
    setUploadFailures([]);
    setModalVisibleCount(MODAL_PAGE_SIZE);
    setEnableDeleteMode(false);
    setShowModalPreviews(true);
    setFormData({
      ...initialFormData,
      images: [],
      eventId: defaultEventId || (events[0]?.id || ''),
    });
    setModalOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setUploadSuccessMsg('');
    setUploadProgressMsg('');
    setUploadFailures([]);
    setModalVisibleCount(MODAL_PAGE_SIZE);
    setEnableDeleteMode(false);
    const itemImages = getItemImages(item);
    setShowModalPreviews(itemImages.length <= 150);
    setFormData({
      title: item.title,
      type: item.type || 'IMAGE',
      category: item.category || (item.type === 'VIDEO' ? 'Video' : 'Photo'),
      url: item.url || '',
      images: itemImages,
      coverImage: item.coverImage || item.url || '',
      description: item.description || '',
      eventId: item.eventId || '',
      isFeatured: Boolean(item.isFeatured),
      displayOrder: item.displayOrder || 0,
    });
    setModalOpen(true);
  };

  const uploadSingleFile = async (file: File, identifier: string): Promise<string> => {
    let lastError = 'Upload failed';
    for (let attempt = 0; attempt <= UPLOAD_MAX_RETRIES; attempt++) {
      try {
        const body = new FormData();
        body.append('file', file);
        body.append('useCase', 'media_gallery');
        body.append('identifier', identifier);

        const res = await fetch('/api/upload', { method: 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (data.success && data.url) return data.url;
        lastError = data.error || `HTTP ${res.status}`;
        // Validation errors (bad type / too large) will not succeed on retry
        if (res.status === 400 || res.status === 401) break;
      } catch (err: any) {
        lastError = err?.message || 'Network error';
      }
      if (attempt < UPLOAD_MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    throw new Error(lastError);
  };

  // Uploads files with a small concurrency pool so large batches (300+ photos) finish quickly.
  // Each URL is appended to the album as soon as it lands, so a partial failure never loses completed uploads.
  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;

    setUploadingImage(true);
    setUploadSuccessMsg('');
    setUploadFailures([]);
    setUploadProgress({ done: 0, failed: 0, total: files.length });
    setUploadProgressMsg(`Uploading 0 of ${files.length}...`);

    const identifier = formData.title || 'media_asset';
    // Keep upload order stable: slot results by index, then append in order at the end
    const results: (string | null)[] = new Array(files.length).fill(null);
    const failures: { file: File; error: string }[] = [];
    let done = 0;
    let nextIndex = 0;

    const appendUrls = (urls: string[]) => {
      if (!urls.length) return;
      setFormData((prev) => {
        const existingImages = prev.images && prev.images.length > 0
          ? prev.images
          : (prev.url ? prev.url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean) : []);
        const combined = [...existingImages, ...urls.filter((u) => !existingImages.includes(u))];
        return {
          ...prev,
          images: combined,
          url: combined.join(',\n'),
          coverImage: prev.coverImage || combined[0] || '',
        };
      });
    };

    const worker = async () => {
      while (nextIndex < files.length) {
        const i = nextIndex++;
        const file = files[i];
        try {
          results[i] = await uploadSingleFile(file, identifier);
        } catch (err: any) {
          failures.push({ file, error: err?.message || 'Upload failed' });
        }
        done++;
        setUploadProgress({ done, failed: failures.length, total: files.length });
        setUploadProgressMsg(`Uploading ${done} of ${files.length}${failures.length ? ` (${failures.length} failed)` : ''}...`);
      }
    };

    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker));

    const uploadedUrls = results.filter((u): u is string => Boolean(u));
    appendUrls(uploadedUrls);

    setUploadFailures(failures);
    setUploadProgressMsg('');
    if (uploadedUrls.length > 0) {
      setUploadSuccessMsg(
        `Uploaded ${uploadedUrls.length} of ${files.length} file(s)${failures.length ? ` — ${failures.length} failed, retry below` : ''}.`
      );
    } else {
      setUploadSuccessMsg('');
    }

    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(e.target.files || []));
  };

  const handleRetryFailedUploads = () => {
    uploadFiles(uploadFailures.map((f) => f.file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide a title for this media item.');
      return;
    }

    const rawUrls = formData.images && formData.images.length > 0
      ? formData.images
      : formData.url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);

    if (rawUrls.length === 0) {
      alert('Please upload a file or enter a direct media URL.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...(editingItem ? { id: editingItem.id } : {}),
        ...formData,
        url: rawUrls[0],
        images: rawUrls,
        coverImage: formData.coverImage || rawUrls[0],
      };

      const res = await fetch('/api/admin/media', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setModalOpen(false);
      fetchMedia();
    } catch (err: any) {
      alert(`Error saving media: ${err?.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchMedia();
      } else {
        alert(data.error || 'Failed to delete media item.');
      }
    } catch (err: any) {
      alert(`Error deleting: ${err?.message}`);
    }
  };

  // Filtered & Sorted Media
  const filteredItems = useMemo(() => {
    return mediaItems
      .filter((item) => {
        if (selectedEventFilter !== 'all') {
          if (selectedEventFilter === 'unassigned') {
            if (item.eventId) return false;
          } else if (item.eventId !== selectedEventFilter) {
            return false;
          }
        }
        if (selectedTypeFilter !== 'all' && item.type !== selectedTypeFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title?.toLowerCase().includes(q);
          const matchesDesc = item.description?.toLowerCase().includes(q);
          const matchesEvent = item.event?.title?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesEvent) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [mediaItems, selectedEventFilter, selectedTypeFilter, searchQuery]);

  // Batch persist reordered items to DB
  const persistOrder = async (updatedList: MediaItem[]) => {
    setIsSavingOrder(true);
    setReorderNotice('Saving updated media order...');
    try {
      const payload = updatedList.map((item, idx) => ({
        id: item.id,
        displayOrder: idx + 1,
      }));

      const res = await fetch('/api/admin/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setReorderNotice('✓ Media order updated and saved in database!');
        setTimeout(() => setReorderNotice(null), 3000);
      } else {
        setReorderNotice('Failed to save order in database.');
        setTimeout(() => setReorderNotice(null), 3000);
      }
    } catch (err) {
      console.error('Error saving reorder:', err);
      setReorderNotice('Network error saving order.');
      setTimeout(() => setReorderNotice(null), 3000);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Move front (earlier / left) or back (later / right)
  const handleMove = (filteredIdx: number, direction: 'prev' | 'next') => {
    const targetIdx = direction === 'prev' ? filteredIdx - 1 : filteredIdx + 1;
    if (targetIdx < 0 || targetIdx >= filteredItems.length) return;

    const newFiltered = [...filteredItems];
    const [moved] = newFiltered.splice(filteredIdx, 1);
    newFiltered.splice(targetIdx, 0, moved);

    const updatedFiltered = newFiltered.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    const updatedMap = new Map(updatedFiltered.map((m) => [m.id, m]));
    const updatedAll = mediaItems.map((m) => updatedMap.get(m.id) || m);

    setMediaItems(updatedAll);
    persistOrder(updatedFiltered);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFiltered = [...filteredItems];
    const [moved] = newFiltered.splice(draggedIndex, 1);
    newFiltered.splice(dropIndex, 0, moved);

    const updatedFiltered = newFiltered.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    const updatedMap = new Map(updatedFiltered.map((m) => [m.id, m]));
    const updatedAll = mediaItems.map((m) => updatedMap.get(m.id) || m);

    setMediaItems(updatedAll);
    setDraggedIndex(null);
    setDragOverIndex(null);
    persistOrder(updatedFiltered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Inline order input direct edit
  const handleInlineOrderChange = async (id: string, newOrder: number) => {
    const updatedAll = mediaItems.map((item) =>
      item.id === id ? { ...item, displayOrder: newOrder } : item
    );
    updatedAll.sort((a, b) => a.displayOrder - b.displayOrder);
    setMediaItems(updatedAll);

    try {
      await fetch('/api/admin/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id, displayOrder: newOrder }] }),
      });
      setReorderNotice(`✓ Order updated to ${newOrder}!`);
      setTimeout(() => setReorderNotice(null), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E65C00]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E0] border border-[#E65C00]/30 text-[#E65C00] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Media & Gallery CMS</span>
          </div>
          <h1 className="text-3xl font-black text-[#3D1A00]">Media Manager</h1>
          <p className="text-xs text-[#6B3A2A] mt-1">
            Add event photos, teaser reels, and videos. Files upload directly via SiteGround FTP or link to external URLs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/media"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E65C00]/25 hover:border-[#E65C00]/50 text-[#3D1A00] hover:bg-[#FFF5EB] text-xs font-bold transition-colors bg-white shadow-xs"
          >
            <Eye className="w-4 h-4 text-[#E65C00]" />
            <span>View Public /media</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FF7A00] to-[#E65C00] hover:from-[#E65C00] hover:to-[#CC4000] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#E65C00]/20 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Media</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E65C00]/20 pb-1">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-[#E65C00] text-white shadow-md shadow-[#E65C00]/25'
              : 'bg-white text-[#6B3A2A] hover:bg-[#FFF5EB] border border-[#E65C00]/20'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Media Library &amp; Albums</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'gallery' ? 'bg-white/20' : 'bg-[#FFF0E0] text-[#E65C00]'}`}>
            {mediaItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'downloads'
              ? 'bg-[#E65C00] text-white shadow-md shadow-[#E65C00]/25'
              : 'bg-white text-[#6B3A2A] hover:bg-[#FFF5EB] border border-[#E65C00]/20'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Member Download Activity &amp; Logs</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'downloads' ? 'bg-white/20' : 'bg-[#FFF0E0] text-[#E65C00]'}`}>
            {downloadStats.totalDownloads}
          </span>
        </button>
      </div>

      {activeTab === 'gallery' && (
        <>
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B3A2A]">Total Media</div>
          <div className="text-2xl font-black text-[#3D1A00] mt-1">{stats.totalMedia}</div>
          <div className="text-[10px] text-[#8C6D62] mt-0.5">Photos &amp; Video assets</div>
        </div>

        <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Photos / Images</span>
          </div>
          <div className="text-2xl font-black text-[#3D1A00] mt-1">{stats.totalPhotos}</div>
          <div className="text-[10px] text-[#8C6D62] mt-0.5">Gallery pictures</div>
        </div>

        <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-amber-600" />
            <span>Videos & Reels</span>
          </div>
          <div className="text-2xl font-black text-[#3D1A00] mt-1">{stats.totalVideos}</div>
          <div className="text-[10px] text-[#8C6D62] mt-0.5">Teasers &amp; YouTube clips</div>
        </div>

        <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#E65C00] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E65C00]" />
            <span>Events Tagged</span>
          </div>
          <div className="text-2xl font-black text-[#3D1A00] mt-1">{stats.totalEventsCovered}</div>
          <div className="text-[10px] text-[#8C6D62] mt-0.5">Events with albums</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8C6D62] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, caption, event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#3D1A00] placeholder-[#8C6D62] focus:outline-none focus:border-[#E65C00] focus:bg-white"
            />
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#E65C00]" />
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00] focus:bg-white"
            >
              <option value="all">All Events ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.date})
                </option>
              ))}
              <option value="unassigned">General / Unassigned</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00] focus:bg-white"
          >
            <option value="all">All Types</option>
            <option value="IMAGE">Photos Only</option>
            <option value="VIDEO">Videos Only</option>
          </select>
        </div>

        <div className="text-xs text-[#6B3A2A] shrink-0">
          Showing <span className="font-bold text-[#E65C00]">{filteredItems.length}</span> of {mediaItems.length} items
        </div>
      </div>

      {/* Media Items Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-mitra-gold animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading media library from database...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 border-dashed rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No media items found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No photos or videos match your filter criteria. Add media items tagged with an event to populate this gallery.
            </p>
          </div>
          <button
            onClick={() => openCreateModal(selectedEventFilter !== 'all' ? selectedEventFilter : undefined)}
            className="inline-flex items-center gap-2 bg-mitra-red hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Media Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reordering Tip Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-950/80 border border-slate-800/80 px-4 py-2.5 rounded-2xl text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-mitra-gold shrink-0" />
              <span>
                <strong className="text-slate-200">Reordering:</strong> Drag cards or click <strong className="text-mitra-gold">◀ / ▶</strong> to move items front or back. Click number to type order directly.
              </span>
            </div>
            {isSavingOrder && (
              <div className="flex items-center gap-1.5 text-mitra-gold text-xs font-bold animate-pulse shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to DB...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => {
              const groupImages = getItemImages(item);
              const isGroup = groupImages.length > 1;
              const activeIdx = (cardActiveIndex[item.id] || 0) % (groupImages.length || 1);
              const activeImgUrl = groupImages[activeIdx] || item.coverImage || item.url;

              return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-slate-950 border rounded-3xl overflow-hidden group transition-all flex flex-col relative select-none ${
                  dragOverIndex === idx
                    ? 'border-mitra-gold ring-2 ring-mitra-gold scale-[1.02] shadow-2xl bg-mitra-gold/10'
                    : draggedIndex === idx
                    ? 'opacity-40 border-dashed border-mitra-gold'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail / Media Preview */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0 cursor-grab active:cursor-grabbing">
                  {isExternalAlbum(item.url) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                      <ExternalLink className="w-8 h-8 mb-2 text-mitra-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center px-4">External Link<br/>(Google Drive/Photos)</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={getOptimizedImageUrl(activeImgUrl, 400, 65) || (isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null) || '/assets/poster.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                        onError={(e) => {
                          const ytThumb = isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null;
                          if (ytThumb && (e.target as HTMLImageElement).src !== ytThumb) {
                            (e.target as HTMLImageElement).src = ytThumb;
                          } else {
                            (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </>
                  )}

                  {/* Drag Handle Indicator */}
                  <div 
                    className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white px-2 py-1 rounded-xl shadow cursor-grab active:cursor-grabbing text-[10px] font-bold transition-transform group-hover:scale-105"
                    title="Drag card to move front or back"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-mitra-gold" />
                    <span>Drag</span>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%]">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow ${
                        item.type === 'VIDEO'
                          ? 'bg-amber-500/90 text-slate-950'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      {item.type === 'VIDEO' ? (
                        <>
                          <Video className="w-3 h-3" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3" />
                          <span>Photo</span>
                        </>
                      )}
                    </span>

                    {/* Group Badge */}
                    {isGroup && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-amber-300/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Group ({groupImages.length} Photos)</span>
                      </span>
                    )}

                    {item.isFeatured && (
                      <span className="inline-flex items-center gap-1 bg-mitra-gold text-mitra-navy text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Grouped photo prev/next floating buttons right on the preview */}
                  {isGroup && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardActiveIndex((prev) => ({
                            ...prev,
                            [item.id]: (activeIdx - 1 + groupImages.length) % groupImages.length,
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
                          setCardActiveIndex((prev) => ({
                            ...prev,
                            [item.id]: (activeIdx + 1) % groupImages.length,
                          }));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-[#E65C00] text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-95"
                        title="Next photo in group"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Photo indicator badge */}
                      <div className="absolute bottom-2 right-3 z-10">
                        <span className="bg-black/75 backdrop-blur-md text-amber-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/10 shadow">
                          {activeIdx + 1} / {groupImages.length}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Video Play Overlay if video */}
                  {item.type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-mitra-red/90 text-white flex items-center justify-center shadow-xl">
                        <Film className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Event Name Overlay at bottom */}
                  <div className="absolute bottom-2 left-3 text-white pointer-events-none max-w-[70%]">
                    <span className="text-[10px] font-bold text-mitra-gold flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.event?.title || 'General / Unassigned'}</span>
                    </span>
                  </div>
                </div>

                {/* Grouped Images Gallery Strip right here on the card */}
                {isGroup && (
                  <div className="bg-slate-900/90 border-t border-b border-slate-800 px-3 py-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-amber-400" />
                        <span>Group Gallery ({groupImages.length} Photos)</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[9px]">
                        Photo {activeIdx + 1} of {groupImages.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-700">
                      {groupImages.length > CARD_STRIP_LIMIT && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                          className="order-last w-11 h-11 rounded-lg shrink-0 border border-slate-700 bg-slate-950 text-amber-400 text-[10px] font-black hover:border-[#E65C00]"
                          title="Open album to manage all photos"
                        >
                          +{groupImages.length - CARD_STRIP_LIMIT}
                        </button>
                      )}
                      {groupImages.slice(0, CARD_STRIP_LIMIT).map((imgUrl, gIdx) => {
                        const isCurrent = activeIdx === gIdx;
                        return (
                          <button
                            key={gIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardActiveIndex((prev) => ({ ...prev, [item.id]: gIdx }));
                            }}
                            className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 transition-all border ${
                              isCurrent
                                ? 'border-[#E65C00] ring-2 ring-[#E65C00] scale-105 shadow-md'
                                : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                            }`}
                            title={`Switch to photo ${gIdx + 1}`}
                          >
                            <img src={getOptimizedImageUrl(imgUrl, 160, 60)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            <span className={`absolute bottom-0 right-0 text-[8px] font-mono px-1 rounded-tl ${
                              isCurrent ? 'bg-[#E65C00] text-white font-bold' : 'bg-black/80 text-slate-300'
                            }`}>
                              {gIdx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-mitra-gold transition-colors">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    ) : (
                      <p className="text-xs text-slate-600 italic">No description provided</p>
                    )}
                  </div>

                  {/* URL preview & Interactive Order Control */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="truncate max-w-[130px] font-mono text-[10px] text-slate-400" title={item.url}>
                      {item.url.startsWith('https://media.mitrauk.com') ? 'FTP: ' + item.url.split('/').pop() : item.url}
                    </span>

                    {/* Interactive Reorder Bar */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 shadow-inner shrink-0">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                        Order:
                      </label>
                      <input
                        type="number"
                        value={item.displayOrder}
                        onChange={(e) => handleInlineOrderChange(item.id, Number(e.target.value))}
                        className="w-11 bg-slate-950 text-mitra-gold font-bold text-center text-xs rounded-lg border border-slate-700 py-0.5 focus:border-mitra-gold focus:outline-none"
                        title="Type order number directly"
                      />
                      <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1">
                        <button
                          type="button"
                          disabled={idx === 0 || isSavingOrder}
                          onClick={() => handleMove(idx, 'prev')}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                          title="Move Front (Earlier in gallery)"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredItems.length - 1 || isSavingOrder}
                          onClick={() => handleMove(idx, 'next')}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                          title="Move Back (Later in gallery)"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-mitra-gold" />
                      <span>Edit</span>
                    </button>
                    {isGroup && (
                      <button
                        type="button"
                        onClick={() => handleCacheAlbum(item.id, item.title)}
                        disabled={cachingAlbumId === item.id}
                        className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-600 text-amber-400 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs font-bold"
                        title="Pre-cache & optimize all photos in this album"
                      >
                        {cachingAlbumId === item.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="hidden sm:inline text-[10px]">Caching...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Pre-cache</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

      {/* Member Download Activity & Audit Logs Tab */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          {/* Download Tracking KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B3A2A] flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Total Downloads</span>
              </div>
              <div className="text-2xl font-black text-[#3D1A00] mt-1">{downloadStats.totalDownloads}</div>
              <div className="text-[10px] text-[#8C6D62] mt-0.5">Sessions logged</div>
            </div>

            <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Files Delivered</span>
              </div>
              <div className="text-2xl font-black text-[#3D1A00] mt-1">{downloadStats.totalFilesDownloaded}</div>
              <div className="text-[10px] text-[#8C6D62] mt-0.5">High-res photos downloaded</div>
            </div>

            <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Active Downloaders</span>
              </div>
              <div className="text-2xl font-black text-[#3D1A00] mt-1">{downloadStats.uniqueUsersCount}</div>
              <div className="text-[10px] text-[#8C6D62] mt-0.5">Unique registered members</div>
            </div>

            <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Access Security</span>
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
              <div className="text-[10px] text-[#8C6D62] mt-0.5">Authenticated member access</div>
            </div>
          </div>

          {/* Download Logs Search & Filter Bar */}
          <div className="bg-white border border-[#E65C00]/20 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#8C6D62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by member name, email, event title..."
                  value={downloadSearchQuery}
                  onChange={(e) => setDownloadSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchDownloadLogs()}
                  className="w-full bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#3D1A00] placeholder-[#8C6D62] focus:outline-none focus:border-[#E65C00] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#E65C00]" />
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="bg-[#FFF9F5] border border-[#E65C00]/20 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00] focus:bg-white"
                >
                  <option value="all">All Events ({events.length})</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.date})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchDownloadLogs}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF5EB] hover:bg-[#FFE8D6] text-[#E65C00] text-xs font-bold transition-colors cursor-pointer"
                title="Refresh audit logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDownloads ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="text-xs text-[#6B3A2A] shrink-0">
              Showing <span className="font-bold text-[#E65C00]">{downloadLogs.length}</span> audit records
            </div>
          </div>

          {/* Download Logs Table */}
          {loadingDownloads ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E65C00]/20">
              <Loader2 className="w-8 h-8 text-[#E65C00] animate-spin mx-auto" />
              <p className="text-xs text-[#6B3A2A]">Retrieving member download history...</p>
            </div>
          ) : downloadLogs.length === 0 ? (
            <div className="bg-white border border-[#E65C00]/20 border-dashed rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF5EB] text-[#E65C00] flex items-center justify-center mx-auto">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#3D1A00]">No download activity recorded yet</h3>
              <p className="text-xs text-[#6B3A2A] max-w-md mx-auto">
                Whenever registered members download single photos or album ZIP archives from the public media page, their account details and download timestamp will be securely logged and listed here.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E65C00]/20 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF9F5] border-b border-[#E65C00]/20 text-[#6B3A2A] uppercase text-[10px] tracking-wider font-extrabold">
                    <tr>
                      <th className="py-3 px-4">Member / User</th>
                      <th className="py-3 px-4">Event Album</th>
                      <th className="py-3 px-4">Download Format</th>
                      <th className="py-3 px-4 text-center">Files</th>
                      <th className="py-3 px-4">Asset Details</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E65C00]/10 text-[#3D1A00]">
                    {downloadLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#FFFDFB] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E65C00] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                              {(log.userName || log.userEmail || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs truncate">{log.userName || 'Member'}</span>
                                {log.role && (
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                                    log.role === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {log.role}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#8C6D62] truncate">{log.userEmail || 'No email'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium">
                          <div className="truncate max-w-[200px]" title={log.eventTitle || 'General'}>
                            {log.eventTitle || '—'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {log.downloadType === 'ZIP' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                              <Archive className="w-3 h-3 text-purple-600" />
                              <span>ZIP Archive</span>
                            </span>
                          ) : log.downloadType === 'ALBUM' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                              <Archive className="w-3 h-3 text-blue-600" />
                              <span>Full Album ZIP</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <ImageIcon className="w-3 h-3 text-emerald-600" />
                              <span>Single Photo</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#FFF0E0] text-[#E65C00]">
                            {log.fileCount} {log.fileCount === 1 ? 'file' : 'files'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#6B3A2A] max-w-[180px] truncate" title={log.mediaTitle || 'Batch download'}>
                          {log.mediaTitle || 'Multiple event photos'}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-[#6B3A2A] whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#8C6D62]" />
                            <span>{new Date(log.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[10px] text-[#8C6D62]">
                          {log.ip || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Media Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div>
                <h2 className="text-lg font-black text-white">
                  {editingItem ? 'Edit Media Asset' : 'Add New Media Item'}
                </h2>
                <p className="text-xs text-slate-400">
                  Tag media to an event and upload via FTP or supply a direct URL.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              
              {/* Event Tagging Selection */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>Tag to Event *</span>
                  <span className="text-[10px] text-mitra-gold font-normal">Shows in this event&apos;s album</span>
                </label>
                <select
                  required
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-mitra-gold focus:outline-none"
                >
                  <option value="">-- Select Event to Tag --</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.date}) — {evt.venue}
                    </option>
                  ))}
                  <option value="none">General / Unassigned to Specific Event</option>
                </select>
              </div>

              {/* Media Type Toggle & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Media Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'IMAGE', category: 'Photo' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold border transition-all ${
                        formData.type === 'IMAGE'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Photo / Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'VIDEO', category: 'Video' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold border transition-all ${
                        formData.type === 'VIDEO'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Clip</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Display Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                  >
                    <option value="Photo">Photo Gallery</option>
                    <option value="Video">Video Highlights</option>
                    <option value="Teaser">Teaser Reel</option>
                    <option value="Performance">Dance &amp; Music Recital</option>
                    <option value="Puja">Pooja &amp; Aarti</option>
                    <option value="MITRA Patrika">MITRA Patrika</option>
                    <option value="MITRA Souvenir">MITRA Souvenir</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Media Title / Caption *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Sthapana Aarti, 500+ Kuchipudi Recital Highlights"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-mitra-gold focus:outline-none"
                />
              </div>

              {/* PHOTO / MEDIA ASSET (FTP Upload & URL) — Matching Add New Committee Member Dialog */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold">
                    {formData.type === 'VIDEO' ? 'Video File or YouTube URL' : 'Photo File (FTP Upload & URL)'}
                  </label>
                  <span className="text-[10px] text-mitra-gold font-mono">FTP Path: media/gallery/</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Preview Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-mitra-gold/60 bg-slate-950 shrink-0 flex items-center justify-center shadow-inner relative">
                    {isExternalAlbum(formData.url) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                        <ExternalLink className="w-6 h-6 text-mitra-gold" />
                      </div>
                    ) : (
                      <img
                        src={
                          getOptimizedImageUrl(formData.coverImage || formData.url, 280, 65) ||
                          (isYouTubeUrl(formData.url) ? getYouTubeThumbnailUrl(formData.url, 'hq') : null) ||
                          '/assets/poster.jpg'
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const ytThumb = isYouTubeUrl(formData.url) ? getYouTubeThumbnailUrl(formData.url, 'hq') : null;
                          if (ytThumb && (e.target as HTMLImageElement).src !== ytThumb) {
                            (e.target as HTMLImageElement).src = ytThumb;
                          } else {
                            (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                          }
                        }}
                      />
                    )}
                    {formData.type === 'VIDEO' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <Video className="w-5 h-5 text-mitra-gold" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept={formData.type === 'VIDEO' ? 'video/*,image/*' : 'image/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                      id="media-file-upload"
                    />
                    <label
                      htmlFor="media-file-upload"
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                        uploadingImage
                          ? 'bg-slate-800 border-slate-700 text-amber-400'
                          : 'bg-mitra-gold/15 hover:bg-mitra-gold/25 border-mitra-gold/40 text-mitra-gold'
                      }`}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{uploadProgressMsg || 'Uploading to FTP server...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File(s) from Device (FTP)</span>
                        </>
                      )}
                    </label>

                    {uploadingImage && uploadProgress.total > 1 && (
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF7A00] to-[#E65C00] transition-all"
                          style={{ width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%` }}
                        />
                      </div>
                    )}
                    {uploadSuccessMsg && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{uploadSuccessMsg}</span>
                      </p>
                    )}
                    {!uploadingImage && uploadFailures.length > 0 && (
                      <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-2 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-rose-300 font-bold">
                            {uploadFailures.length} file(s) failed to upload
                          </span>
                          <button
                            type="button"
                            onClick={handleRetryFailedUploads}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded-lg"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry failed</span>
                          </button>
                        </div>
                        <ul className="max-h-20 overflow-y-auto text-[10px] text-rose-200/80 font-mono space-y-0.5">
                          {uploadFailures.map((f, i) => (
                            <li key={i} className="truncate" title={f.error}>
                              {f.file.name} — {f.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Select multiple photos (hundreds at once is fine) to batch upload into one album. Files store under <code className="text-mitra-gold">media/gallery/</code>
                    </p>
                  </div>
                </div>

                {/* Grouped photos preview & manager in modal */}
                {(() => {
                  const effectiveImages = formData.images && formData.images.length > 0
                    ? formData.images
                    : formData.url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);

                  if (effectiveImages.length === 0) return null;

                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <ImageIcon className="w-4 h-4 text-[#E65C00]" />
                          <span>
                            {effectiveImages.length > 1
                              ? `Grouped Photo Gallery (${effectiveImages.length} Photos)`
                              : 'Media Photo Asset'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {effectiveImages.length > 1
                            ? 'Saved as 1 grouped gallery entry'
                            : 'Single image entry'}
                        </span>
                      </div>

                      {/* Toggles for Preview and Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px]">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold select-none">
                          <input
                            type="checkbox"
                            checked={showModalPreviews}
                            onChange={(e) => setShowModalPreviews(e.target.checked)}
                            className="rounded bg-slate-800 border-slate-700 text-[#E65C00] focus:ring-[#E65C00]"
                          />
                          <span>Show Image Previews ({effectiveImages.length} Photos)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-rose-300 font-semibold select-none">
                          <input
                            type="checkbox"
                            checked={enableDeleteMode}
                            onChange={(e) => setEnableDeleteMode(e.target.checked)}
                            className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500"
                          />
                          <span>Enable Delete Option</span>
                        </label>
                      </div>

                      {!showModalPreviews ? (
                        <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-2.5 max-h-56 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300">
                          {effectiveImages.map((imgUrl, idx) => {
                            const isCover = formData.coverImage === imgUrl || (!formData.coverImage && idx === 0);
                            const name = imgUrl.split('/').pop()?.split('?')[0] || `Photo #${idx + 1}`;
                            return (
                              <div key={idx} className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-[#E65C00] font-bold">#{idx + 1}</span>
                                  <span className="truncate text-slate-200">{name}</span>
                                  {isCover && <span className="bg-[#E65C00] text-white text-[9px] px-1.5 py-0.2 rounded font-bold font-sans">Cover</span>}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => setFormData((prev) => ({ ...prev, coverImage: imgUrl }))}
                                      className="text-[10px] text-amber-400 hover:text-amber-300 px-1 font-bold font-sans"
                                    >
                                      Make Cover
                                    </button>
                                  )}
                                  {enableDeleteMode && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = effectiveImages.filter((_, i) => i !== idx);
                                        setFormData((prev) => ({
                                          ...prev,
                                          images: updated,
                                          url: updated.join(',\n'),
                                          coverImage: isCover ? (updated[0] || '') : prev.coverImage,
                                        }));
                                      }}
                                      className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40"
                                      title="Delete photo from album"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-700">
                          {effectiveImages.slice(0, modalVisibleCount).map((imgUrl, idx) => {
                            const isCover = formData.coverImage === imgUrl || (!formData.coverImage && idx === 0);
                            return (
                              <div
                                key={idx}
                                className={`relative aspect-square rounded-xl overflow-hidden border bg-slate-950 group/thumb ${
                                  isCover ? 'border-[#E65C00] ring-2 ring-[#E65C00]/80' : 'border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                <img
                                  src={getOptimizedImageUrl(imgUrl, 160, 60)}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                                  }}
                                />

                                {/* Photo Number */}
                                <span className="absolute top-1 left-1 bg-black/80 text-white font-mono text-[8px] px-1 rounded">
                                  #{idx + 1}
                                </span>

                                {/* Cover Badge */}
                                {isCover && (
                                  <span className="absolute bottom-1 left-1 bg-[#E65C00] text-white font-bold text-[8px] px-1 rounded shadow">
                                    Cover
                                  </span>
                                )}

                                {/* Set as cover on hover */}
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, coverImage: imgUrl }))}
                                    className="absolute bottom-1 left-1 text-[8px] bg-black/80 hover:bg-[#E65C00] text-white px-1 py-0.5 rounded opacity-0 group-hover/thumb:opacity-100 transition-opacity font-bold shadow"
                                    title="Set as Cover"
                                  >
                                    Cover
                                  </button>
                                )}

                                {/* Delete button: Only enabled when enableDeleteMode is true */}
                                {enableDeleteMode && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = effectiveImages.filter((_, i) => i !== idx);
                                      setFormData((prev) => ({
                                        ...prev,
                                        images: updated,
                                        url: updated.join(',\n'),
                                        coverImage: isCover ? (updated[0] || '') : prev.coverImage,
                                      }));
                                    }}
                                    className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded shadow transition-all"
                                    title="Delete photo from album"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {effectiveImages.length > modalVisibleCount && (
                            <button
                              type="button"
                              onClick={() => setModalVisibleCount((c) => c + MODAL_PAGE_SIZE)}
                              className="col-span-full py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-center text-xs font-bold text-amber-300 transition-colors"
                            >
                              Show more photos ({effectiveImages.length - modalVisibleCount} remaining)...
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Direct URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">
                      Direct Asset URL(s) / FTP Link (comma or newline separated):
                    </label>
                    {formData.url.includes('\n') && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        {formData.url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean).length} entries
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={formData.url.includes('\n') || formData.url.length > 80 ? 3 : 2}
                    required
                    placeholder={
                      formData.type === 'VIDEO'
                        ? 'https://www.youtube.com/watch?v=... or https://media.mitrauk.com/.../video.mp4'
                        : 'https://media.mitrauk.com/media/gallery/... (comma separate for multiple)'
                    }
                    value={formData.url}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      const parsedUrls = newUrl.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
                      const isYt = isYouTubeUrl(newUrl);
                      const ytThumb = isYt ? getYouTubeThumbnailUrl(newUrl, 'hq') : null;
                      setFormData((prev) => ({
                        ...prev,
                        url: newUrl,
                        images: parsedUrls,
                        type: isYt ? 'VIDEO' : prev.type,
                        category: isYt && prev.category === 'Photo' ? 'Video' : prev.category,
                        coverImage: ytThumb || (prev.coverImage && prev.coverImage !== prev.url ? prev.coverImage : (isYt ? '' : (parsedUrls[0] || newUrl))),
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-mitra-gold focus:outline-none font-mono text-[11px]"
                  />
                  {isYouTubeUrl(formData.url) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl mt-1.5">
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span>YouTube video link detected! HD thumbnail auto-configured &amp; video player enabled.</span>
                    </div>
                  )}
                </div>

                {/* Custom Poster / Thumbnail for Videos */}
                {formData.type === 'VIDEO' && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Video Cover / Poster Image URL (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="https://... poster thumbnail"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-mitra-gold focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Description / Highlights</label>
                <textarea
                  rows={2}
                  placeholder="Additional context, guest dignitaries, dance school name..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-mitra-gold focus:outline-none"
                />
              </div>

              {/* Sorting & Featured Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-slate-200 font-bold mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-mitra-gold focus:outline-none font-bold"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-mitra-gold focus:ring-mitra-gold bg-slate-900 border-slate-800"
                    />
                    <span className="text-slate-200 font-bold">
                      Major Featured Cover for Event
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6 mt-0.5">
                    Will appear prominently on the /media event album card.
                  </p>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  title={uploadingImage ? 'Wait for uploads to finish before saving' : undefined}
                  className="flex items-center gap-2 bg-gradient-to-r from-mitra-red to-rose-700 hover:from-rose-600 hover:to-mitra-red text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-mitra-red/20 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Asset...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Media Item' : 'Save Media Item'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Reorder Toast Notification */}
      {reorderNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-mitra-gold text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn backdrop-blur-md">
          {isSavingOrder ? (
            <Loader2 className="w-4 h-4 text-mitra-gold animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{reorderNotice}</span>
        </div>
      )}

      {/* Floating Cache Progress Notification */}
      {cacheToastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-amber-500/80 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn backdrop-blur-md">
          {cachingAlbumId ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400" />
          )}
          <span>{cacheToastMsg}</span>
        </div>
      )}

    </div>
  );
}
