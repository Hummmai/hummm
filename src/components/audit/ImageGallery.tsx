import { useState, memo } from "react";

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

/**
 * ImageGallery (Phase 4.5)
 * 
 * Restores the original image carousel + thumbnail strip.
 * 
 * Image Optimization:
 * - loading="lazy" + decoding="async" for performance with 10+ images
 * - sizes attribute for responsive loading
 * 
 * Recommendation: Serve images via a CDN that supports automatic WebP/AVIF conversion
 * (e.g. Supabase Storage + transformation or Cloudflare Images) for best performance.
 */
function ImageGallery({ images, className = "" }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const currentImage = images[current] || images[0];

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 ${className}`}>
      <div className="aspect-[16/9] w-full relative">
        <img
          src={currentImage}
          alt={`Property photo ${current + 1} of ${images.length}`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, 800px"
          // Phase 4.5: For production, pipe images through Supabase Image Transformation
          // or Cloudflare Images for automatic WebP/AVIF + responsive sizing
        />

        {/* Thumbnail strip - Mobile optimized with better touch targets */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-background/70 backdrop-blur-md border border-white/10 overflow-x-auto max-w-[95%] scrollbar-thin">
            {images.slice(0, 7).map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-10 h-8 sm:w-9 sm:h-7 rounded-md overflow-hidden border-2 transition-all shrink-0 touch-manipulation ${
                  i === current ? "border-primary scale-110 shadow-md" : "border-white/30 opacity-70 hover:opacity-100 active:scale-95"
                }`}
                style={{ minWidth: '36px', minHeight: '28px' }} // Good tap target
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                  decoding="async"
                />
              </button>
            ))}
            {images.length > 7 && (
              <span className="text-[9px] text-white/70 self-center ml-1 shrink-0 pr-1">+{images.length - 7}</span>
            )}
          </div>
        )}

        <div className="absolute top-3 right-3 px-3 py-1 text-[10px] font-bold rounded-full bg-background/70 backdrop-blur border border-white/10">
          {current + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

export default memo(ImageGallery);
