import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Gift,
  Heart,
  Award,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Upload,
  Music,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Loader2,
  Share2,
  CheckCircle2,
  Wand2
} from 'lucide-react';
import {
  OccasionType,
  ApiCreateSurpriseResponse,
  Surprise,
  ThemeType,
  BeforeAfterPhoto,
  TimelineEvent,
  QuizQuestion,
  InsideJoke,
  ScratchCardItem
} from '../types';
import { encodeSurpriseToHash } from '../lib/urlHashHelper';
import { supabase } from '../lib/supabase';



interface SurpriseFormProps {
  initialOccasion?: OccasionType;
  onCreated: (id: string, link: string) => void;
  onNavigateToSurprise: (id: string) => void;
}

const MESSAGE_TEMPLATES = {
  birthday: [
    "Happy Birthday! May your day be filled with happiness, laughter, and everything you've ever wished for! 🎂✨",
    "To a truly incredible person: Wishing you another amazing year of laughter, growth, and joy! Happy Birthday! 🎉💖",
    "Sending you infinite love and virtual hugs on your birthday! Cheers to making more unforgettable memories together! 🥳🍾"
  ],
  wedding: [
    "Congratulations on your wedding day! Wishing both of you a lifetime of endless love, joy, and togetherness! 💍🥂",
    "May your union bring you more happiness than you can imagine! Cheers to a beautiful life ahead together! ❤️✨",
    "Wishing you two a magical wedding and a love story that grows stronger with every passing year! 🎉🌺"
  ],
  anniversary: [
    "Happy Anniversary! May the love you share continue to grow deeper and brighter with each passing year! 💞🌹",
    "Cheers to another wonderful year of love, togetherness, and beautiful memories! Happy Anniversary! 🥂💖",
    "To a wonderful couple: Wishing you a joyous anniversary and many more blessed years together! ✨❤️"
  ]
};

