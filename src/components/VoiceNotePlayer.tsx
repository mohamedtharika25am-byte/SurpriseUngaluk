import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Radio, AlertCircle } from 'lucide-react';

interface VoiceNotePlayerProps {
  voiceNoteUrl?: string | null;
  senderName: string;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ voiceNoteUrl, senderName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!voiceNoteUrl) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setHasError(false);
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Voice note playback error:', err);
        setHasError(true);
        setIsPlaying(false);
      });
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-5 sm:p-6 rounded-3xl border border-pink-500/30 glow-pink space-y-3"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 text-pink-300 font-mono text-xs font-bold uppercase tracking-wider">
          <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
          <span>Personal Voice Message 🎙️</span>
        </div>
        <span className="text-[11px] text-pink-300/80 font-mono">From {senderName}</span>
      </div>

      <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
            <span>
              {hasError ? (
                <span className="text-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline text-amber-400" /> Voice note format unsupported
                </span>
              ) : isPlaying ? (
                'Playing Voice Note...'
              ) : (
                'Tap to hear voice note'
              )}
            </span>
            <span>{formatTime(currentTime)} / {formatTime(duration || 0)}</span>
          </div>

          {/* Animated Waveform visualizer bars */}
          <div className="flex items-center gap-1 h-6">
            {[40, 70, 30, 90, 50, 100, 60, 80, 40, 70, 90, 50, 30, 80, 60, 40].map((height, i) => (
              <motion.div
                key={i}
                animate={isPlaying ? { height: [`${height * 0.3}%`, `${height}%`, `${height * 0.3}%`] } : { height: `${height * 0.2}%` }}
                transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
                className={`flex-1 rounded-full ${isPlaying ? 'bg-pink-400' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={voiceNoteUrl}
          onError={() => {
            setHasError(true);
            setIsPlaying(false);
          }}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </motion.div>
  );
};
