import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { BeforeAfterPhoto } from '../types';

interface BeforeAfterSliderProps {
  data?: BeforeAfterPhoto | null;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ data }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const beforeImage = data?.beforeUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';
  const afterImage = data?.afterUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const beforeLabel = data?.beforeLabel || 'Childhood / Childhood Memory 👶';
  const afterLabel = data?.afterLabel || 'Present / Stunning Today ✨';

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 sm:p-8 rounded-3xl border border-white/10 glow-pink space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-widest font-mono">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>Glow-Up Memory Slider 📸 (Then vs Now)</span>
        </div>
        <span className="text-[11px] text-white/50 font-mono hidden sm:inline">
          Drag slider left/right to compare
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[320px] sm:h-[450px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/15 shadow-2xl group touch-none"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => handleMove(e.touches[0].clientX)}
        onTouchMove={handleTouchMove}
      >
        {/* After / Current Image (Background) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 border border-amber-500/30 shadow-lg flex items-center gap-1.5 pointer-events-none z-10">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{afterLabel}</span>
        </div>

        {/* Before / Childhood Image (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none h-full"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute top-0 left-0 h-full object-cover pointer-events-none max-w-none"
            style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
          />
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-pink-300 border border-pink-500/30 shadow-lg flex items-center gap-1.5 z-10 whitespace-nowrap">
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>{beforeLabel}</span>
          </div>
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400 via-amber-300 to-violet-500 cursor-ew-resize shadow-[0_0_15px_rgba(236,72,153,0.8)] pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white border-2 border-white shadow-2xl flex items-center justify-center text-xs font-bold font-mono">
            ↔
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/50 font-mono pt-1">
        <span>👈 {beforeLabel}</span>
        <span className="text-pink-300 font-semibold">{Math.round(sliderPosition)}% Revealed</span>
        <span>{afterLabel} 👉</span>
      </div>
    </motion.div>
  );
};

