import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import { randomUUID } from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Supabase setup
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url_here' &&
  !supabaseUrl.includes('your_supabase');

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized on server with URL:', supabaseUrl);
  } catch (err) {
    console.error('⚠️ Failed to initialize Supabase client:', err);
  }
} else {
  console.log('ℹ️ Supabase credentials not provided. Server will use local memory fallback for surprises.');
}

// Memory fallback store for surprises
interface FallbackSurprise {
  id: string;
  recipient_name: string;
  occasion_type: 'birthday' | 'wedding' | 'anniversary';
  occasion_datetime: string;
  sender_name: string;
  message: string;
  photo_urls: string[];
  song_url?: string | null;
  timer_enabled: boolean;
  created_at: string;
  birth_date?: string | null;
  partner_name?: string | null;
  nickname?: string | null;
  before_after?: any;
  timeline_events?: any;
  quiz_questions?: any;
  inside_jokes?: any;
  hidden_messages?: any;
  scratch_cards?: any;
  voice_note_url?: string | null;
  balloon_messages?: any;
  cake_cutting_enabled?: boolean;
  balloons_game_enabled?: boolean;
  theme_preference?: any;
}

const fallbackSurprises = new Map<string, FallbackSurprise>();

// Pre-seed a sample surprise for testing/demo
const demoSurpriseId = 'demo-birthday-surprise';
fallbackSurprises.set(demoSurpriseId, {
  id: demoSurpriseId,
  recipient_name: 'Sarah',
  occasion_type: 'birthday',
  occasion_datetime: new Date(Date.now() + 60 * 1000).toISOString(), // 1 min in future
  sender_name: 'Alex & Friends',
  message: 'Wishing you the happiest birthday filled with joy, laughter, and unforgettable moments! May this special year bring you everything your heart desires! 🎉🎂✨',
  photo_urls: [
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80'
  ],
  song_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a81617.mp3?filename=happy-birthday-110058.mp3',
  timer_enabled: true,
  created_at: new Date().toISOString(),
  birth_date: '2000-08-15',
  nickname: 'Chinnu',
  theme_preference: 'midnight',
  before_after: {
    beforeUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    beforeLabel: 'Childhood Star 👶 (2005)',
    afterLabel: 'Grown Up Legend ✨ (Now)'
  },
  timeline_events: [
    { id: '1', year: '2018', title: 'First Meeting at Cafe', description: 'Met over coffee and talked for 4 hours non-stop!', emoji: '☕' },
    { id: '2', year: '2020', title: 'Epic Goa Road Trip', description: 'Drove through rain, lost our way, but had the best memories!', emoji: '🚗' },
    { id: '3', year: '2024', title: 'Achieved Big Milestone', description: 'Celebrated landing the dream job & buying the first car!', emoji: '🎉' }
  ],
  quiz_questions: [
    {
      id: 'q1',
      question: 'What is Sarah\'s absolute favorite comfort food?',
      options: ['Biryani with extra Aloo', 'Cheesy Pepperoni Pizza', 'Hot Chocolate Brownie', 'Street style Pani Puri'],
      correctIndex: 0,
      explanation: 'Biryani always wins her heart no matter what time of day!'
    },
    {
      id: 'q2',
      question: 'Where was our most unforgettable vacation together?',
      options: ['Manali Snow Trip', 'Goa Beach Sunrise', 'Kerala Backwaters', 'Ooty Lake Ride'],
      correctIndex: 1,
      explanation: 'Goa beach sunrise with morning tea was magical!'
    },
    {
      id: 'q3',
      question: 'What is her funny habit when she gets super excited?',
      options: ['Claps like a baby', 'Starts speaking 100mph', 'Does a mini happy dance', 'All of the above!'],
      correctIndex: 3,
      explanation: 'She definitely does all three together every single time!'
    }
  ],
  inside_jokes: [
    { id: 'j1', title: 'The Pineapple Pizza Debate 🍕', joke: 'Remember when you ordered Hawaiian pizza by accident and pretended you loved pineapple for 2 years?', emoji: '🍍' },
    { id: 'j2', title: 'Google Maps Navigator 🗺️', joke: 'Taking 3 wrong U-turns and declaring "We are taking the scenic shortcut!"', emoji: '🚗' },
    { id: 'j3', title: 'The 5-Minute Warning ⏰', joke: '"I\'m 5 minutes away" actually means "I am still searching for my left shoe".', emoji: '👟' }
  ],
  hidden_messages: [
    'You are truly one in a million, thank you for bringing light into every room! ✨',
    'Secret Code #SUPERSTAR unlocked! Present this ticket for 1 free ice-cream treat! 🍦',
    'No matter how many years pass, you will always be our favorite human being! ❤️'
  ]
});

