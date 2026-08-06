import React from 'react';
import { motion } from 'motion/react';
import {
  Gift,
  PlusCircle,
  Sparkles,
  Clock,
  Music,
  Image as ImageIcon,
  Share2,
  Heart,
  Award,
  Play
} from 'lucide-react';

import { OccasionType } from '../types';

interface HomePageProps {
  onNavigateToCreate: (initialOccasion?: OccasionType) => void;
  onNavigateToDemo: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToCreate,
  onNavigateToDemo
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4 space-y-12 relative z-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass p-8 sm:p-14 glow-pink text-center space-y-6 border border-white/10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 max-w-3xl mx-auto">
          <div className="inline-block px-3.5 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs uppercase tracking-[0.2em] font-semibold">
            Wedding • Birthday • Anniversary
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif leading-[1.15] text-white">
            For Unforgettable Moments
          </h1>

          <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-2xl mx-auto">
            Create a custom digital celebration with countdown timers, personalized music, photo walls, and surprise reveal gifts.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateToCreate}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-base shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 inline mr-2" />
              <span>Open the Surprise Builder</span>
            </button>

            <button
              onClick={onNavigateToDemo}
              className="w-full sm:w-auto px-6 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-pink-400 fill-pink-400" />
              <span>Try Demo Surprise</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Occasions Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            type: 'birthday' as OccasionType,
            title: 'Birthday Surprises',
            desc: 'Custom cake countdowns, age & days lived counters, heartfelt wishes, party songs & photo gallery.',
            icon: Gift,
            badge: 'BIRTHDAY'
          },
          {
            type: 'wedding' as OccasionType,
            title: 'Wedding Celebrations',
            desc: 'Bride & Groom vows, marriage togetherness timers, background wedding music & photo wall.',
            icon: Award,
            badge: 'WEDDING'
          },
          {
            type: 'anniversary' as OccasionType,
            title: 'Anniversaries',
            desc: 'Romantic heart themes, couple milestone calculators, audio tracks & surprise reveals.',
            icon: Heart,
            badge: 'ANNIVERSARY'
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-7 rounded-3xl glass-card glow-violet flex flex-col justify-between space-y-4 border border-white/10"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-pink-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold font-mono">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <button
                onClick={() => onNavigateToCreate(item.type)}
                className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer pt-2 group"
              >
                <span>Start {item.title}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Grid */}
      <div className="glass p-8 sm:p-12 rounded-3xl glow-gold border border-white/10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] uppercase tracking-[0.2em] font-semibold">
            Feature Showcase
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-white">
            Everything You Need for a Perfect Reveal
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Clock,
              title: 'Live Countdown Timer',
              desc: 'Locks the surprise until the exact date & time set by you.'
            },
            {
              icon: ImageIcon,
              title: '6 Photo Wall',
              desc: 'Upload up to 6 high-res photos with lightbox view.'
            },
            {
              icon: Music,
              title: 'Custom Audio Track',
              desc: 'Background music player with Play & Pause controls.'
            },
            {
              icon: Share2,
              title: 'Instant Link Sharing',
              desc: 'Generate a clean shareable link for WhatsApp & Web.'
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-white text-sm">{f.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