export const SurpriseForm: React.FC<SurpriseFormProps> = ({
  initialOccasion = 'birthday',
  onCreated,
  onNavigateToSurprise
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [occasionType, setOccasionType] = useState<OccasionType>(initialOccasion);
  
  // Default datetime: set to 5 minutes in future in IST/local format for easy testing
  const getDefaultDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [occasionDatetime, setOccasionDatetime] = useState(getDefaultDatetime());
  const [activePreset, setActivePreset] = useState<'1min' | '5min' | 'instant' | null>('5min');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(true);

  // Interactive Feature Toggles & States
  const [themePreference, setThemePreference] = useState<ThemeType>('midnight');
  const [cakeCuttingEnabled, setCakeCuttingEnabled] = useState(true);
  const [balloonsGameEnabled, setBalloonsGameEnabled] = useState(false);

  const [enableBeforeAfter, setEnableBeforeAfter] = useState(false);
  const [beforeUrl, setBeforeUrl] = useState('');
  const [afterUrl, setAfterUrl] = useState('');
  const [beforeLabel, setBeforeLabel] = useState('Childhood / Back Then 👶');
  const [afterLabel, setAfterLabel] = useState('Grown Up / Stunning Today ✨');

  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [musicEnabled, setMusicEnabled] = useState(true);

  const [enableVoiceNote, setEnableVoiceNote] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState('');

  const [balloonMessages, setBalloonMessages] = useState<string[]>([]);

  const [enableTimeline, setEnableTimeline] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const [enableQuiz, setEnableQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const [enableInsideJokes, setEnableInsideJokes] = useState(false);
  const [insideJokes, setInsideJokes] = useState<InsideJoke[]>([]);

  const [enableHiddenMessages, setEnableHiddenMessages] = useState(false);
  const [hiddenMessages, setHiddenMessages] = useState<string[]>([]);

  const [enableScratchCards, setEnableScratchCards] = useState(false);
  const [scratchCards, setScratchCards] = useState<ScratchCardItem[]>([]);

  // Auto-Fill sample interactive pack
  const fillSampleInteractiveData = () => {
    const name = recipientName.trim() || 'Superstar';
    setCakeCuttingEnabled(true);
    setBalloonsGameEnabled(true);
    setBalloonMessages([
      `Surprise 1: ${name}, you bring infinite happiness to everyone around you! 💖`,
      'Surprise 2: Here is a voucher for 1 Unlimited Pizza & Movie Night! 🍕🎬',
      'Surprise 3: May all your wildest dreams & secret wishes come true this year! ✨🌟',
      'Surprise 4: Secret Code unlocked: #ALWAYS_BE_HAPPY! Keep smiling always! 😊🎉'
    ]);

    setEnableBeforeAfter(true);
    setBeforeUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80');
    setAfterUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');

    setEnableTimeline(true);
    setTimelineEvents([
      { id: '1', year: '2018', title: 'First Meeting at Cafe', description: 'Met over coffee and talked for 4 hours non-stop!', emoji: '☕' },
      { id: '2', year: '2020', title: 'Unforgettable Vacation', description: 'Drove through rain, lost our way, but had the best memories!', emoji: '🚗' },
      { id: '3', year: '2024', title: 'Achieved Big Milestone', description: 'Celebrated landing dream goals & shared endless laughter!', emoji: '🎉' }
    ]);

    setEnableQuiz(true);
    setQuizQuestions([
      {
        id: 'q1',
        question: `What is ${name}'s absolute favorite comfort food?`,
        options: ['Biryani with extra Aloo', 'Cheesy Pepperoni Pizza', 'Hot Chocolate Brownie', 'Street style Pani Puri'],
        correctIndex: 0,
        explanation: 'Biryani always wins their heart no matter what time of day!'
      },
      {
        id: 'q2',
        question: 'Where was our most hilarious road trip?',
        options: ['Manali Snow Trip', 'Goa Beach Sunrise', 'Kerala Backwaters', 'Ooty Lake Ride'],
        correctIndex: 1,
        explanation: 'Goa beach sunrise with morning tea was magical!'
      }
    ]);

    setEnableInsideJokes(true);
    setInsideJokes([
      { id: 'j1', title: 'The Pineapple Pizza Debate 🍕', joke: 'Remember ordering Hawaiian pizza by accident and pretending to love it for 2 years?', emoji: '🍍' },
      { id: 'j2', title: 'Google Maps Shortcut 🗺️', joke: 'Taking 3 wrong U-turns and declaring "We are taking the scenic shortcut!"', emoji: '🚗' }
    ]);

    setEnableHiddenMessages(true);
    setHiddenMessages([
      `You are truly one in a million, ${name}! Thank you for bringing warmth and light everywhere! ✨`,
      'Secret Ticket Unlocked: Valid for 1 free ice cream & movie night on us! 🍦🎬',
      'No matter how fast time flies, you will always be our favorite person! ❤️'
    ]);

    setEnableScratchCards(true);
    setScratchCards([
      { id: 's1', title: 'Golden Voucher #1 🎫', reward: '1 Free Unlimited Pizza & Movie Night with your favorite toppings!', emoji: '🍕' },
      { id: 's2', title: 'Golden Voucher #2 ☕', reward: 'Unlimited Coffee & Long Late-Night Conversations Pass!', emoji: '☕' }
    ]);

    if (!spotifyUrl) {
      setSpotifyUrl('https://open.spotify.com/track/0yPmtIuIsc8bH3I6S2L179');
    }
  };

  const clearAllInteractiveData = () => {
    setEnableBeforeAfter(false);
    setEnableTimeline(false);
    setEnableQuiz(false);
    setEnableInsideJokes(false);
    setEnableHiddenMessages(false);
    setEnableScratchCards(false);
    setEnableVoiceNote(false);
    setBalloonsGameEnabled(false);
    setBalloonMessages([]);
  };


  // File states
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [song, setSong] = useState<File | null>(null);
  const [songName, setSongName] = useState<string>('');
  const [songPreviewUrl, setSongPreviewUrl] = useState<string | null>(null);

  // Status & Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ id: string; link: string; hasCloudPhotos?: boolean; hasMp3?: boolean } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const songInputRef = useRef<HTMLInputElement>(null);
  const voiceNoteInputRef = useRef<HTMLInputElement>(null);
  const beforePhotoInputRef = useRef<HTMLInputElement>(null);
  const afterPhotoInputRef = useRef<HTMLInputElement>(null);

  // Voice Note File Upload Handler
  const handleVoiceNoteFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Voice note audio file must be under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVoiceNoteUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fast client-side image compression helper
  const compressPhotoFile = (file: File, maxWidth = 800, quality = 0.65): Promise<string> => {
    return new Promise((resolve) => {
      if (file.size < 150 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string) || '');
          reader.readAsDataURL(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('');
      };
      img.src = url;
    });
  };


  // Childhood (Before) Photo Upload Handler
  const handleBeforePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBeforeUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Present (After) Photo Upload Handler
  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAfterUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick preset timers
  const handleQuickTimerPreset = (minutesToAdd: number, presetKey: '1min' | '5min' | 'instant') => {
    setActivePreset(presetKey);
    const target = new Date();
    target.setMinutes(target.getMinutes() + minutesToAdd);
    const tzoffset = target.getTimezoneOffset() * 60000;
    const localISOTime = new Date(target.getTime() - tzoffset).toISOString().slice(0, 16);
    setOccasionDatetime(localISOTime);
  };

  // Handle Photo selection with validation (max 6 photos, max 5MB each)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setErrorMsg(null);

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    if (photos.length + selectedFiles.length > 6) {
      setErrorMsg('You can upload a maximum of 6 photos.');
      return;
    }

    for (const file of selectedFiles as File[]) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setErrorMsg('Invalid file format. Please select JPEG, PNG, or WEBP images.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`Photo "${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setPhotos((prev) => [...prev, ...validFiles]);
    setPhotoPreviews((prev) => [...prev, ...validPreviews]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Song selection with validation (max 10MB MP3)
  const handleSongSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
      setErrorMsg('Please select a valid MP3 audio file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Song file exceeds the 10MB size limit.');
      return;
    }

    setSong(file);
    setSongName(file.name);
    setSongPreviewUrl(URL.createObjectURL(file));
  };

  const removeSong = () => {
    setSong(null);
    setSongName('');
    setSongPreviewUrl(null);
  };

  const applyTemplateMessage = () => {
    const templates = MESSAGE_TEMPLATES[occasionType];
    const randomMsg = templates[Math.floor(Math.random() * templates.length)];
    setMessage(randomMsg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!recipientName.trim()) {
      setErrorMsg('Please enter the recipient name.');
      return;
    }
    if (!senderName.trim()) {
      setErrorMsg('Please enter your name (sender).');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please write a heartfelt surprise message.');
      return;
    }
    if (!occasionDatetime) {
      setErrorMsg('Please select the occasion date and time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('recipient_name', recipientName.trim());
      formData.append('occasion_type', occasionType);

      // Convert local datetime input to ISO 8601 UTC string
      const isoDatetime = new Date(occasionDatetime).toISOString();
      formData.append('occasion_datetime', isoDatetime);

      formData.append('sender_name', senderName.trim());
      formData.append('message', message.trim());
      formData.append('timer_enabled', String(timerEnabled));
      if (birthDate.trim()) formData.append('birth_date', birthDate.trim());
      if (partnerName.trim()) formData.append('partner_name', partnerName.trim());
      if (nickname.trim()) formData.append('nickname', nickname.trim());

      // Interactive Features Append
      formData.append('theme_preference', themePreference);
      formData.append('cake_cutting_enabled', String(cakeCuttingEnabled));
      formData.append('balloons_game_enabled', String(balloonsGameEnabled));

      const beforeAfterData = enableBeforeAfter ? {
        beforeUrl: beforeUrl.trim() || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        afterUrl: afterUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        beforeLabel: beforeLabel.trim() || 'Childhood / Earlier',
        afterLabel: afterLabel.trim() || 'Present Day'
      } : null;

      const activeTimeline = enableTimeline
        ? (timelineEvents.length > 0 ? timelineEvents : [
            { id: 't1', year: '2020', title: 'The Day We First Met ✨', description: 'The beginning of an awesome journey!', emoji: '✨' },
            { id: 't2', year: '2023', title: 'Unforgettable Memories 🚗', description: 'Special moments cherished forever.', emoji: '🌟' }
          ])
        : null;

      const activeQuiz = enableQuiz
        ? (quizQuestions.length > 0 ? quizQuestions : [
            { id: 'q1', question: 'What is our absolute favorite hangout memory?', options: ['Late Night Drive 🚗', 'Coffee Shop ☕', 'Beach Sunset 🌅', 'Movie Night 🍿'], correctIndex: 1, explanation: 'Coffee Shop is always our go-to spot! ☕' }
          ])
        : null;

      const activeJokes = enableInsideJokes
        ? (insideJokes.length > 0 ? insideJokes : [
            { id: 'j1', title: 'The Late Arrival Legend ⏰', joke: 'Remember when you blamed traffic on a Sunday morning?', emoji: '⏰' }
          ])
        : null;

      const activeMessages = enableHiddenMessages
        ? (hiddenMessages.length > 0 ? hiddenMessages : ['You bring so much warmth and happiness into everyone\'s life! ✨', 'May this year bring you endless success and joy! ❤️'])
        : null;

      const activeScratchCards = enableScratchCards
        ? (scratchCards.length > 0 ? scratchCards : [
            { id: 's1', title: 'Special Voucher 🎟️', reward: 'Free Treat on Me! 🍕', emoji: '🎁' }
          ])
        : null;

      const activeVoiceNote = (enableVoiceNote && voiceNoteUrl.trim() && !voiceNoteUrl.startsWith('data:'))
        ? voiceNoteUrl.trim()
        : (enableVoiceNote ? 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a81617.mp3?filename=happy-birthday-110058.mp3' : null);

      const activeBalloons = balloonsGameEnabled
        ? (balloonMessages.length > 0 ? balloonMessages : ['May your year be filled with success! ✨', 'Stay happy & healthy always! 🎈', 'Keep shining bright! 🌟'])
        : null;

      // Spotify URL only (no MP3 base64 in shareable links - too large)
      const activeSpotifyUrl = (musicEnabled && spotifyUrl.trim()) ? spotifyUrl.trim() : null;

      if (beforeAfterData) formData.append('before_after', JSON.stringify(beforeAfterData));
      if (activeTimeline) formData.append('timeline_events', JSON.stringify(activeTimeline));
      if (activeQuiz) formData.append('quiz_questions', JSON.stringify(activeQuiz));
      if (activeJokes) formData.append('inside_jokes', JSON.stringify(activeJokes));
      if (activeMessages) formData.append('hidden_messages', JSON.stringify(activeMessages));
      if (activeScratchCards) formData.append('scratch_cards', JSON.stringify(activeScratchCards));
      if (activeVoiceNote) formData.append('voice_note_url', activeVoiceNote);
      if (activeBalloons) formData.append('balloon_messages', JSON.stringify(activeBalloons));

      // Compress all photos client-side
      const photoDataUrls: string[] = photos.length > 0
        ? await Promise.all(photos.map((photo) => compressPhotoFile(photo)))
        : [];

      // Ultra-short local ID
      const localId = 's_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

      // Full record with all data for localStorage (creator can see everything on their device)
      const fallbackRecord: Surprise = {
        id: localId,
        recipient_name: recipientName.trim(),
        occasion_type: occasionType,
        occasion_datetime: isoDatetime,
        sender_name: senderName.trim(),
        message: message.trim(),
        photo_urls: photoDataUrls,     // base64 for local preview
        song_url: activeSpotifyUrl,    // only Spotify in shareable record
        timer_enabled: timerEnabled,
        created_at: new Date().toISOString(),
        birth_date: birthDate.trim() || null,
        partner_name: partnerName.trim() || null,
        nickname: nickname.trim() || null,
        before_after: beforeAfterData,
        timeline_events: activeTimeline,
        quiz_questions: activeQuiz,
        inside_jokes: activeJokes,
        hidden_messages: activeMessages,
        scratch_cards: activeScratchCards,
        voice_note_url: activeVoiceNote,
        balloon_messages: activeBalloons,
        theme_preference: themePreference,
        cake_cutting_enabled: cakeCuttingEnabled,
        balloons_game_enabled: balloonsGameEnabled
      };

      let finalId = localId;
      let isSavedToCloud = false;
      let cloudPhotoUrls: string[] = [];

      // ─── STEP 1: Upload photos to Supabase Storage → get permanent public URLs ───
      if (supabase && photoDataUrls.length > 0) {
        try {
          const uploadPromises = photoDataUrls.map(async (dataUrl, i) => {
            if (!dataUrl || dataUrl.length < 50) return null;
            // Convert base64 to blob
            const base64Data = dataUrl.split(',')[1];
            if (!base64Data) return null;
            const byteChars = atob(base64Data);
            const byteNums = new Uint8Array(byteChars.length);
            for (let j = 0; j < byteChars.length; j++) byteNums[j] = byteChars.charCodeAt(j);
            const blob = new Blob([byteNums], { type: 'image/jpeg' });
            const filePath = `${localId}/photo_${i + 1}_${Date.now()}.jpg`;
            const { error: uploadErr } = await supabase.storage
              .from('photos')
              .upload(filePath, blob, { contentType: 'image/jpeg', upsert: false });
            if (uploadErr) {
              console.warn('Photo upload error for', filePath, uploadErr);
              return null;
            }
            const { data: publicData } = supabase.storage.from('photos').getPublicUrl(filePath);
            return publicData?.publicUrl || null;
          });

          const uploadTimeout = new Promise<null[]>((resolve) =>
            setTimeout(() => resolve([]), 25000)
          );
          const results = await Promise.race([Promise.all(uploadPromises), uploadTimeout]);
          cloudPhotoUrls = (results as (string | null)[]).filter(Boolean) as string[];
        } catch (storErr) {
          console.warn('Photo storage upload failed:', storErr);
        }
      }

      // ─── STEP 2: Insert to Supabase DB with cloud photo URLs ───
      if (supabase) {
        try {
          const dbRecord: any = {
            recipient_name: recipientName.trim(),
            occasion_type: occasionType,
            occasion_datetime: isoDatetime,
            sender_name: senderName.trim(),
            message: message.trim(),
            photo_urls: cloudPhotoUrls.length > 0 ? cloudPhotoUrls : [],
            song_url: activeSpotifyUrl,
            timer_enabled: timerEnabled,
            birth_date: birthDate.trim() || null,
            partner_name: partnerName.trim() || null,
            nickname: nickname.trim() || null
          };

          const supaPromise = supabase.from('surprises').insert([dbRecord]).select().single();
          const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error('DB timeout') }), 15000)
          );
          const { data: supaData, error: supaErr } = await Promise.race([supaPromise, timeoutPromise]);

          if (supaData && !supaErr) {
            finalId = supaData.id || localId;
            isSavedToCloud = true;
            // Cache full record (with base64 photos for local viewing) under the cloud ID
            try {
              const fullRecord = { ...fallbackRecord, id: finalId, photo_urls: cloudPhotoUrls.length > 0 ? cloudPhotoUrls : photoDataUrls };
              localStorage.setItem(`surprise_${finalId}`, JSON.stringify(fullRecord));
            } catch (e) {}
          } else {
            console.warn('DB insert failed/timeout:', supaErr);
          }
        } catch (ex) {
          console.warn('Supabase DB exception:', ex);
        }
      }

      // ─── STEP 3: Server API fallback ───
      if (!isSavedToCloud) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          formData.append('photoDataUrls', JSON.stringify(photoDataUrls));
          if (activeSpotifyUrl) formData.append('songDataUrl', activeSpotifyUrl);
          const res = await fetch('/api/create-surprise', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          const contentType = res.headers.get('content-type');
          if (res.ok && contentType?.includes('application/json')) {
            const data: ApiCreateSurpriseResponse = await res.json();
            if (data.success && data.id) {
              finalId = data.id;
              if (data.storageMode === 'supabase') isSavedToCloud = true;
              const recordToSave = data.surprise || { ...fallbackRecord, id: finalId };
              try { localStorage.setItem(`surprise_${finalId}`, JSON.stringify(recordToSave)); } catch (e) {}
            }
          }
        } catch (fetchErr) {
          console.warn('API fallback failed/aborted:', fetchErr);
        }
      }

      // ─── STEP 4: Cache everything in localStorage ───
      try {
        // Always store with base64 photos so creator can preview on this device
        const cacheRecord = { ...fallbackRecord, id: finalId, photo_urls: cloudPhotoUrls.length > 0 ? cloudPhotoUrls : photoDataUrls };
        localStorage.setItem(`surprise_${finalId}`, JSON.stringify(cacheRecord));
        localStorage.setItem(`surprise_${localId}`, JSON.stringify(cacheRecord));
      } catch (e) {
        console.warn('localStorage cache failed:', e);
      }

      // ─── STEP 5: Build shareable URL ───
      // When saved to cloud → clean short URL (no hash, no photos in URL)
      // When NOT saved to cloud → include compact text-only hash (no base64!)
      let fullShareableUrl = `${window.location.origin}/surprise/${finalId}`;
      if (!isSavedToCloud) {
        const hashData = encodeSurpriseToHash({ ...fallbackRecord, photo_urls: [] }); // no photos in hash
        if (hashData) {
          fullShareableUrl += `#s=${encodeURIComponent(hashData)}`;
        }
      }

      setCreatedResult({ id: finalId, link: fullShareableUrl, hasCloudPhotos: cloudPhotoUrls.length > 0, hasMp3: !!song });
      onCreated(finalId, fullShareableUrl);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Error creating surprise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdResult) return;
    navigator.clipboard.writeText(createdResult.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };


  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4 relative z-10">
      {createdResult ? (
        /* Success Screen */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-6 sm:p-10 rounded-3xl glow-pink text-center space-y-6 border border-white/10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-400 mb-2">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <div className="inline-block px-3.5 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs uppercase tracking-[0.2em] font-semibold">
              Surprise Ready! 🎉
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-white mt-3">
              Surprise Link for {recipientName} is Ready!
            </h2>
            <p className="text-sm text-white/60 font-light mt-2 max-w-lg mx-auto">
              Share this unique link with {recipientName}. They will see the live reveal countdown and unlock your custom message, photo wall, and music!
            </p>
          </div>

          {/* Shareable Link Box */}
          <div className="p-5 bg-black/40 rounded-2xl border border-white/10 text-left space-y-3">
            <label className="text-xs font-medium text-white/60 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Share2 className="w-3.5 h-3.5 text-pink-400" />
              Unique Shareable Surprise Link:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdResult.link}
                className="w-full bg-black/60 text-pink-300 text-xs sm:text-sm font-mono px-4 py-3 rounded-xl border border-white/15 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-pink-500/20"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Link length indicator */}
            <p className={`text-[10px] font-mono ${createdResult.link.length <= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              Link length: {createdResult.link.length} characters {createdResult.link.length <= 80 ? '✓ Short enough for QR & WhatsApp' : '⚠ May be long for some apps'}
            </p>
          </div>

          {/* Photo & Storage Status */}
          {createdResult.hasCloudPhotos ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>✅ Photos uploaded to cloud — They will be visible to <strong>{recipientName}</strong> when they open the link on any device!</span>
            </div>
          ) : photos.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>⚠️ Photos saved locally only. <strong>{recipientName}</strong> may see a default image. To fix: make sure Supabase Storage bucket <code className="bg-black/40 px-1 rounded">photos</code> is set to <strong>Public</strong> in your Supabase dashboard.</span>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToSurprise(createdResult.link.replace(window.location.origin, ''))}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Surprise Page</span>
            </button>
            <button
              onClick={() => {
                setCreatedResult(null);
                setRecipientName('');
                setSenderName('');
                setMessage('');
                setPhotos([]);
                setPhotoPreviews([]);
                setSong(null);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Create Another Surprise
            </button>
          </div>
        </motion.div>
      ) : (
        /* Form Card */
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 sm:p-10 rounded-3xl glow-pink border border-white/10 space-y-8"
        >
          {/* Header */}
          <div className="border-b border-white/10 pb-5">
            <div className="inline-block px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              Personalized Surprise Maker
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
              Create Your Surprise Link
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light mt-1">
              Fill in the details below to generate a beautiful digital surprise page with custom timer, music, and photos.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Occasion Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/70">
              1. Choose Occasion Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'birthday', label: 'Birthday', icon: Gift },
                { type: 'wedding', label: 'Wedding', icon: Award },
                { type: 'anniversary', label: 'Anniversary', icon: Heart }
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOccasionType(type as OccasionType)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                    occasionType === type
                      ? 'border-pink-500 bg-pink-500/15 text-white glow-pink font-semibold'
                      : 'border-white/10 bg-black/30 hover:bg-white/5 text-white/60'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1.5 text-pink-400" />
                  <span className="text-xs sm:text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Occasion-Specific Questions & Names */}
          <div className="space-y-4 p-5 bg-black/30 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-pink-400 font-serif text-sm font-semibold border-b border-white/10 pb-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {occasionType === 'birthday' && 'Birthday Celebration Details'}
                {occasionType === 'wedding' && 'Wedding Couple & Vows Setup'}
                {occasionType === 'anniversary' && 'Anniversary Couple & Journey Details'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recipient / Primary Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-400" />
                  {occasionType === 'birthday' && 'Birthday Star Name *'}
                  {occasionType === 'wedding' && 'Groom / Partner 1 Name *'}
                  {occasionType === 'anniversary' && 'Spouse / Partner 1 Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    occasionType === 'birthday'
                      ? 'e.g. Sarah / Vijay'
                      : 'e.g. David / Vikram'
                  }
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium focus:outline-none transition-all"
                />
              </div>

              {/* Partner Name for Wedding/Anniversary or Nickname for Birthday */}
              {occasionType === 'birthday' ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    Cute Nickname / Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chinnu, Sweetie, Champ"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium focus:outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-pink-400" />
                    {occasionType === 'wedding' ? 'Bride / Partner 2 Name *' : 'Spouse / Partner 2 Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emma / Anita"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium focus:outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Date of Birth or Wedding/Togetherness Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {occasionType === 'birthday' && 'Date of Birth (For Age & Days Lived Counter 🌍)'}
                  {occasionType === 'wedding' && 'Marriage / Togetherness Date (For Days Counter 💍)'}
                  {occasionType === 'anniversary' && 'Wedding Date (For Togetherness Days Counter 💕)'}
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium focus:outline-none transition-all text-white/90"
                />
                <p className="text-[10px] text-white/40 italic">
                  {occasionType === 'birthday'
                    ? 'Generates a live counter of total days lived on Earth till their birthday!'
                    : 'Generates a live counter of total days & years of togetherness & love!'}
                </p>
              </div>

              {/* Sender Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-violet-400" />
                  Your Name / Sender(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex & Friends / With Love"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Occasion Date & Time (IST) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                Occasion Date & Time (IST / Local) *
              </label>
              <span className="text-[11px] text-white/40 font-mono">Default: +5 Mins</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="datetime-local"
                required
                value={occasionDatetime}
                onChange={(e) => {
                  setOccasionDatetime(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium focus:outline-none transition-all"
              />
            </div>

            {/* Quick Presets for Easy Testing */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-white/40">Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleQuickTimerPreset(1, '1min')}
                className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all ${
                  activePreset === '1min'
                    ? 'border-pink-500/60 bg-pink-500/25 text-pink-300 shadow-md shadow-pink-500/10'
                    : 'border-white/15 bg-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                In 1 Min
              </button>
              <button
                type="button"
                onClick={() => handleQuickTimerPreset(5, '5min')}
                className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all ${
                  activePreset === '5min'
                    ? 'border-pink-500/60 bg-pink-500/25 text-pink-300 shadow-md shadow-pink-500/10'
                    : 'border-white/15 bg-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                In 5 Mins
              </button>
              <button
                type="button"
                onClick={() => handleQuickTimerPreset(0, 'instant')}
                className={`px-3 py-1 rounded-full border text-[11px] font-semibold transition-all ${
                  activePreset === 'instant'
                    ? 'border-pink-500/60 bg-pink-500/25 text-pink-300 shadow-md shadow-pink-500/10'
                    : 'border-white/15 bg-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                Right Now (Instant Unlock)
              </button>
            </div>
          </div>

          {/* Message Textarea with AI Template Helper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                Surprise Message *
              </label>
              <button
                type="button"
                onClick={applyTemplateMessage}
                className="text-xs text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" /> Auto-Suggest Message
              </button>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Write your heartfelt message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Photo Upload (Up to 6 photos) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-violet-400" />
                Photos (Up to 6 images)
              </label>
              <span className="text-xs font-mono text-white/40">{photos.length}/6 uploaded</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {photoPreviews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/15 group">
                  <img src={src} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {photos.length < 6 && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="aspect-square rounded-xl border border-dashed border-white/20 hover:border-pink-500/50 bg-black/30 hover:bg-pink-500/10 flex flex-col items-center justify-center text-white/40 hover:text-pink-300 transition-all cursor-pointer p-2"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium text-center">Add Photo</span>
                </button>
              )}
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Interactive Magic Features & Customizer Section */}
          <div className="p-5 bg-gradient-to-r from-purple-950/50 via-black/50 to-pink-950/50 rounded-2xl border border-pink-500/30 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-amber-300 font-serif text-sm font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Interactive Features & Custom Controls 🎮</span>
                </div>
                <p className="text-[11px] text-white/60">
                  Enable/disable or customize games, scratch cards, voice notes, and timeline memories!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fillSampleInteractiveData}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Fill Interactive Pack ✨</span>
                </button>
                <button
                  type="button"
                  onClick={clearAllInteractiveData}
                  className="px-2.5 py-1.5 rounded-xl border border-white/20 text-white/60 hover:text-rose-400 hover:border-rose-500/30 text-xs font-mono transition-all cursor-pointer"
                >
                  Turn Off All
                </button>
              </div>
            </div>

            {/* Virtual Cake Cutting Ceremony Toggle */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  🎂 Virtual Cake Cutting Ceremony (First View)
                </span>
                <span className="text-[10px] text-white/50 block">
                  Recipient lights candles and cuts virtual cake before unlocking surprise!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCakeCuttingEnabled(!cakeCuttingEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                  cakeCuttingEnabled
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-white/10 text-white/40 border border-white/10'
                }`}
              >
                {cakeCuttingEnabled ? 'ENABLED' : 'OFF'}
              </button>
            </div>

            {/* Voice Note Recording / File Upload */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-pink-300 flex items-center gap-1.5 font-mono">
                  🎙️ Voice Note Message (Upload File or URL)
                </span>
                <button
                  type="button"
                  onClick={() => setEnableVoiceNote(!enableVoiceNote)}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    enableVoiceNote
                      ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {enableVoiceNote ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {enableVoiceNote && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => voiceNoteInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-mono font-medium flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Voice Note File (MP3/WAV/M4A)</span>
                    </button>
                    <input
                      ref={voiceNoteInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleVoiceNoteFileUpload}
                      className="hidden"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Or paste Voice Note Audio URL..."
                    value={voiceNoteUrl}
                    onChange={(e) => setVoiceNoteUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40 focus:outline-none font-mono"
                  />

                  {voiceNoteUrl && (
                    <div className="p-2.5 bg-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-between text-xs text-pink-200 font-mono">
                      <span className="truncate">✅ Voice Note Attached ({voiceNoteUrl.startsWith('data:') ? 'Uploaded Audio File' : 'Audio URL'})</span>
                      <button
                        type="button"
                        onClick={() => setVoiceNoteUrl('')}
                        className="text-white/40 hover:text-rose-400"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Glow-Up Memory Slider (Then vs Now) File Upload */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-300 flex items-center gap-1.5 font-mono">
                  📸 Glow-Up Memory Slider (Childhood vs Present Photo Upload)
                </span>
                <button
                  type="button"
                  onClick={() => setEnableBeforeAfter(!enableBeforeAfter)}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    enableBeforeAfter
                      ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {enableBeforeAfter ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {enableBeforeAfter && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Childhood Photo */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <span className="text-[11px] font-mono text-violet-300 font-semibold block">Childhood / Back Then Photo</span>
                      <button
                        type="button"
                        onClick={() => beforePhotoInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/30 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Childhood Photo File</span>
                      </button>
                      <input
                        ref={beforePhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBeforePhotoUpload}
                        className="hidden"
                      />
                      <input
                        type="text"
                        placeholder="Or paste Childhood Photo URL..."
                        value={beforeUrl}
                        onChange={(e) => setBeforeUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white/90"
                      />
                      {beforeUrl && (
                        <div className="relative w-full h-20 rounded-lg overflow-hidden border border-white/20">
                          <img src={beforeUrl} alt="Before Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Present Photo */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <span className="text-[11px] font-mono text-violet-300 font-semibold block">Present / Grown Up Photo</span>
                      <button
                        type="button"
                        onClick={() => afterPhotoInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/30 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Present Photo File</span>
                      </button>
                      <input
                        ref={afterPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAfterPhotoUpload}
                        className="hidden"
                      />
                      <input
                        type="text"
                        placeholder="Or paste Present Photo URL..."
                        value={afterUrl}
                        onChange={(e) => setAfterUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white/90"
                      />
                      {afterUrl && (
                        <div className="relative w-full h-20 rounded-lg overflow-hidden border border-white/20">
                          <img src={afterUrl} alt="After Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline of Beautiful Memories ⏳ Builder */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 font-mono">
                  ⏳ Timeline of Beautiful Memories (Year / Event Builder)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableTimeline;
                    setEnableTimeline(next);
                    if (next && timelineEvents.length === 0) {
                      setTimelineEvents([
                        { id: '1', year: '2020', title: 'First Unforgettable Meeting', description: 'Met over coffee and talked for hours!', emoji: '☕' },
                        { id: '2', year: '2024', title: 'Big Goal Achieved', description: 'Celebrated landing dream goals together!', emoji: '🎉' }
                      ]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    enableTimeline
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {enableTimeline ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {enableTimeline && (
                <div className="space-y-3 pt-1">
                  {timelineEvents.map((event, idx) => (
                    <div key={event.id || idx} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-emerald-300 font-bold">Memory #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setTimelineEvents(timelineEvents.filter((_, i) => i !== idx))}
                          className="text-white/40 hover:text-rose-400 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Year / Date (e.g. 2021)"
                          value={event.year}
                          onChange={(e) => {
                            const updated = [...timelineEvents];
                            updated[idx].year = e.target.value;
                            setTimelineEvents(updated);
                          }}
                          className="px-3 py-1.5 rounded-lg glass-input text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Event Title"
                          value={event.title}
                          onChange={(e) => {
                            const updated = [...timelineEvents];
                            updated[idx].title = e.target.value;
                            setTimelineEvents(updated);
                          }}
                          className="px-3 py-1.5 rounded-lg glass-input text-xs text-white sm:col-span-2"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Description of memory..."
                        value={event.description}
                        onChange={(e) => {
                          const updated = [...timelineEvents];
                          updated[idx].description = e.target.value;
                          setTimelineEvents(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-white/80"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setTimelineEvents([
                      ...timelineEvents,
                      { id: `t_${Date.now()}`, year: `${new Date().getFullYear()}`, title: 'Unforgettable Memory', description: 'A moment we will treasure forever!', emoji: '✨' }
                    ])}
                    className="w-full py-2 rounded-xl border border-dashed border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-500/10 cursor-pointer"
                  >
                    + Add New Timeline Event ⏳
                  </button>
                </div>
              )}
            </div>

            {/* Inside Jokes & Memes 🤫 Builder */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5 font-mono">
                  🤫 Inside Jokes & Memes (Click To Flip Card Builder)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableInsideJokes;
                    setEnableInsideJokes(next);
                    if (next && insideJokes.length === 0) {
                      setInsideJokes([
                        { id: 'j1', title: 'The Scenic Shortcut 🗺️', joke: 'Taking 3 wrong U-turns and declaring "We are taking the scenic shortcut!"', emoji: '🚗' },
                        { id: 'j2', title: 'The Secret Code 🤫', joke: 'Remember whenever we say "Pineapple" everyone bursts out laughing?', emoji: '🍍' }
                      ]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    enableInsideJokes
                      ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {enableInsideJokes ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {enableInsideJokes && (
                <div className="space-y-3 pt-1">
                  {insideJokes.map((joke, idx) => (
                    <div key={joke.id || idx} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-sky-300 font-bold">Joke Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setInsideJokes(insideJokes.filter((_, i) => i !== idx))}
                          className="text-white/40 hover:text-rose-400 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Card Front Title (e.g. Scenic Shortcut)"
                          value={joke.title}
                          onChange={(e) => {
                            const updated = [...insideJokes];
                            updated[idx].title = e.target.value;
                            setInsideJokes(updated);
                          }}
                          className="px-3 py-1.5 rounded-lg glass-input text-xs text-white sm:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="Emoji (e.g. 🍕)"
                          value={joke.emoji || '🤫'}
                          onChange={(e) => {
                            const updated = [...insideJokes];
                            updated[idx].emoji = e.target.value;
                            setInsideJokes(updated);
                          }}
                          className="px-3 py-1.5 rounded-lg glass-input text-xs text-white"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Secret Flip Punchline / Inside Joke text..."
                        value={joke.joke}
                        onChange={(e) => {
                          const updated = [...insideJokes];
                          updated[idx].joke = e.target.value;
                          setInsideJokes(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-white/90"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setInsideJokes([
                      ...insideJokes,
                      { id: `j_${Date.now()}`, title: 'Hilarious Inside Joke 🤫', joke: 'Only you and I know the story behind this!', emoji: '🤣' }
                    ])}
                    className="w-full py-2 rounded-xl border border-dashed border-sky-500/40 text-sky-300 text-xs font-mono hover:bg-sky-500/10 cursor-pointer"
                  >
                    + Add New Inside Joke Flip Card 🤫
                  </button>
                </div>
              )}
            </div>

            {/* Secret Envelopes & Hidden Notes ✉️ Builder */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 font-mono">
                  ✉️ Secret Envelopes & Hidden Notes (User Custom Secret Notes)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableHiddenMessages;
                    setEnableHiddenMessages(next);
                    if (next && hiddenMessages.length === 0) {
                      setHiddenMessages([
                        `Secret Note #1: ${recipientName.trim() || 'Superstar'}, you inspire everyone around you every single day! ❤️`,
                        'Secret Note #2: Whenever you feel down, remember we are always cheering for you! 🌟'
                      ]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    enableHiddenMessages
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {enableHiddenMessages ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {enableHiddenMessages && (
                <div className="space-y-2.5 pt-1">
                  {hiddenMessages.map((msg, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-rose-300 shrink-0">✉️ Envelope #{hIdx + 1}:</span>
                      <input
                        type="text"
                        placeholder={`Type Secret Envelope #${hIdx + 1} Message...`}
                        value={msg}
                        onChange={(e) => {
                          const updated = [...hiddenMessages];
                          updated[hIdx] = e.target.value;
                          setHiddenMessages(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setHiddenMessages(hiddenMessages.filter((_, i) => i !== hIdx))}
                        className="text-white/40 hover:text-rose-400 text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setHiddenMessages([
                      ...hiddenMessages,
                      `Secret Note #${hiddenMessages.length + 1}: Keep shining bright always! ✨`
                    ])}
                    className="w-full py-2 rounded-xl border border-dashed border-rose-500/40 text-rose-300 text-xs font-mono hover:bg-rose-500/10 cursor-pointer"
                  >
                    + Add New Secret Envelope Note ✉️
                  </button>
                </div>
              )}
            </div>

            {/* Mini Memory Quiz Custom Question Builder */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 font-mono">
                  🧠 Mini Memory Quiz (User Custom Questions & Choices)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableQuiz;
                    setEnableQuiz(next);
                    if (next && quizQuestions.length === 0) {
                      setQuizQuestions([
                        {
                          id: 'q1',
                          question: `What is ${recipientName.trim() || 'our friend'}'s favorite place to relax?`,
                          options: ['Coffee Shop', 'Beach Sunset', 'Mountain Cabin', 'Cozy Bedroom'],
                          correctIndex: 1,
                          explanation: 'Beach sunset with warm tea!'
                        }
                      ]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    enableQuiz
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {enableQuiz ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {enableQuiz && (
                <div className="space-y-3 pt-1">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={q.id} className="p-3 bg-white/5 rounded-xl border border-purple-500/20 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-xs font-mono font-bold text-purple-300">Question #{qIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIdx))}
                          className="text-white/40 hover:text-rose-400 text-xs"
                        >
                          Remove Question
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Type Quiz Question (e.g. What is our funniest memory together?)"
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...quizQuestions];
                          updated[qIdx].question = e.target.value;
                          setQuizQuestions(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctIndex === optIdx}
                              onChange={() => {
                                const updated = [...quizQuestions];
                                updated[qIdx].correctIndex = optIdx;
                                setQuizQuestions(updated);
                              }}
                              className="accent-purple-400 cursor-pointer"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...quizQuestions];
                                const opts = [...updated[qIdx].options];
                                opts[optIdx] = e.target.value;
                                updated[qIdx].options = opts;
                                setQuizQuestions(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Explanation when answer is revealed (Optional)..."
                        value={q.explanation || ''}
                        onChange={(e) => {
                          const updated = [...quizQuestions];
                          updated[qIdx].explanation = e.target.value;
                          setQuizQuestions(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-white/70"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setQuizQuestions([
                      ...quizQuestions,
                      {
                        id: `q_${Date.now()}`,
                        question: 'Where did we first meet each other?',
                        options: ['School / College', 'Coffee Cafe', 'Online Group', 'Party Event'],
                        correctIndex: 0,
                        explanation: 'A memory that started it all!'
                      }
                    ])}
                    className="w-full py-2 rounded-xl border border-dashed border-purple-500/40 text-purple-300 text-xs font-mono hover:bg-purple-500/10 cursor-pointer"
                  >
                    + Add New Quiz Question 🧠
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Scratch Card Vouchers & Custom Secret Quotes */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 font-mono">
                  🪙 Interactive Scratch Cards (Type Secret Quotes / Words)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableScratchCards;
                    setEnableScratchCards(next);
                    if (next && scratchCards.length === 0) {
                      setScratchCards([
                        { id: 's1', title: 'Secret Word #1 ✨', reward: 'You bring endless warmth and joy to every room! ❤️', emoji: '✨' }
                      ]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    enableScratchCards
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {enableScratchCards ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {enableScratchCards && (
                <div className="space-y-3 pt-1">
                  {scratchCards.map((card, idx) => (
                    <div key={card.id} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-300">Secret Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setScratchCards(scratchCards.filter((_, i) => i !== idx))}
                          className="text-white/40 hover:text-rose-400 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Card Title (e.g. Secret Quote #1)"
                          value={card.title}
                          onChange={(e) => {
                            const updated = [...scratchCards];
                            updated[idx].title = e.target.value;
                            setScratchCards(updated);
                          }}
                          className="px-3 py-2 rounded-lg glass-input text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Type Secret Quote / Secret Word to reveal..."
                          value={card.reward}
                          onChange={(e) => {
                            const updated = [...scratchCards];
                            updated[idx].reward = e.target.value;
                            setScratchCards(updated);
                          }}
                          className="px-3 py-2 rounded-lg glass-input text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setScratchCards([
                      ...scratchCards,
                      { id: `s_${Date.now()}`, title: 'Secret Quote 🎁', reward: 'Your smile lights up the darkest days!', emoji: '✨' }
                    ])}
                    className="w-full py-2 rounded-xl border border-dashed border-amber-500/40 text-amber-300 text-xs font-mono hover:bg-amber-500/10 cursor-pointer"
                  >
                    + Add New Secret Quote Scratch Card 🪙
                  </button>
                </div>
              )}
            </div>

            {/* Pop The Balloons Mini Game & Custom Balloon Wishes */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-pink-300 flex items-center gap-1.5 font-mono">
                  🎈 Mini Game: Pop The Balloons (Type Custom Wishes)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !balloonsGameEnabled;
                    setBalloonsGameEnabled(next);
                    if (next && balloonMessages.length === 0) {
                      setBalloonMessages([
                        `Surprise 1: ${recipientName.trim() || 'Superstar'}, you make every moment brighter! 💖`,
                        'Surprise 2: May all your secret wishes & wildest dreams come true! 🌟'
                      ]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    balloonsGameEnabled
                      ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}
                >
                  {balloonsGameEnabled ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {balloonsGameEnabled && (
                <div className="space-y-2.5 pt-1">
                  {balloonMessages.map((msg, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-pink-300 shrink-0">🎈 #{bIdx + 1}:</span>
                      <input
                        type="text"
                        placeholder={`Type Balloon #${bIdx + 1} Secret Wish or Note...`}
                        value={msg}
                        onChange={(e) => {
                          const updated = [...balloonMessages];
                          updated[bIdx] = e.target.value;
                          setBalloonMessages(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setBalloonMessages(balloonMessages.filter((_, i) => i !== bIdx))}
                        className="text-white/40 hover:text-rose-400 text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setBalloonMessages([
                      ...balloonMessages,
                      `Surprise #${balloonMessages.length + 1}: Stay happy, stay awesome always! 🎉`
                    ])}
                    className="w-full py-2 rounded-xl border border-dashed border-pink-500/40 text-pink-300 text-xs font-mono hover:bg-pink-500/10 cursor-pointer"
                  >
                    + Add New Balloon Wish 🎈
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Background Music & Spotify Section */}
          <div className="space-y-3 p-5 bg-gradient-to-r from-emerald-950/40 via-black/40 to-purple-950/40 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-emerald-300 flex items-center gap-1.5 font-mono">
                <Music className="w-4 h-4 text-emerald-400" />
                Background Music 🎧
              </label>
              {/* Spotify ON/OFF Toggle */}
              <button
                type="button"
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                  musicEnabled
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-white/10 text-white/40 border border-white/10'
                }`}
              >
                {musicEnabled ? 'MUSIC ON 🎵' : 'MUSIC OFF'}
              </button>
            </div>

            {musicEnabled && (
              <>
                <p className="text-xs text-white/70">
                  Select a Spotify preset or paste any Spotify track URL. Music plays automatically when the surprise is opened!
                </p>

                {/* Spotify Track Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { label: '🎂 Happy Birthday Song', url: 'https://open.spotify.com/track/0yPmtIuIsc8bH3I6S2L179' },
                    { label: '💖 Perfect - Ed Sheeran', url: 'https://open.spotify.com/track/0KH3pIAn5u45q77d2I3a4d' },
                    { label: '🌹 A Thousand Years', url: 'https://open.spotify.com/track/6M39B3b90gQ8l9M8S0hUa8' },
                    { label: '✨ Tum Hi Ho - Arijit', url: 'https://open.spotify.com/track/3FMY1yQBDsTBFCVfg3M2pb' }
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => { setSpotifyUrl(preset.url); if (song) removeSong(); }}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                        spotifyUrl === preset.url
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-100 font-semibold shadow-md'
                          : 'bg-black/30 border-white/10 text-white/70 hover:text-white hover:border-emerald-500/30'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {spotifyUrl === preset.url && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Custom Spotify URL Input */}
                <div className="pt-2 space-y-1">
                  <label className="text-[11px] text-emerald-300/80 font-mono">Custom Spotify Track URL:</label>
                  <input
                    type="text"
                    placeholder="https://open.spotify.com/track/..."
                    value={spotifyUrl}
                    onChange={(e) => { setSpotifyUrl(e.target.value); if (song) removeSong(); }}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                {/* Clear music button */}
                {spotifyUrl && (
                  <button
                    type="button"
                    onClick={() => { setSpotifyUrl(''); removeSong(); }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove selected music
                  </button>
                )}
              </>
            )}
          </div>

          {/* Timer Checkbox */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-white">Enable Reveal Countdown Timer</h4>
                <p className="text-xs text-white/50 font-light">
                  Recipient sees live countdown timer until occasion date/time is reached.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={timerEnabled}
              onChange={(e) => setTimerEnabled(e.target.checked)}
              className="w-5 h-5 rounded-md accent-pink-500 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 text-white font-semibold text-base shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Surprise Link...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Shareable Surprise Link</span>
              </>
            )}
          </button>
        </motion.form>
      )}
    </div>
  );
};

export default SurpriseForm;
