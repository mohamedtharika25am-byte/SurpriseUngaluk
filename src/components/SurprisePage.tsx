import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gift,
  Heart,
  Award,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Volume2,
  Clock,
  Eye,
  Pencil,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Wand2,
  Music,
  Calendar,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Surprise, ThemeType, OccasionType, DraftSurprise } from '../types';
import { decodeSurpriseFromHash } from '../lib/urlHashHelper';
import { supabase } from '../lib/supabase';

import CountdownTimer, { calculateTimeRemaining } from './CountdownTimer';
import PhotoGallery from './PhotoGallery';
import MusicPlayer from './MusicPlayer';
import ConfettiEffect from './Confetti';

// Interactive Components
import { ThemeToggle } from './ThemeToggle';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { TimelineView } from './TimelineView';
import { MiniQuiz } from './MiniQuiz';
import { BalloonsGame } from './BalloonsGame';
import { InsideJokesCards } from './InsideJokesCards';
import { HiddenMessagesEnvelope } from './HiddenMessagesEnvelope';
import { CakeCutting } from './CakeCutting';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { ScratchCard } from './ScratchCard';


interface SurprisePageProps {
  id: string;
  onNavigateHome: () => void;
  onEditInForm?: (draft: DraftSurprise) => void;
}

export function convertSurpriseToDraft(s: Surprise): DraftSurprise {
  return {
    id: s.id,
    updated_at: new Date().toISOString(),
    title: `${s.recipient_name}'s ${s.occasion_type.toUpperCase()} Surprise`,
    recipient_name: s.recipient_name || '',
    partner_name: s.partner_name || '',
    nickname: s.nickname || '',
    birth_date: s.birth_date || '',
    occasion_type: s.occasion_type || 'birthday',
    occasion_datetime: s.occasion_datetime || new Date().toISOString(),
    sender_name: s.sender_name || '',
    message: s.message || '',
    timer_enabled: s.timer_enabled ?? true,
    theme_preference: s.theme_preference || 'midnight',
    cake_cutting_enabled: s.cake_cutting_enabled ?? true,
    balloons_game_enabled: s.balloons_game_enabled ?? false,
    enableBeforeAfter: !!s.before_after,
    beforeUrl: s.before_after?.beforeUrl || '',
    afterUrl: s.before_after?.afterUrl || '',
    beforeLabel: s.before_after?.beforeLabel || 'Childhood / Back Then 👶',
    afterLabel: s.before_after?.afterLabel || 'Grown Up / Stunning Today ✨',
    spotifyUrl: s.song_url || '',
    musicEnabled: !!s.song_url,
    enableVoiceNote: !!s.voice_note_url,
    voiceNoteUrl: s.voice_note_url || '',
    balloonMessages: s.balloon_messages || [],
    enableTimeline: !!(s.timeline_events && s.timeline_events.length > 0),
    timelineEvents: s.timeline_events || [],
    enableQuiz: !!(s.quiz_questions && s.quiz_questions.length > 0),
    quizQuestions: s.quiz_questions || [],
    enableInsideJokes: !!(s.inside_jokes && s.inside_jokes.length > 0),
    insideJokes: s.inside_jokes || [],
    enableHiddenMessages: !!(s.hidden_messages && s.hidden_messages.length > 0),
    hiddenMessages: s.hidden_messages || [],
    enableScratchCards: !!(s.scratch_cards && s.scratch_cards.length > 0),
    scratchCards: s.scratch_cards || [],
    photoPreviews: s.photo_urls || []
  };
}

