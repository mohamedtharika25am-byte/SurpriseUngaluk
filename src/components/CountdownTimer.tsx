import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Sparkles, Calendar, Heart, Gift, Award } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string; // ISO date string
  isHighlighted?: boolean;
  onTimerEnded?: () => void;
  occasionType?: 'birthday' | 'wedding' | 'anniversary';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const calculateTimeRemaining = (targetDateIso: string): TimeRemaining => {
  const targetTime = new Date(targetDateIso).getTime();
  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isPast: false };
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  isHighlighted = false,
  onTimerEnded,
  occasionType = 'birthday'
}) => {
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(targetDate);
      setTime(remaining);

      if (remaining.isPast) {
        clearInterval(timer);
        if (onTimerEnded) {
          onTimerEnded();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onTimerEnded]);

  // Formatted IST target date string display
  const targetDateObj = new Date(targetDate);
  const formattedIstString = targetDateObj.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const getOccasionColor = () => {
    switch (occasionType) {
      case 'wedding':
        return 'from-amber-500 via-rose-500 to-amber-600 text-amber-600 border-amber-300';
      case 'anniversary':
        return 'from-rose-500 via-pink-500 to-purple-600 text-pink-600 border-pink-300';
      default:
        return 'from-rose-500 via-purple-500 to-indigo-600 text-purple-600 border-purple-300';
    }
  };

  const getIcon = () => {
    switch (occasionType) {
      case 'wedding':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'anniversary':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />;
      default:
        return <Gift className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <motion.div
      id="countdown-timer-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{
        scale: isHighlighted ? [1, 1.05, 1, 1.05, 1] : 1,
        opacity: 1
      }}
      transition={{
        scale: isHighlighted ? { duration: 0.8, repeat: 1 } : { duration: 0.3 }
      }}
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 glass glow-pink transition-all duration-300 border border-white/10 ${
        isHighlighted
          ? 'ring-2 ring-pink-500/60 shadow-pink-500/30 shadow-2xl'
          : ''
      }`}
    >
      {/* Decorative top pill */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs font-medium">
          <Clock className="w-4 h-4 text-pink-400 animate-pulse" />
          <span className="uppercase tracking-widest text-[10px] font-semibold">The Reveal In</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
          <Calendar className="w-3.5 h-3.5" />
          <span>IST / Local</span>
        </div>
      </div>

      {time.isPast ? (
        <div className="text-center py-4 space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30 mb-2">
            <Sparkles className="w-6 h-6 text-pink-400 animate-spin" />
          </div>
          <h3 className="text-xl sm:text-3xl font-serif text-white">
            The Special Moment Has Arrived! ✨
          </h3>
          <p className="text-sm text-white/60 font-light">
            Click "Open the Surprise" to unlock your celebration!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
            {/* Days */}
            <div className="timer-box p-3 sm:p-4">
              <span className="text-2xl sm:text-4xl font-semibold text-white font-mono">
                {String(time.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-1">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="timer-box p-3 sm:p-4">
              <span className="text-2xl sm:text-4xl font-semibold text-pink-300 font-mono">
                {String(time.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-1">
                Hrs
              </span>
            </div>

            {/* Minutes */}
            <div className="timer-box p-3 sm:p-4">
              <span className="text-2xl sm:text-4xl font-semibold text-violet-300 font-mono">
                {String(time.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-1">
                Min
              </span>
            </div>

            {/* Seconds */}
            <div className="timer-box p-3 sm:p-4 relative overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={time.seconds}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl sm:text-4xl font-semibold text-amber-300 font-mono"
                >
                  {String(time.seconds).padStart(2, '0')}
                </motion.div>
              </AnimatePresence>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-1">
                Sec
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white/70 bg-black/40 p-3 rounded-xl border border-white/10">
            {getIcon()}
            <span className="font-medium text-white/60">Target:</span>
            <span className="font-semibold text-white truncate font-mono">
              {formattedIstString} (IST)
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CountdownTimer;
