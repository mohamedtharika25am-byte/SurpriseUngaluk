import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Music, Disc, RefreshCw } from 'lucide-react';

interface MusicPlayerProps {
  songUrl: string;
  autoPlay?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ songUrl, autoPlay = false }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [hasError, setHasError] = useState<boolean>(false);

  const getSpotifyEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('spotify.com/embed/track/')) return url;
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&theme=0`;
    }
    if (url.startsWith('spotify:track:')) {
      const id = url.replace('spotify:track:', '');
      return `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
    }
    return null;
  };

  const spotifyEmbedUrl = getSpotifyEmbedUrl(songUrl);

  if (spotifyEmbedUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full my-6 overflow-hidden rounded-2xl glass p-3 sm:p-4 border border-emerald-500/30 shadow-2xl glow-pink space-y-2"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Music className="w-4 h-4 text-emerald-400" />
            <span>Spotify Celebration Track 🎧</span>
          </div>
          <span className="text-[10px] text-emerald-300/70 font-mono">Spotify Player Enabled</span>
        </div>
        <iframe
          src={spotifyEmbedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl shadow-lg border border-white/10"
        />
      </motion.div>
    );
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setHasError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: any) => {
      console.warn('Audio playback issue:', e);
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (autoPlay) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Browser policy blocked autoplay until user gesture
          setIsPlaying(false);
        });
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [songUrl, autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.error('Play failed:', err);
          setHasError(true);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="w-full my-6">
      <audio ref={audioRef} src={songUrl} preload="metadata" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass text-white p-5 shadow-xl border border-white/10 glow-pink"
      >
        {/* Animated ambient glow when playing */}
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col gap-4">
          {/* Top row: Track info & Vinyl disc animation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full bg-white/5 text-pink-400 border border-white/10 ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              >
                <Disc className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-pink-400" />
                  <span>Special Audio Track</span>
                </h4>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  {isPlaying ? 'Playing celebration music...' : 'Click play to listen'}
                </p>
              </div>
            </div>

            {/* Equalizer animation lines */}
            {isPlaying && (
              <div className="flex items-end gap-1 h-6 px-2">
                <span className="w-1 bg-pink-400 rounded-full animate-bounce h-full" style={{ animationDuration: '0.6s' }} />
                <span className="w-1 bg-purple-400 rounded-full animate-bounce h-2/3" style={{ animationDuration: '0.4s' }} />
                <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-4/5" style={{ animationDuration: '0.7s' }} />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-1/2" style={{ animationDuration: '0.5s' }} />
              </div>
            )}
          </div>

          {hasError ? (
            <div className="p-3 bg-rose-950/50 rounded-xl border border-rose-800/50 text-xs text-rose-300 flex items-center justify-between">
              <span>Could not load custom song audio track.</span>
              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.load();
                  setHasError(false);
                }}
                className="px-2 py-1 bg-rose-800 hover:bg-rose-700 rounded text-white font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          ) : (
            <>
              {/* Progress Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={togglePlay}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" /> Pause Music
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white ml-0.5" /> Play Song
                    </>
                  )}
                </button>

                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MusicPlayer;
