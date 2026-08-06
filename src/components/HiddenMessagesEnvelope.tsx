import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Mail, Sparkles, Heart, Lock, Unlock, X, KeyRound } from 'lucide-react';

interface HiddenMessagesEnvelopeProps {
  messages?: string[] | null;
  senderName: string;
}

export const HiddenMessagesEnvelope: React.FC<HiddenMessagesEnvelopeProps> = ({ messages, senderName }) => {
  const list: string[] = messages && messages.length > 0 ? messages : [
    'You are truly one in a million! Thank you for filling every day with warmth and smile. ✨',
    'Golden Voucher Unlocked: Present this ticket to sender for 1 free coffee & shopping spree! ☕🛍️',
    'No matter how far we go or how busy life gets, you will always be our absolute favorite human! ❤️'
  ];

  const [unlockedSet, setUnlockedSet] = useState<Set<number>>(new Set());
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  const handleUnlock = (index: number) => {
    setUnlockedSet((prev) => new Set(prev).add(index));
    setActiveModalIndex(index);
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 sm:p-8 rounded-3xl border border-white/10 glow-pink space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-widest font-mono">
          <Mail className="w-4 h-4 text-pink-400" />
          <span>Secret Envelopes & Hidden Notes ✉️</span>
        </div>
        <span className="text-[11px] text-white/50 font-mono">
          {unlockedSet.size} / {list.length} Unlocked
        </span>
      </div>

      <p className="text-xs sm:text-sm text-white/70">
        Click on any sealed envelope below to break the heart seal and read the secret note from {senderName}!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
        {list.map((msg, idx) => {
          const isUnlocked = unlockedSet.has(idx);
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => (isUnlocked ? setActiveModalIndex(idx) : handleUnlock(idx))}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center space-y-2 select-none ${
                isUnlocked
                  ? 'bg-gradient-to-tr from-rose-900/40 to-pink-900/40 border-pink-500 shadow-lg'
                  : 'bg-black/50 border-white/15 hover:border-pink-400'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                {isUnlocked ? <Unlock className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6 text-pink-400" />}
              </div>
              <h4 className="text-sm font-serif font-bold text-white">
                Secret Envelope #{idx + 1}
              </h4>
              <span className="text-[11px] font-mono text-pink-300 flex items-center gap-1">
                {isUnlocked ? (
                  <span className="text-emerald-400 font-semibold">Click to re-read note 💌</span>
                ) : (
                  <span>Click to break seal 🔓</span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Pop-up Secret Note Modal */}
      <AnimatePresence>
        {activeModalIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-pink-500/50 shadow-2xl relative space-y-5 bg-gradient-to-br from-gray-900 via-purple-950 to-pink-950 text-white"
            >
              <button
                onClick={() => setActiveModalIndex(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/40">
                  <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    Secret Envelope #{activeModalIndex + 1}
                  </h3>
                  <p className="text-xs text-pink-300 font-mono">From {senderName} with love</p>
                </div>
              </div>

              <div className="p-5 bg-black/40 rounded-2xl border border-white/10 text-base sm:text-lg font-serif text-pink-100 leading-relaxed italic">
                "{list[activeModalIndex]}"
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveModalIndex(null)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  Close Note ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