export const SurprisePage: React.FC<SurprisePageProps> = ({ id, onNavigateHome, onEditInForm }) => {
  const [surprise, setSurprise] = useState<Surprise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unlocking & Timer state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [timerHighlighted, setTimerHighlighted] = useState<boolean>(false);
  const [earlyAlertMessage, setEarlyAlertMessage] = useState<string | null>(null);
  const [triggerConfetti, setTriggerConfetti] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Active theme & cake cutting state
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('midnight');
  const [cakeCutDone, setCakeCutDone] = useState<boolean>(false);

  // Creator detection & edit panel states for ALL features
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState<boolean>(false);
  const [editRecipientName, setEditRecipientName] = useState<string>('');
  const [editSenderName, setEditSenderName] = useState<string>('');
  const [editMessage, setEditMessage] = useState<string>('');
  const [editNickname, setEditNickname] = useState<string>('');
  const [editPartnerName, setEditPartnerName] = useState<string>('');
  const [editOccasionType, setEditOccasionType] = useState<OccasionType>('birthday');
  const [editOccasionDatetime, setEditOccasionDatetime] = useState<string>('');
  const [editTimerEnabled, setEditTimerEnabled] = useState<boolean>(true);
  const [editThemePreference, setEditThemePreference] = useState<ThemeType>('midnight');
  const [editSongUrl, setEditSongUrl] = useState<string>('');
  const [editVoiceNoteUrl, setEditVoiceNoteUrl] = useState<string>('');
  const [editCakeCuttingEnabled, setEditCakeCuttingEnabled] = useState<boolean>(true);
  const [editBalloonsGameEnabled, setEditBalloonsGameEnabled] = useState<boolean>(false);
  const [editBeforeUrl, setEditBeforeUrl] = useState<string>('');
  const [editAfterUrl, setEditAfterUrl] = useState<string>('');
  const [editBeforeLabel, setEditBeforeLabel] = useState<string>('');
  const [editAfterLabel, setEditAfterLabel] = useState<string>('');
  
  const [editSaving, setEditSaving] = useState<boolean>(false);
  const [editSavedToast, setEditSavedToast] = useState<string | null>(null);
  const [showShareLinkCard, setShowShareLinkCard] = useState<boolean>(false);

  useEffect(() => {
    fetchSurprise();
  }, [id]);

  const fetchSurprise = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Helper to process surprise object
    const applySurprise = (data: Surprise) => {
      setSurprise(data);
      if (data.theme_preference) {
        setCurrentTheme(data.theme_preference);
      }
      // Preview mode: creator can view instantly without timer
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      if (isPreview || !data.timer_enabled) {
        setIsUnlocked(true);
      } else {
        const timeRem = calculateTimeRemaining(data.occasion_datetime);
        if (timeRem.isPast) {
          setIsUnlocked(true);
        }
      }

      // Populate all edit fields
      setEditRecipientName(data.recipient_name || '');
      setEditSenderName(data.sender_name || '');
      setEditMessage(data.message || '');
      setEditNickname(data.nickname || '');
      setEditPartnerName(data.partner_name || '');
      setEditOccasionType(data.occasion_type || 'birthday');
      setEditOccasionDatetime(data.occasion_datetime ? data.occasion_datetime.slice(0, 16) : '');
      setEditTimerEnabled(typeof data.timer_enabled === 'boolean' ? data.timer_enabled : true);
      setEditThemePreference(data.theme_preference || 'midnight');
      setEditSongUrl(data.song_url || '');
      setEditVoiceNoteUrl(data.voice_note_url || '');
      setEditCakeCuttingEnabled(typeof data.cake_cutting_enabled === 'boolean' ? data.cake_cutting_enabled : true);
      setEditBalloonsGameEnabled(typeof data.balloons_game_enabled === 'boolean' ? data.balloons_game_enabled : false);
      setEditBeforeUrl(data.before_after?.beforeUrl || '');
      setEditAfterUrl(data.before_after?.afterUrl || '');
      setEditBeforeLabel(data.before_after?.beforeLabel || 'Childhood / Back Then 👶');
      setEditAfterLabel(data.before_after?.afterLabel || 'Grown Up / Stunning Today ✨');
    };

    // Detect if user is the creator by checking localStorage
    const detectCreator = () => {
      try {
        const localStr = localStorage.getItem(`surprise_${id}`);
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (parsed && parsed.id) {
            setIsCreator(true);
          }
        }
      } catch (e) {
        // Not the creator
      }
    };

    try {
      // 1. Demo surprise fallback
      if (id === 'demo-birthday-surprise' || id === 'demo') {
        const demoData: Surprise = {
          id: 'demo-birthday-surprise',
          recipient_name: 'Sarah',
          occasion_type: 'birthday',
          occasion_datetime: new Date(Date.now() + 60 * 1000).toISOString(),
          sender_name: 'Alex & Friends',
          message: 'Wishing you the happiest birthday filled with joy, laughter, and unforgettable moments! May this special year bring you everything your heart desires! 🎉🎂✨',
          photo_urls: [
            'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80'
          ],
          song_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a81617.mp3?filename=happy-birthday-110058.mp3',
          timer_enabled: true,
          created_at: new Date().toISOString()
        };
        applySurprise(demoData);
        detectCreator();
        setIsLoading(false);
        return;
      }

      // 2. Client-side Supabase fetch — PRIMARY source (has real cloud photo URLs)
      if (supabase) {
        try {
          const { data: supaData, error: supaErr } = await supabase
            .from('surprises')
            .select('*')
            .eq('id', id)
            .single();

          if (supaData && !supaErr) {
            let finalData = supaData as Surprise;
            // Supplement with localStorage photos if DB photos empty (creator's device has base64 previews)
            try {
              const localStr = localStorage.getItem(`surprise_${id}`);
              if (localStr) {
                const localParsed: Surprise = JSON.parse(localStr);
                if ((!finalData.photo_urls || finalData.photo_urls.length === 0) &&
                    localParsed.photo_urls && localParsed.photo_urls.length > 0) {
                  finalData = { ...finalData, photo_urls: localParsed.photo_urls };
                }
              }
            } catch (e) {}
            applySurprise(finalData);
            detectCreator();
            try { localStorage.setItem(`surprise_${id}`, JSON.stringify(finalData)); } catch (e) {}
            setIsLoading(false);
            return;
          }
        } catch (supaException) {
          console.warn('Supabase client fetch exception:', supaException);
        }
      }

      // 3. Check URL hash (self-contained fallback — no network needed)
      if (window.location.hash) {
        const hashSurprise = decodeSurpriseFromHash(window.location.hash);
        if (hashSurprise) {
          // Merge any cached photos from localStorage since hash won't contain photos
          try {
            const localStr = localStorage.getItem(`surprise_${id}`);
            if (localStr) {
              const localParsed: Surprise = JSON.parse(localStr);
              if (localParsed.photo_urls && localParsed.photo_urls.length > 0) {
                hashSurprise.photo_urls = localParsed.photo_urls;
              }
            }
          } catch (e) {}
          applySurprise(hashSurprise);
          detectCreator();
          try { localStorage.setItem(`surprise_${id}`, JSON.stringify(hashSurprise)); } catch (e) {}
          setIsLoading(false);
          return;
        }
      }

      // 4. Check localStorage (creator's device — has full data with photos)
      try {
        const localDataStr = localStorage.getItem(`surprise_${id}`) || localStorage.getItem(id);
        if (localDataStr) {
          const parsed: Surprise = JSON.parse(localDataStr);
          if (parsed && parsed.id) {
            applySurprise(parsed);
            detectCreator();
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }

      // 5. Server API fetch (secondary fallback)
      try {
        const res = await fetch(`/api/surprise/${id}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.success && data.surprise) {
            applySurprise(data.surprise);
            detectCreator();
            try { localStorage.setItem(`surprise_${id}`, JSON.stringify(data.surprise)); } catch (e) {}
            setIsLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('API fetch attempt failed:', apiErr);
      }

      throw new Error('Surprise link not found or invalid.');
    } catch (err: any) {
      console.error('Fetch surprise error:', err);
      setErrorMsg(err.message || 'Could not load surprise details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSurpriseClick = () => {
    if (!surprise) return;

    if (surprise.timer_enabled) {
      const timeRem = calculateTimeRemaining(surprise.occasion_datetime);
      if (!timeRem.isPast) {
        // Now < occasion_datetime logic:
        // 1) Show exact Tamil message: "இன்னும் சிறிது நேரம் காத்திருங்கள் ⏳"
        setEarlyAlertMessage('இன்னும் சிறிது நேரம் காத்திருங்கள் ⏳');

        // 2) Focus/highlight timer
        setTimerHighlighted(true);
        const timerElement = document.getElementById('countdown-timer-container');
        if (timerElement) {
          timerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setTimeout(() => setTimerHighlighted(false), 2000);
        setTimeout(() => setEarlyAlertMessage(null), 4000);
        return;
      }
    }

    // Now >= occasion_datetime or timer disabled -> Reveal!
    setIsUnlocked(true);
    setTriggerConfetti(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Save edited surprise data for ALL options
  const handleSaveEdits = async () => {
    if (!surprise) return;
    setEditSaving(true);

    const updatedBeforeAfter = (editBeforeUrl.trim() || editAfterUrl.trim()) ? {
      beforeUrl: editBeforeUrl.trim(),
      afterUrl: editAfterUrl.trim(),
      beforeLabel: editBeforeLabel.trim() || 'Childhood / Back Then 👶',
      afterLabel: editAfterLabel.trim() || 'Grown Up / Stunning Today ✨'
    } : null;

    let isoDatetime = surprise.occasion_datetime;
    if (editOccasionDatetime) {
      try {
        const parsedDate = new Date(editOccasionDatetime);
        if (!isNaN(parsedDate.getTime())) {
          isoDatetime = parsedDate.toISOString();
        }
      } catch (e) {}
    }

    const updatedSurprise: Surprise = {
      ...surprise,
      recipient_name: editRecipientName.trim() || surprise.recipient_name,
      sender_name: editSenderName.trim() || surprise.sender_name,
      message: editMessage.trim() || surprise.message,
      nickname: editNickname.trim() || null,
      partner_name: editPartnerName.trim() || null,
      occasion_type: editOccasionType,
      occasion_datetime: isoDatetime,
      timer_enabled: editTimerEnabled,
      theme_preference: editThemePreference,
      song_url: editSongUrl.trim() || null,
      voice_note_url: editVoiceNoteUrl.trim() || null,
      cake_cutting_enabled: editCakeCuttingEnabled,
      balloons_game_enabled: editBalloonsGameEnabled,
      before_after: updatedBeforeAfter
    };

    // Update localStorage
    try {
      localStorage.setItem(`surprise_${id}`, JSON.stringify(updatedSurprise));
    } catch (e) {
      console.warn('Failed to save edits to localStorage:', e);
    }

    // Update Supabase if connected
    if (supabase) {
      try {
        await supabase
          .from('surprises')
          .update({
            recipient_name: updatedSurprise.recipient_name,
            sender_name: updatedSurprise.sender_name,
            message: updatedSurprise.message,
            nickname: updatedSurprise.nickname,
            partner_name: updatedSurprise.partner_name,
            occasion_type: updatedSurprise.occasion_type,
            occasion_datetime: updatedSurprise.occasion_datetime,
            timer_enabled: updatedSurprise.timer_enabled,
            theme_preference: updatedSurprise.theme_preference,
            song_url: updatedSurprise.song_url,
            voice_note_url: updatedSurprise.voice_note_url,
            cake_cutting_enabled: updatedSurprise.cake_cutting_enabled,
            balloons_game_enabled: updatedSurprise.balloons_game_enabled,
            before_after: updatedSurprise.before_after
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase update failed:', e);
      }
    }

    setSurprise(updatedSurprise);
    if (updatedSurprise.theme_preference) {
      setCurrentTheme(updatedSurprise.theme_preference);
    }
    setEditSaving(false);
    setIsEditPanelOpen(false);
    setShowShareLinkCard(true);
    setEditSavedToast('Edits saved successfully! Scroll to get your updated Shareable Link below. 🎉');
    setTimeout(() => setEditSavedToast(null), 4000);
  };

  const getOccasionIcon = (type: string) => {
    switch (type) {
      case 'wedding':
        return <Award className="w-8 h-8 text-amber-500" />;
      case 'anniversary':
        return <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />;
      default:
        return <Gift className="w-8 h-8 text-purple-500" />;
    }
  };

  const getOccasionHeading = (s: Surprise) => {
    const partner = s.partner_name ? ` & ${s.partner_name}` : '';
    const nick = s.nickname ? ` (${s.nickname})` : '';

    switch (s.occasion_type) {
      case 'wedding':
        return `Happy Wedding ${s.recipient_name}${partner}! 🥂💍`;
      case 'anniversary':
        return `Happy Anniversary ${s.recipient_name}${partner}! 💞🌹`;
      default:
        return `Happy Birthday ${s.recipient_name}${nick}! 🎂🎉`;
    }
  };

  const calculateDaysCounter = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const pastDate = new Date(dateStr);
    if (isNaN(pastDate.getTime())) return null;
    const diffTime = Math.max(0, Date.now() - pastDate.getTime());
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const years = (days / 365.25).toFixed(1);
    return { days, years };
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Unwrapping surprise package...</h3>
        <p className="text-xs text-slate-500 mt-1">Fetching custom memories and countdown...</p>
      </div>
    );
  }

  if (errorMsg || !surprise) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="p-4 bg-rose-100 rounded-full text-rose-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Surprise Not Found</h3>
        <p className="text-sm text-slate-600 mt-2">
          {errorMsg || 'This surprise link might be invalid or has been removed.'}
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Home
        </button>
      </div>
    );
  }

  const getThemeStyles = (theme: ThemeType) => {
    switch (theme) {
      case 'romance':
        return 'bg-gradient-to-br from-rose-950 via-pink-950 to-purple-950 border-pink-500/30 glow-pink';
      case 'celestial':
        return 'bg-gradient-to-br from-slate-950 via-indigo-950 to-amber-950 border-amber-500/30 glow-gold';
      case 'cyber':
        return 'bg-gradient-to-br from-cyan-950 via-gray-950 to-fuchsia-950 border-cyan-500/30 glow-violet';
      case 'midnight':
      default:
        return 'bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 border-purple-500/30 glow-violet';
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto my-6 px-4 py-6 sm:p-8 rounded-3xl border shadow-2xl transition-all duration-500 ${getThemeStyles(currentTheme)}`}>
      {/* Confetti Effect component */}
      <ConfettiEffect trigger={triggerConfetti} occasionType={surprise.occasion_type} />

      {/* Top Bar with Home, Theme Toggle & Share button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Create Yours</span>
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle activeTheme={currentTheme} onThemeChange={setCurrentTheme} />

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-pink-400" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4 mb-8"
      >
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-pink-400 mx-auto glow-pink">
          {getOccasionIcon(surprise.occasion_type)}
        </div>
        <h1 className="text-3xl sm:text-6xl font-serif text-white tracking-tight">
          {getOccasionHeading(surprise)}
        </h1>
        <p className="text-sm sm:text-base text-white/60 font-light">
          A special celebration created with love by{' '}
          <span className="font-medium text-pink-400 font-serif">
            {surprise.sender_name}
          </span>
        </p>
      </motion.div>

      {/* Countdown Timer Section */}
      {surprise.timer_enabled && (
        <div className="mb-8">
          <CountdownTimer
            targetDate={surprise.occasion_datetime}
            isHighlighted={timerHighlighted}
            occasionType={surprise.occasion_type}
            onTimerEnded={() => setIsUnlocked(true)}
          />
        </div>
      )}

      {/* Early Alert Toast ("இன்னும் சிறிது நேரம் காத்திருங்கள் ⏳") */}
      <AnimatePresence>
        {earlyAlertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center font-semibold text-sm sm:text-base shadow-lg flex flex-col sm:flex-row items-center justify-center gap-3 glow-gold"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{earlyAlertMessage}</span>
            </div>
            {isCreator && (
              <button
                onClick={() => {
                  setIsUnlocked(true);
                  setEarlyAlertMessage(null);
                  setTriggerConfetti(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-mono border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Creator Test: Unlock Now 👁️</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked State "Open Surprise" Button */}
      {!isUnlocked && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6 space-y-4"
        >
          <button
            onClick={handleOpenSurpriseClick}
            className="group relative inline-flex items-center gap-3 px-10 py-4 sm:px-14 sm:py-5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-lg sm:text-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Lock className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>Open the Surprise</span>
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
          </button>
          <p className="text-xs text-white/40 font-light">
            Click to reveal your personal greeting card, photo wall, and music!
          </p>

          {isCreator && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsUnlocked(true);
                  setTriggerConfetti(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:text-white text-xs font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-pink-400" />
                <span>Creator Test Mode: Instant Unlock & Inspect Content 👁️</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Revealed Surprise Content Section */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Unlocked Badge */}
            <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-300 text-xs font-medium uppercase tracking-widest font-mono">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>Surprise Unlocked! Happy Celebration! 🎉</span>
            </div>

            {/* Edit Saved Toast */}
            <AnimatePresence>
              {editSavedToast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{editSavedToast}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Creator Edit Panel — only visible to the creator */}
            {isCreator && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/60 to-violet-950/60 overflow-hidden shadow-2xl"
              >
                {/* Toggle Header */}
                <button
                  onClick={() => setIsEditPanelOpen(!isEditPanelOpen)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-300">Creator Master Edit Panel</span>
                    <span className="text-[10px] text-white/40 font-mono">(Only you can see & edit this)</span>
                  </div>
                  {isEditPanelOpen ? (
                    <ChevronUp className="w-4 h-4 text-white/50" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  )}
                </button>

                {/* Collapsible Edit Fields */}
                <AnimatePresence>
                  {isEditPanelOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 space-y-5 border-t border-white/10 pt-4">

                        {/* Button to Re-Open Full Creator Form */}
                        {onEditInForm && (
                          <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                                <Wand2 className="w-4 h-4 text-pink-400" />
                                <span>Re-edit in Full Creator Form</span>
                              </div>
                              <div className="text-[11px] text-white/60 font-light mt-0.5">
                                Open all photos, quiz questions, timeline milestones, inside jokes & scratch cards in the interactive form editor.
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (surprise) {
                                  onEditInForm(convertSurpriseToDraft(surprise));
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1"
                            >
                              <span>Open Form Editor</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* SECTION 1: BASIC NAMES & RECIPIENT DETAILS */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold text-pink-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <span>1. Names & Recipient Details</span>
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Recipient Name</label>
                              <input
                                type="text"
                                value={editRecipientName}
                                onChange={(e) => setEditRecipientName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="Recipient name"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Sender Name</label>
                              <input
                                type="text"
                                value={editSenderName}
                                onChange={(e) => setEditSenderName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="Your name (Sender)"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Nickname (optional)</label>
                              <input
                                type="text"
                                value={editNickname}
                                onChange={(e) => setEditNickname(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="Nickname"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Partner Name (optional)</label>
                              <input
                                type="text"
                                value={editPartnerName}
                                onChange={(e) => setEditPartnerName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="Partner name"
                              />
                            </div>
                          </div>
                        </div>

                        {/* SECTION 2: OCCASION & COUNTDOWN TIMER */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                          <h5 className="text-xs font-bold text-pink-400 uppercase tracking-widest font-mono">
                            2. Occasion & Reveal Countdown
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Occasion Type</label>
                              <select
                                value={editOccasionType}
                                onChange={(e) => setEditOccasionType(e.target.value as OccasionType)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                              >
                                <option value="birthday" className="bg-slate-900">Birthday 🎂</option>
                                <option value="wedding" className="bg-slate-900">Wedding 💍</option>
                                <option value="anniversary" className="bg-slate-900">Anniversary ❤️</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Reveal Date & Time</label>
                              <input
                                type="datetime-local"
                                value={editOccasionDatetime}
                                onChange={(e) => setEditOccasionDatetime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Countdown Timer</label>
                              <select
                                value={editTimerEnabled ? 'yes' : 'no'}
                                onChange={(e) => setEditTimerEnabled(e.target.value === 'yes')}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                              >
                                <option value="yes" className="bg-slate-900">Enabled (With Countdown) ⏳</option>
                                <option value="no" className="bg-slate-900">Disabled (Instant Unlock) ⚡</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* SECTION 3: THEME & HEARTFELT MESSAGE */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                          <h5 className="text-xs font-bold text-pink-400 uppercase tracking-widest font-mono">
                            3. Visual Theme & Heartfelt Message
                          </h5>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Theme Style</label>
                              <select
                                value={editThemePreference}
                                onChange={(e) => setEditThemePreference(e.target.value as ThemeType)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                              >
                                <option value="midnight" className="bg-slate-900">Midnight Amethyst 🌌</option>
                                <option value="romance" className="bg-slate-900">Rose Gold Romance 🌹</option>
                                <option value="celestial" className="bg-slate-900">Golden Celestial ✨</option>
                                <option value="cyber" className="bg-slate-900">Neon Cyberpunk ⚡</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Heartfelt Message</label>
                              <textarea
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50 resize-none"
                                placeholder="Write your custom surprise message..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* SECTION 4: MUSIC & VOICE NOTE */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                          <h5 className="text-xs font-bold text-pink-400 uppercase tracking-widest font-mono">
                            4. Music & Audio Options
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Background Song / Spotify URL</label>
                              <input
                                type="text"
                                value={editSongUrl}
                                onChange={(e) => setEditSongUrl(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="https://open.spotify.com/track/... or MP3 link"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Voice Note Audio URL</label>
                              <input
                                type="text"
                                value={editVoiceNoteUrl}
                                onChange={(e) => setEditVoiceNoteUrl(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="Audio stream or base64 URL"
                              />
                            </div>
                          </div>
                        </div>

                        {/* SECTION 5: INTERACTIVE CEREMONIES & BEFORE/AFTER */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                          <h5 className="text-xs font-bold text-pink-400 uppercase tracking-widest font-mono">
                            5. Interactive Ceremonies & Before/After Photos
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Cake Cutting Ceremony</label>
                              <select
                                value={editCakeCuttingEnabled ? 'yes' : 'no'}
                                onChange={(e) => setEditCakeCuttingEnabled(e.target.value === 'yes')}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                              >
                                <option value="yes" className="bg-slate-900">Enabled 🎂</option>
                                <option value="no" className="bg-slate-900">Disabled 🚫</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Balloons Pop Game</label>
                              <select
                                value={editBalloonsGameEnabled ? 'yes' : 'no'}
                                onChange={(e) => setEditBalloonsGameEnabled(e.target.value === 'yes')}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                              >
                                <option value="yes" className="bg-slate-900">Enabled 🎈</option>
                                <option value="no" className="bg-slate-900">Disabled 🚫</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Before Photo URL</label>
                              <input
                                type="text"
                                value={editBeforeUrl}
                                onChange={(e) => setEditBeforeUrl(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="Childhood / earlier photo URL"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">After Photo URL</label>
                              <input
                                type="text"
                                value={editAfterUrl}
                                onChange={(e) => setEditAfterUrl(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-pink-500/50"
                                placeholder="Present day photo URL"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Save Action Buttons */}
                        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                          <button
                            onClick={handleSaveEdits}
                            disabled={editSaving}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                          >
                            {editSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>{editSaving ? 'Saving Edits...' : 'Save Edits & Generate Share Link 🔗'}</span>
                          </button>
                          <button
                            onClick={() => setIsEditPanelOpen(false)}
                            className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Close Panel</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Generate Shareable Surprise Link Card (shown after saving edits or when requested) */}
            {isCreator && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-pink-950/80 to-indigo-950/80 border border-pink-500/40 shadow-2xl space-y-4 glow-pink"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-pink-300 font-bold uppercase tracking-wider text-xs sm:text-sm font-mono">
                    <Share2 className="w-5 h-5 text-pink-400 shrink-0" />
                    <span>Generate Shareable Surprise Link 🔗</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                    Saved & Ready
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-white/70 font-light">
                  Your surprise edits have been saved to local storage and the database! Copy and send this unique shareable link to <strong>{surprise.recipient_name}</strong>:
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs sm:text-sm focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Shareable Link</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Song Player (if song exists) */}
            {surprise.song_url && (
              <MusicPlayer songUrl={surprise.song_url} autoPlay={true} />
            )}

            {/* Occasion Milestone Stats Card (Days Till Birth / Days of Togetherness) */}
            {(() => {
              const counter = calculateDaysCounter(surprise.birth_date);
              if (surprise.occasion_type === 'birthday') {
                return (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="glass p-6 sm:p-8 rounded-3xl glow-violet border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-widest font-mono">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span>Journey on Earth Milestone Stats 🌍</span>
                      </div>
                      <span className="text-[11px] text-pink-300 font-mono font-semibold">
                        {surprise.nickname ? `Celebrated as "${surprise.nickname}"` : `Celebrated for ${surprise.recipient_name}`}
                      </span>
                    </div>

                    {counter ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-1">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          <div className="text-2xl sm:text-3xl font-serif font-bold text-pink-300">
                            {counter.days.toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-wider mt-1 font-mono">
                            Days Spreading Joy
                          </div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                            ~{counter.years}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-wider mt-1 font-mono">
                            Years on Earth
                          </div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          <div className="text-2xl sm:text-3xl font-serif font-bold text-violet-300">
                            {(counter.days * 24).toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-wider mt-1 font-mono">
                            Hours of Smiles
                          </div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-300">
                            {counter.days.toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-wider mt-1 font-mono">
                            Earth Rotations
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-black/30 rounded-2xl text-center text-xs text-white/70 font-mono">
                        🎂 Celebrating {surprise.recipient_name} {surprise.nickname ? `("${surprise.nickname}")` : ''}'s special birthday journey! ✨
                      </div>
                    )}
                  </motion.div>
                );
              } else {
                return (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="glass p-6 sm:p-8 rounded-3xl glow-pink border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-widest font-mono">
                        <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                        <span>Love & Togetherness Milestones 💕</span>
                      </div>
                      <span className="text-[11px] text-pink-300 font-mono font-semibold">
                        {surprise.recipient_name} {surprise.partner_name ? `& ${surprise.partner_name}` : ''}
                      </span>
                    </div>

                    {counter ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center pt-1">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          <div className="text-2xl sm:text-3xl font-serif font-bold text-pink-300">
                            {counter.days.toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-wider mt-1 font-mono">
                            Days of Togetherness
                          </div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                            ~{counter.years}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-wider mt-1 font-mono">
                            Years of Boundless Love
                          </div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
                          <div className="text-2xl sm:text-3xl font-serif font-bold text-violet-300">
                            {(counter.days * 24).toLocaleString()}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-wider mt-1 font-mono">
                            Hours of Shared Joy
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-black/30 rounded-2xl text-center text-xs text-white/70 font-mono">
                        🥂 Toasting to the beautiful marriage & journey of {surprise.recipient_name} {surprise.partner_name ? `& ${surprise.partner_name}` : ''}! 💍
                      </div>
                    )}
                  </motion.div>
                );
              }
            })()}

            {/* Message Card */}
            <motion.div
              whileHover={{ y: -2 }}
              className="glass p-8 sm:p-12 rounded-3xl glow-pink border border-white/10 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-widest">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                <span>Heartfelt Message</span>
              </div>

              <blockquote className="text-xl sm:text-3xl font-serif italic leading-relaxed text-white">
                "{surprise.message}"
              </blockquote>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-white/40 font-mono">
                  Created with love ❤️
                </div>
                <div className="text-base sm:text-lg font-serif font-bold text-amber-300">
                  — {surprise.sender_name}
                </div>
              </div>
            </motion.div>

            {/* Cake Cutting First Ceremony (if enabled) */}
            {surprise.cake_cutting_enabled !== false && !cakeCutDone && (
              <CakeCutting
                recipientName={surprise.recipient_name}
                occasionType={surprise.occasion_type}
                onComplete={() => setCakeCutDone(true)}
              />
            )}

            {/* Voice Note Message (if attached) */}
            {surprise.voice_note_url && (
              <VoiceNotePlayer
                voiceNoteUrl={surprise.voice_note_url}
                senderName={surprise.sender_name}
              />
            )}

            {/* Photo Gallery (if photos exist) */}
            {surprise.photo_urls && surprise.photo_urls.length > 0 && (
              <PhotoGallery
                photos={surprise.photo_urls}
                recipientName={surprise.recipient_name}
              />
            )}

            {/* Before & After Photo Comparison Slider */}
            {surprise.before_after && (
              <BeforeAfterSlider data={surprise.before_after} />
            )}

            {/* Interactive Timeline of Memories */}
            {surprise.timeline_events && surprise.timeline_events.length > 0 && (
              <TimelineView events={surprise.timeline_events} />
            )}

            {/* Interactive Pop The Balloons Mini Game */}
            {surprise.balloons_game_enabled !== false && (
              <BalloonsGame
                recipientName={surprise.recipient_name}
                balloonMessages={surprise.balloon_messages}
              />
            )}

            {/* Interactive Scratch Card Vouchers */}
            {surprise.scratch_cards && surprise.scratch_cards.length > 0 && (
              <ScratchCard
                cards={surprise.scratch_cards}
                recipientName={surprise.recipient_name}
              />
            )}

            {/* Interactive Mini Quiz */}
            {surprise.quiz_questions && surprise.quiz_questions.length > 0 && (
              <MiniQuiz questions={surprise.quiz_questions} recipientName={surprise.recipient_name} />
            )}

            {/* Inside Jokes & Memes Flip Cards */}
            {surprise.inside_jokes && surprise.inside_jokes.length > 0 && (
              <InsideJokesCards jokes={surprise.inside_jokes} />
            )}

            {/* Secret Sealed Envelopes & Hidden Messages */}
            {surprise.hidden_messages && surprise.hidden_messages.length > 0 && (
              <HiddenMessagesEnvelope messages={surprise.hidden_messages} senderName={surprise.sender_name} />
            )}


            {/* Bottom Celebration Footer */}
            <div className="glass p-8 rounded-3xl glow-gold text-white text-center space-y-4 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-300 mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-serif text-white">
                Want to create a surprise for someone you love?
              </h3>
              <p className="text-xs text-white/50 font-light max-w-md mx-auto">
                Create your own personalized celebration link with live reveal countdowns, custom music, and photo walls!
              </p>
              <button
                onClick={onNavigateHome}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
              >
                Create New Surprise Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurprisePage;
