import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Gamepad2, Sparkles, Heart, CheckCircle } from 'lucide-react';

interface BalloonsGameProps {
  recipientName: string;
  balloonMessages?: string[] | null;
}

interface BalloonItem {
  id: number;
  color: string;
  gradient: string;
  label: string;
  message: string;
  popped: boolean;
}

export const BalloonsGame: React.FC<BalloonsGameProps> = ({ recipientName, balloonMessages }) => {
  const defaultMessages = [
    `Surprise 1: ${recipientName}, you bring infinite happiness to everyone around you! 💖`,
    'Surprise 2: Here is a voucher for 1 Unlimited Pizza & Movie Night! 🍕🎬',
    'Surprise 3: May all your wildest dreams & secret wishes come true this year! ✨🌟',
    'Surprise 4: Secret Code unlocked: #ALWAYS_BE_HAPPY! Keep smiling always! 😊🎉'
  ];

  const activeMessages = balloonMessages && balloonMessages.length > 0 ? balloonMessages : defaultMessages;

  const gradients = [
    'from-pink-500 to-rose-600',
    'from-amber-400 to-orange-500',
    'from-violet-500 to-indigo-600',
    'from-emerald-400 to-teal-600',
    'from-cyan-400 to-blue-600',
    'from-fuchsia-500 to-purple-600'
  ];

  const [balloons, setBalloons] = useState<BalloonItem[]>(() =>
    activeMessages.map((msg, index) => ({
      id: index + 1,
      color: 'pink',
      gradient: gradients[index % gradients.length],
      label: `🎈 Balloon #${index + 1}`,
      message: msg,
      popped: false
    }))
  );

  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  const playPopSynth = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const handlePop = (id: number, msg: string) => {
    playPopSynth();
    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
    setActiveMessage(msg);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const poppedCount = balloons.filter((b) => b.popped).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 sm:p-8 rounded-3xl border border-white/10 glow-pink space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-widest font-mono">
          <Gamepad2 className="w-4 h-4 text-pink-400" />
          <span>Mini Game: Pop The Balloons 🎈</span>
        </div>
        <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30 font-semibold">
          {poppedCount} / {balloons.length} Popped
        </span>
      </div>

      <p className="text-xs sm:text-sm text-white/70">
        Click on any floating balloon to pop it and reveal a hidden surprise note inside!
      </p>

      {/* Floating Balloons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3">
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            whileHover={!b.popped ? { scale: 1.08, y: -5 } : {}}
            whileTap={!b.popped ? { scale: 0.9 } : {}}
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => !b.popped && handlePop(b.id, b.message)}
          >
            {!b.popped ? (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2 + b.id * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-20 h-24 sm:w-24 sm:h-28 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-tr ${b.gradient} shadow-2xl flex items-center justify-center relative border-2 border-white/20`}
              >
                <span className="text-2xl select-none">🎈</span>
                <div className="absolute -bottom-2 w-1.5 h-3 bg-white/40 rounded-full" />
                <div className="absolute -bottom-6 w-0.5 h-5 bg-white/30" />
              </motion.div>
            ) : (
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-emerald-400 space-y-1">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <span className="text-[10px] font-mono font-semibold uppercase text-emerald-300">Popped!</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Message Modal / Box */}
      <AnimatePresence>
        {activeMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-5 bg-gradient-to-r from-pink-900/40 via-purple-900/40 to-violet-900/40 border border-pink-500/40 rounded-2xl text-white text-sm font-medium flex items-start gap-3 shadow-xl"
          >
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-300 block">
                Revealed Secret Note 💌
              </span>
              <p className="text-sm leading-relaxed text-pink-100">{activeMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
