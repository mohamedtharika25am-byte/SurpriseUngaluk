import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Laugh, Sparkles, MessageCircleHeart, RotateCw } from 'lucide-react';
import { InsideJoke } from '../types';

interface InsideJokesCardsProps {
  jokes?: InsideJoke[] | null;
}

export const InsideJokesCards: React.FC<InsideJokesCardsProps> = ({ jokes }) => {
  const list: InsideJoke[] = jokes && jokes.length > 0 ? jokes : [
    { id: 'j1', title: 'The Pineapple Pizza Debate 🍕', joke: 'Remember when you ordered Hawaiian pizza by accident and pretended you loved pineapple for 2 whole years?', emoji: '🍍' },
    { id: 'j2', title: 'Google Maps Shortcut 🗺️', joke: 'Taking 3 wrong U-turns, missing the exit, and proudly announcing "We are taking the scenic route!"', emoji: '🚗' },
    { id: 'j3', title: 'The 5-Minute Warning ⏰', joke: '"I\'m 5 minutes away!" actually means "I am still looking for my left shoe in the room."', emoji: '👟' }
  ];

  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 sm:p-8 rounded-3xl border border-white/10 glow-violet space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-widest font-mono">
          <Laugh className="w-4 h-4 text-amber-400" />
          <span>Inside Jokes & Memes 🤫 (Click To Flip Card)</span>
        </div>
        <span className="text-[11px] text-white/50 font-mono">
          {list.length} Secret Jokes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {list.map((item) => {
          const isFlipped = flippedMap[item.id];
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              onClick={() => toggleFlip(item.id)}
              className="h-44 rounded-2xl cursor-pointer perspective-1000 select-none group"
            >
              <div
                className={`relative w-full h-full rounded-2xl p-5 border transition-all duration-500 flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-pink-400 shadow-xl'
                    : 'bg-black/50 border-white/15 hover:border-pink-500/50'
                }`}
              >
                {!isFlipped ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{item.emoji || '😂'}</span>
                      <RotateCw className="w-3.5 h-3.5 text-white/40 group-hover:text-pink-300 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif font-semibold text-white group-hover:text-pink-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-pink-300 font-mono mt-1">
                        Tap to reveal secret memory 🔒
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-mono font-bold">
                      <span>REVEALED JOKE</span>
                      <span>✨</span>
                    </div>
                    <p className="text-xs sm:text-sm text-pink-100 font-medium italic leading-relaxed">
                      "{item.joke}"
                    </p>
                    <span className="text-[10px] text-white/40 font-mono text-right">
                      Tap again to flip
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