// Multer memory storage configuration for uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 7 // 6 photos + 1 song
  }
});

// API Routes

// Health & Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured
  });
});

app.get('/api/supabase-status', (_req: Request, res: Response) => {
  res.json({
    configured: isSupabaseConfigured,
    url: isSupabaseConfigured ? supabaseUrl : null
  });
});

// GET /api/surprise/:id
app.get('/api/surprise/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // First check fallback map
    if (fallbackSurprises.has(id)) {
      return res.json({
        success: true,
        surprise: fallbackSurprises.get(id),
        source: 'memory'
      });
    }

    // Query Supabase if configured
    if (supabase) {
      const { data, error } = await supabase
        .from('surprises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase fetch error:', error);
      } else if (data) {
        return res.json({
          success: true,
          surprise: data,
          source: 'supabase'
        });
      }
    }

    return res.status(404).json({
      success: false,
      error: 'Surprise not found or link has expired.'
    });
  } catch (err: any) {
    console.error('Error fetching surprise:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching surprise details.'
    });
  }
});

// POST /api/create-surprise
app.post(
  '/api/create-surprise',
  upload.fields([
    { name: 'photos', maxCount: 6 },
    { name: 'song', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    try {
      const {
        recipient_name,
        occasion_type = 'birthday',
        occasion_datetime,
        sender_name,
        message,
        timer_enabled = 'true',
        photoDataUrls: photoDataUrlsJson,
        songDataUrl,
        birth_date,
        partner_name,
        nickname,
        before_after: beforeAfterRaw,
        timeline_events: timelineRaw,
        quiz_questions: quizRaw,
        inside_jokes: jokesRaw,
        hidden_messages: hiddenMsgsRaw,
        scratch_cards: scratchRaw,
        voice_note_url: voiceNoteUrl,
        balloon_messages: balloonMsgsRaw,
        cake_cutting_enabled: cakeCuttingRaw,
        balloons_game_enabled: balloonsGameRaw,
        theme_preference
      } = req.body;

      // Safe JSON parsing helper
      const parseJsonSafe = (input: any) => {
        if (!input) return null;
        if (typeof input === 'string') {
          try {
            return JSON.parse(input);
          } catch (e) {
            return null;
          }
        }
        return input;
      };

      const parsedBeforeAfter = parseJsonSafe(beforeAfterRaw);
      const parsedTimeline = parseJsonSafe(timelineRaw);
      const parsedQuiz = parseJsonSafe(quizRaw);
      const parsedJokes = parseJsonSafe(jokesRaw);
      const parsedHiddenMsgs = parseJsonSafe(hiddenMsgsRaw);
      const parsedScratchCards = parseJsonSafe(scratchRaw);
      const parsedBalloonMsgs = parseJsonSafe(balloonMsgsRaw);
      const isCakeCutting = cakeCuttingRaw === 'false' ? false : true;
      const isBalloonsGame = balloonsGameRaw === 'true' || balloonsGameRaw === true ? true : false;


      if (!recipient_name || !sender_name || !message || !occasion_datetime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: recipient_name, sender_name, message, and occasion_datetime.'
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const photoFiles = files?.['photos'] || [];
      const songFile = files?.['song']?.[0];

      const surpriseId = randomUUID();
      const photoUrls: string[] = [];
      let songUrl: string | null = null;

      // Handle photos from JSON base64 if provided
      let parsedPhotoDataUrls: string[] = [];
      if (photoDataUrlsJson) {
        try {
          parsedPhotoDataUrls = typeof photoDataUrlsJson === 'string' ? JSON.parse(photoDataUrlsJson) : photoDataUrlsJson;
        } catch (e) {
          console.warn('Failed to parse photoDataUrlsJson', e);
        }
      }

      // If Supabase is available, upload to Supabase Storage buckets
      if (supabase) {
        try {
          // Upload photos to 'photos' bucket
          for (let i = 0; i < photoFiles.length; i++) {
            const photo = photoFiles[i];
            const fileExt = photo.originalname.split('.').pop() || 'jpg';
            const filePath = `${surpriseId}/photo_${i + 1}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('photos')
              .upload(filePath, photo.buffer, {
                contentType: photo.mimetype,
                upsert: true
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('photos')
                .getPublicUrl(filePath);
              photoUrls.push(publicUrlData.publicUrl);
            } else {
              console.error('Error uploading photo to Supabase storage:', uploadError);
            }
          }

          // Upload song to 'audio' bucket
          if (songFile) {
            const fileExt = songFile.originalname.split('.').pop() || 'mp3';
            const filePath = `${surpriseId}/song_${Date.now()}.${fileExt}`;

            const { error: songUploadError } = await supabase.storage
              .from('audio')
              .upload(filePath, songFile.buffer, {
                contentType: songFile.mimetype,
                upsert: true
              });

            if (!songUploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('audio')
                .getPublicUrl(filePath);
              songUrl = publicUrlData.publicUrl;
            } else {
              console.error('Error uploading song to Supabase storage:', songUploadError);
            }
          }

          // Insert into 'surprises' table
          const isTimerEnabled = timer_enabled === 'true' || timer_enabled === true;
          const finalPhotoUrls = photoUrls.length > 0 ? photoUrls : parsedPhotoDataUrls;
          const finalSongUrl = songUrl || songDataUrl || null;

          const record = {
            id: surpriseId,
            recipient_name,
            occasion_type,
            occasion_datetime,
            sender_name,
            message,
            photo_urls: finalPhotoUrls,
            song_url: finalSongUrl,
            timer_enabled: isTimerEnabled,
            created_at: new Date().toISOString(),
            birth_date: birth_date || null,
            partner_name: partner_name || null,
            nickname: nickname || null,
            before_after: parsedBeforeAfter || null,
            timeline_events: parsedTimeline || null,
            quiz_questions: parsedQuiz || null,
            inside_jokes: parsedJokes || null,
            hidden_messages: parsedHiddenMsgs || null,
            scratch_cards: parsedScratchCards || null,
            voice_note_url: voiceNoteUrl || null,
            balloon_messages: parsedBalloonMsgs || null,
            cake_cutting_enabled: isCakeCutting,
            balloons_game_enabled: isBalloonsGame,
            theme_preference: theme_preference || 'midnight'
          };

          const { data: insertData, error: dbError } = await supabase
            .from('surprises')
            .insert([record])
            .select()
            .single();

          if (dbError) {
            console.error('Supabase DB Insert Error, falling back to memory:', dbError);
            fallbackSurprises.set(surpriseId, record);
          } else {
            console.log('✅ Surprise created in Supabase DB:', insertData.id);
          }

          return res.json({
            success: true,
            id: surpriseId,
            link: `/surprise/${surpriseId}`,
            surprise: record,
            storageMode: dbError ? 'fallback' : 'supabase'
          });
        } catch (storageErr) {
          console.error('Storage processing exception, using fallback:', storageErr);
        }
      }

      // Memory/Base64 Fallback Mode
      // Process photos from uploaded buffers or data URLs
      if (photoFiles.length > 0) {
        photoFiles.forEach((file) => {
          const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          photoUrls.push(base64);
        });
      } else if (parsedPhotoDataUrls.length > 0) {
        photoUrls.push(...parsedPhotoDataUrls);
      }

      if (songFile) {
        songUrl = `data:${songFile.mimetype};base64,${songFile.buffer.toString('base64')}`;
      } else if (songDataUrl) {
        songUrl = songDataUrl;
      }

      const isTimerEnabled = timer_enabled === 'true' || timer_enabled === true;

      const fallbackRecord: FallbackSurprise = {
        id: surpriseId,
        recipient_name,
        occasion_type,
        occasion_datetime,
        sender_name,
        message,
        photo_urls: photoUrls,
        song_url: songUrl,
        timer_enabled: isTimerEnabled,
        created_at: new Date().toISOString(),
        birth_date: birth_date || null,
        partner_name: partner_name || null,
        nickname: nickname || null,
        before_after: parsedBeforeAfter || null,
        timeline_events: parsedTimeline || null,
        quiz_questions: parsedQuiz || null,
        inside_jokes: parsedJokes || null,
        hidden_messages: parsedHiddenMsgs || null,
        scratch_cards: parsedScratchCards || null,
        voice_note_url: voiceNoteUrl || null,
        balloon_messages: parsedBalloonMsgs || null,
        cake_cutting_enabled: isCakeCutting,
        balloons_game_enabled: isBalloonsGame,
        theme_preference: theme_preference || 'midnight'
      };

      fallbackSurprises.set(surpriseId, fallbackRecord);

      return res.json({
        success: true,
        id: surpriseId,
        link: `/surprise/${surpriseId}`,
        surprise: fallbackRecord,
        storageMode: 'fallback'
      });
    } catch (err: any) {
      console.error('Error creating surprise:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to create surprise.'
      });
    }
  }
);

// Start Express Server with Vite Dev Middleware or Static Production Build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
