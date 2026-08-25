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
    <section className="py-20 bg-[#160B08] text-[#F7EFE1] border-y border-[#D4AF37]/30">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#7A1620]/60 border border-[#D4AF37]/40 px-4 py-1 rounded-full text-xs font-extrabold text-[#F4C542] uppercase tracking-widest">
            <Film className="w-4 h-4" />
            <span>OFFICIAL ASSETS & CINEMATIC TEASER</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            TEASER REEL & EVENT POSTERS
          </h2>
          
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#C9B79C]">
            Experience the official Maha Ganapathi video teaser reel and high-resolution event artwork from our media assets.
          </p>
        </div>

        {/* Video Player Card with HTML5 Video */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-[#0D0705]">
          <div className="relative aspect-video w-full flex items-center justify-center bg-black">
            {!playing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-black/40 backdrop-blur-[2px]">
                <img
                  src="/assets/poster.jpg"
                  alt="Poster Backdrop"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 filter brightness-75"
                />
                <div className="relative z-20 flex flex-col items-center space-y-4">
                  <button
                    onClick={handleStartPlay}
                    className="w-20 h-20 rounded-full bg-[#D4AF37] hover:bg-[#F4C542] text-[#0D0705] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 group"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <span className="text-xs font-black tracking-widest text-[#F7EFE1] uppercase font-cinzel bg-[#0D0705]/80 px-4 py-1.5 rounded-full border border-[#D4AF37]/40">
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

        {/* Official Assets Masonry Photo Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxImage(img.src)}
              className="temple-card rounded-2xl overflow-hidden border border-[#D4AF37]/30 cursor-pointer group hover:border-[#F4C542] transition-all relative"
            >
              <div className="relative h-60 w-full overflow-hidden bg-[#0D0705]">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0705] via-transparent to-transparent opacity-70" />
                <span className="absolute top-3 left-3 bg-[#7A1620] text-[#F4C542] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 shadow-md">
                  {img.category}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-xs font-bold text-[#F7EFE1] group-hover:text-[#F4C542] transition-colors line-clamp-1">
                  {img.title}
                </h3>
                <span className="text-[10px] text-[#C9B79C] flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#D4AF37]" />
                  <span>Tap to expand full artwork</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl w-full border-2 border-[#D4AF37] rounded-3xl overflow-hidden bg-[#0D0705] p-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-[#7A1620] text-white p-2 rounded-full z-10 hover:scale-110 transition-transform shadow-xl"
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
