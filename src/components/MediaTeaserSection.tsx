'use client';

import { useState, useRef } from 'react';
import { Play, Volume2, VolumeX, Image as ImageIcon, X, Sparkles, Film } from 'lucide-react';

export default function MediaTeaserSection() {
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const galleryImages = [
    {
      src: '/assets/poster.jpg',
      title: 'Maha Ganapathi Official Event Poster',
      category: 'Official Poster',
    },
    {
      src: '/assets/organizers-poster.jpg',
      title: 'MITRA UK & Organizers Announcement',
      category: 'Organizers & Brand',
    },
    {
      src: '/assets/poster.jpg',
      title: 'Slough Langley Sanctum Reveal Composite',
      category: 'Divine Composite',
    },
    {
      src: '/assets/organizers-poster.jpg',
      title: 'Biryanis and More! & ELE Entertainments',
      category: 'Sponsor Partners',
    },
  ];

  const handleStartPlay = () => {
    setPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <section className="py-20 bg-[#FFF3E0] text-[#3D1A00] border-y border-[#E65C00]/20">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest">
            <Film className="w-4 h-4" />
            <span>OFFICIAL ASSETS & CINEMATIC TEASER</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            TEASER REEL & EVENT POSTERS
          </h2>
          
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#6B3A2A]">
            Experience the official Maha Ganapathi video teaser reel and high-resolution event artwork from our media assets.
          </p>
        </div>

        {/* Video Player Card */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#E65C00]/30 shadow-[0_0_40px_rgba(230,92,0,0.12)] bg-white">
          <div className="relative aspect-video w-full flex items-center justify-center bg-[#FFF0E0]">
            {!playing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-[#FFF8F0]/60 backdrop-blur-[2px]">
                <img
                  src="/assets/poster.jpg"
                  alt="Poster Backdrop"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 filter brightness-90"
                />
                <div className="relative z-20 flex flex-col items-center space-y-4">
                  <button
                    onClick={handleStartPlay}
                    className="w-20 h-20 rounded-full bg-[#E65C00] hover:bg-[#FF7A00] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 group"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <span className="text-xs font-black tracking-widest text-[#3D1A00] uppercase font-cinzel bg-white/80 px-4 py-1.5 rounded-full border border-[#E65C00]/30 shadow-sm">
                    Play Official Teaser Video (.MP4)
                  </span>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              src="/assets/teaser-reel.mp4"
              poster="/assets/poster.jpg"
              controls={playing}
              className="w-full h-full object-contain"
              playsInline
            />
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxImage(img.src)}
              className="temple-card rounded-2xl overflow-hidden border border-[#E65C00]/20 cursor-pointer group hover:border-[#E65C00]/70 transition-all relative hover:shadow-[0_12px_30px_rgba(230,92,0,0.15)] hover:-translate-y-1"
            >
              <div className="relative h-60 w-full overflow-hidden bg-[#FFF0E0]">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D1A00]/20 via-transparent to-transparent opacity-70" />
                <span className="absolute top-3 left-3 bg-[#E65C00] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md">
                  {img.category}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-xs font-bold text-[#3D1A00] group-hover:text-[#E65C00] transition-colors line-clamp-1">
                  {img.title}
                </h3>
                <span className="text-[10px] text-[#6B3A2A] flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#E65C00]" />
                  <span>Tap to expand full artwork</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-[#3D1A00]/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl w-full border-2 border-[#E65C00] rounded-3xl overflow-hidden bg-white p-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-[#E65C00] text-white p-2 rounded-full z-10 hover:scale-110 transition-transform shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={lightboxImage} alt="Expanded Asset" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </section>
  );
}
