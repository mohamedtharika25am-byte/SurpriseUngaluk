import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, PartyPopper, Heart, ChevronRight, Volume2, VolumeX, Scissors, Wand2 } from 'lucide-react';
import { OccasionType } from '../types';

interface CakeCuttingProps {
  recipientName: string;
  occasionType: OccasionType;
  onComplete: () => void;
}

export const CakeCutting: React.FC<CakeCuttingProps> = ({
  recipientName,
  occasionType,
  onComplete
}) => {
  // Candle state: array of 4 candles boolean lit status
  const [candles, setCandles] = useState<boolean[]>([false, false, false, false]);
  const [candlesBlown, setCandlesBlown] = useState<boolean>(false);
  const [cakeSliced, setCakeSliced] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cutProgress, setCutProgress] = useState<number>(0);
  const [isCuttingByDrag, setIsCuttingByDrag] = useState<boolean>(false);
  
  const cakeContainerRef = useRef<HTMLDivElement>(null);

  // Sound Synth Generator
  const playFanfareSound = (type: 'light' | 'blow' | 'cut') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'light') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'blow') {
        // Wind noise synth
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'cut') {
        // Cheerful arpeggio
        const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.35);
        });
      }
    } catch (e) {
      console.warn('Audio play notice:', e);
    }
  };

  const allCandlesLit = candles.every(c => c);

  // Light single candle
  const handleToggleCandle = (index: number) => {
    if (candlesBlown || cakeSliced) return;
    const next = [...candles];
    next[index] = !next[index];
    setCandles(next);
    playFanfareSound('light');
  };

  // Light all candles
  const handleLightAllCandles = () => {
    setCandles([true, true, true, true]);
    setCandlesBlown(false);
    playFanfareSound('light');
  };

  // Blow out candles
  const handleBlowOutCandles = () => {
    setCandlesBlown(true);
    playFanfareSound('blow');
  };

  // Trigger Cake Cutting completion & Confetti
  const triggerSliceComplete = () => {
    if (cakeSliced) return;
    setCakeSliced(true);
    setCutProgress(100);
    playFanfareSound('cut');

    // Confetti Explosion
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.5 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.5 }
      });
    }, 250);
  };

  // Drag Knife to Slice
  const handleMouseMoveOrTouch = (clientY: number) => {
    if (!isCuttingByDrag || cakeSliced || !cakeContainerRef.current) return;
    const rect = cakeContainerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setCutProgress(percentage);
    if (percentage >= 85) {
      setIsCuttingByDrag(false);
      triggerSliceComplete();
    }
  };

  const getCakeNameTag = () => {
    const name = recipientName.trim() || 'Superstar';
    if (occasionType === 'wedding') return `Wedding Bliss for ${name}`;
    if (occasionType === 'anniversary') return `Happy Anniversary ${name}`;
    return `Happy Birthday ${name}! 🎉`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-10 rounded-3xl glass border border-amber-500/40 glow-gold text-center space-y-6 bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950 shadow-2xl relative overflow-hidden select-none"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header & Mute Button */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold uppercase tracking-widest">
          <PartyPopper className="w-4 h-4 text-amber-400" />
          <span>Interactive Cake Cutting Ceremony 🎂</span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors text-xs flex items-center gap-1"
          title={isMuted ? 'Unmute Fanfare Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Title & Guidance */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight drop-shadow-md">
          {getCakeNameTag()}
        </h2>
        <p className="text-xs sm:text-sm text-pink-200 font-medium">
          {!allCandlesLit
            ? 'Step 1: Tap candles below or click "Light Candles" to ignite the magic! 🕯️'
            : !candlesBlown
            ? 'Step 2: Wish upon a star and tap "Blow Out Candles" or tap flames! 🌬️'
            : !cakeSliced
            ? 'Step 3: Drag the Golden Knife down across the cake OR tap "Slice Cake Now"! 🔪🍰'
            : 'Woohoo! The first slice is cut! Eat virtual cake and open the surprise world! 💖'}
        </p>
      </div>

      {/* VIRTUAL CAKE CANVAS */}
      <div
        ref={cakeContainerRef}
        onMouseMove={(e) => handleMouseMoveOrTouch(e.clientY)}
        onTouchMove={(e) => handleMouseMoveOrTouch(e.touches[0].clientY)}
        onMouseUp={() => setIsCuttingByDrag(false)}
        onTouchEnd={() => setIsCuttingByDrag(false)}
        className="relative py-8 px-4 flex flex-col items-center justify-center min-h-[300px] cursor-pointer group"
      >
        {/* CANDLES ROW */}
        <div className="flex items-end justify-center gap-6 sm:gap-8 mb-2 z-10">
          {candles.map((isLit, idx) => (
            <div
              key={idx}
              onClick={() => handleToggleCandle(idx)}
              className="flex flex-col items-center cursor-pointer group/candle relative"
            >
              {/* Flame / Smoke */}
              <AnimatePresence>
                {isLit && !candlesBlown && (
                  <motion.div
                    initial={{ scale: 0, y: 5 }}
                    animate={{ scale: [1, 1.25, 1], y: [-2, 0, -2] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 0.5 + idx * 0.1 }}
                    className="w-5 h-7 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_20px_#f59e0b] flex items-center justify-center mb-1 relative"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    <div className="absolute inset-0 rounded-full bg-amber-300 blur-sm animate-ping opacity-50" />
                  </motion.div>
                )}

                {candlesBlown && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -25, scale: 1.5 }}
                    transition={{ duration: 1.2 }}
                    className="text-xs font-bold text-white/60 pointer-events-none mb-1"
                  >
                    💨
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Candle Stick */}
              <div className={`w-3 h-12 rounded-t-sm border border-white/30 shadow-md transition-all ${
                idx % 2 === 0
                  ? 'bg-gradient-to-b from-pink-300 via-rose-400 to-pink-600'
                  : 'bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600'
              }`} />
            </div>
          ))}
        </div>

        {/* THE MULTI-TIER CAKE */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Top Cake Tier */}
          <div className="relative">
            <div className={`w-56 sm:w-64 h-20 rounded-t-3xl bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 border-2 border-white/40 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
              cakeSliced ? 'translate-x-[-12px] rotate-[-2deg]' : ''
            }`}>
              {/* Frosting Drips */}
              <div className="absolute top-0 inset-x-0 h-5 bg-white/80 rounded-b-full shadow-inner flex justify-around">
                <span className="w-4 h-5 bg-white/80 rounded-b-full shadow" />
                <span className="w-6 h-7 bg-white/80 rounded-b-full shadow" />
                <span className="w-5 h-6 bg-white/80 rounded-b-full shadow" />
                <span className="w-4 h-5 bg-white/80 rounded-b-full shadow" />
              </div>

              <span className="text-xs sm:text-sm font-serif font-bold text-white tracking-widest uppercase drop-shadow z-10 pt-3">
                {recipientName} 💕
              </span>
            </div>
          </div>

          {/* Bottom Cake Tier */}
          <div className="relative -mt-1">
            <div className={`w-72 sm:w-80 h-24 rounded-b-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 border-2 border-white/40 shadow-2xl flex items-center justify-between px-6 relative overflow-hidden transition-all duration-500 ${
              cakeSliced ? 'translate-x-[12px] rotate-[2deg]' : ''
            }`}>
              <span className="text-xl">🍓</span>
              <span className="text-xs sm:text-sm font-serif font-bold text-amber-200 tracking-wider">
                {occasionType === 'wedding' ? 'FOREVER & ALWAYS' : 'SWEET CELEBRATION'}
              </span>
              <span className="text-xl">🍓</span>

              {/* Frosting bottom pattern */}
              <div className="absolute bottom-1 inset-x-0 h-2 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* CUT LINE SLICE EFFECT */}
          {cutProgress > 0 && !cakeSliced && (
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-amber-300 via-pink-400 to-yellow-300 shadow-[0_0_15px_#f59e0b] z-20 pointer-events-none"
              style={{ height: `${cutProgress}%` }}
            />
          )}

          {/* PULLED SLICE PREVIEW (WHEN CUT IS DONE) */}
          {cakeSliced && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute -bottom-10 z-30 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-400/50 shadow-2xl flex items-center gap-3"
            >
              <span className="text-3xl animate-bounce">🍰</span>
              <div className="text-left">
                <div className="text-xs font-bold text-amber-300 font-mono uppercase">First Slice Cut!</div>
                <div className="text-[11px] text-pink-200">A sweet bite served for {recipientName}! Yum! 💖</div>
              </div>
            </motion.div>
          )}

          {/* DRAGGABLE KNIFE CURSOR / ICON */}
          {allCandlesLit && candlesBlown && !cakeSliced && (
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              onMouseDown={() => setIsCuttingByDrag(true)}
              onTouchStart={() => setIsCuttingByDrag(true)}
              className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 cursor-grab active:cursor-grabbing border-2 border-white"
            >
              <Scissors className="w-4 h-4 text-slate-900" />
              <span>Drag Knife Down 🔪</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ACTION CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {!allCandlesLit && (
          <button
            onClick={handleLightAllCandles}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>Light All Candles 🕯️</span>
          </button>
        )}

        {allCandlesLit && !candlesBlown && (
          <button
            onClick={handleBlowOutCandles}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all animate-bounce"
          >
            <Wand2 className="w-4 h-4 text-cyan-200" />
            <span>Blow Out Candles 🌬️✨</span>
          </button>
        )}

        {allCandlesLit && candlesBlown && !cakeSliced && (
          <button
            onClick={triggerSliceComplete}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Slice Cake Now 🔪🍰</span>
          </button>
        )}

        {cakeSliced && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onComplete}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:scale-105 active:scale-95 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-400/50 glow-gold"
          >
            <Heart className="w-4 h-4 text-pink-300 fill-pink-300" />
            <span>Enter Surprise World & Gifts 🎁✨</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
