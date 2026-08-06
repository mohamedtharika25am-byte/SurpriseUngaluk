import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  recipientName?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, recipientName = 'Recipient' }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  return (
    <div className="w-full my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-serif text-white">
            Memory Gallery <span className="text-xs font-mono text-white/40">({photos.length} photos)</span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Click to view</span>
        </div>
      </div>

      {/* Grid: 2 columns on mobile, 3 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {photos.map((url, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(idx)}
            className="group relative aspect-square rounded-2xl overflow-hidden glass cursor-pointer border border-white/10 hover:border-pink-500/40 hover:glow-pink transition-all duration-300"
          >
            <img
              src={url}
              alt={`Surprise photo ${idx + 1} for ${recipientName}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
              <span className="text-xs font-mono text-white/80">
                Photo {idx + 1}
              </span>
              <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white border border-white/20">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-md transition-colors"
                aria-label="Close photo view"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 shadow-2xl">
                <img
                  src={photos[selectedIndex]}
                  alt={`Full size surprise photo ${selectedIndex + 1}`}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors border border-white/10 shadow-lg"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors border border-white/10 shadow-lg"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 text-center text-sm font-medium text-slate-300">
                Photo {selectedIndex + 1} of {photos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;
