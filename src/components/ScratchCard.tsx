import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { ScratchCardItem } from '../types';

interface ScratchCardProps {
  cards?: ScratchCardItem[] | null;
  recipientName: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ cards, recipientName }) => {
  const list: ScratchCardItem[] = cards && cards.length > 0 ? cards : [];

  if (list.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 sm:p-8 rounded-3xl border border-amber-500/30 glow-gold space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-widest font-mono">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Interactive Scratch Card Rewards 🪙 (Scratch To Reveal)</span>
        </div>
        <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
          {list.length} Secret Vouchers
        </span>
      </div>

      <p className="text-xs sm:text-sm text-white/70">
        Scratch the shiny golden layer below to reveal {recipientName}'s secret surprise reward cards!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        {list.map((item) => (
          <SingleScratchCard key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
};

const SingleScratchCard: React.FC<{ item: ScratchCardItem }> = ({ item }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw silver-gold foil background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#d4af37');
    grad.addColorStop(0.3, '#fff2a1');
    grad.addColorStop(0.6, '#b8860b');
    grad.addColorStop(1, '#e6ca65');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern lines
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.fillRect(i, 0, 8, canvas.height);
    }

    // Text on foil
    ctx.fillStyle = '#3a2500';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE WITH CURSOR ✨', canvas.width / 2, canvas.height / 2 + 4);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check how much is scratched
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clearPixels = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) clearPixels++;
      }
      const totalPixels = canvas.width * canvas.height;
      if (clearPixels / totalPixels > 0.45 && !isRevealed) {
        setIsRevealed(true);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (e) {}
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratching) scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsScratching(false);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <div className="relative h-44 rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-black to-purple-950/80 p-5 flex flex-col justify-between shadow-xl">
      {/* Revealed Secret Content */}
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{item.emoji || '🎁'}</span>
        <div className="space-y-1">
          <h4 className="text-xs uppercase font-mono font-bold text-amber-300">{item.title}</h4>
          <p className="text-sm font-serif text-white font-medium italic leading-snug">
            "{item.reward}"
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-amber-400/80 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Reward Unlocked!</span>
        </span>
        <button
          onClick={() => setIsRevealed(true)}
          className="text-amber-300 hover:underline cursor-pointer"
        >
          Instant Reveal
        </button>
      </div>

      {/* Foil Scratch Layer Canvas */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          width={320}
          height={176}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          className="absolute inset-0 w-full h-full cursor-pointer z-10 touch-none"
        />
      )}
    </div>
  );
};
