export type OccasionType = 'birthday' | 'wedding' | 'anniversary';
export type ThemeType = 'midnight' | 'romance' | 'celestial' | 'cyber';

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface InsideJoke {
  id: string;
  title: string;
  joke: string;
  emoji?: string;
}

export interface BeforeAfterPhoto {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export interface ScratchCardItem {
  id: string;
  title: string;
  reward: string;
  emoji?: string;
}

export interface Surprise {
  id: string;
  recipient_name: string;
  occasion_type: OccasionType;
  occasion_datetime: string; // ISO 8601 string in UTC or with offset
  sender_name: string;
  message: string;
  photo_urls: string[];
  song_url?: string | null;
  timer_enabled: boolean;
  created_at: string;
  birth_date?: string | null;
  partner_name?: string | null;
  nickname?: string | null;
  // New interactive features
  before_after?: BeforeAfterPhoto | null;
  timeline_events?: TimelineEvent[] | null;
  quiz_questions?: QuizQuestion[] | null;
  inside_jokes?: InsideJoke[] | null;
  hidden_messages?: string[] | null;
  scratch_cards?: ScratchCardItem[] | null;
  voice_note_url?: string | null;
  balloon_messages?: string[] | null;
  theme_preference?: ThemeType | null;
  cake_cutting_enabled?: boolean;
  balloons_game_enabled?: boolean;
}

export interface CreateSurpriseInput {
  recipient_name: string;
  occasion_type: OccasionType;
  occasion_datetime: string;
  sender_name: string;
  message: string;
  timer_enabled: boolean;
  photos?: File[];
  photoDataUrls?: string[];
  song?: File | null;
  songDataUrl?: string | null;
  birth_date?: string | null;
  partner_name?: string | null;
  nickname?: string | null;
  before_after?: BeforeAfterPhoto | null;
  timeline_events?: TimelineEvent[] | null;
  quiz_questions?: QuizQuestion[] | null;
  inside_jokes?: InsideJoke[] | null;
  hidden_messages?: string[] | null;
  scratch_cards?: ScratchCardItem[] | null;
  voice_note_url?: string | null;
  balloon_messages?: string[] | null;
  theme_preference?: ThemeType | null;
  cake_cutting_enabled?: boolean;
  balloons_game_enabled?: boolean;
}

export interface ApiCreateSurpriseResponse {
  success: boolean;
  id?: string;
  link?: string;
  surprise?: Surprise;
  error?: string;
  storageMode?: 'supabase' | 'fallback';
}

export interface DraftSurprise {
  id: string;
  updated_at: string;
  title?: string;
  recipient_name: string;
  partner_name?: string;
  nickname?: string;
  birth_date?: string;
  occasion_type: OccasionType;
  occasion_datetime: string;
  sender_name: string;
  message: string;
  timer_enabled: boolean;
  theme_preference: ThemeType;
  cake_cutting_enabled: boolean;
  balloons_game_enabled: boolean;
  enableBeforeAfter: boolean;
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
  spotifyUrl: string;
  musicEnabled: boolean;
  enableVoiceNote: boolean;
  voiceNoteUrl: string;
  balloonMessages: string[];
  enableTimeline: boolean;
  timelineEvents: TimelineEvent[];
  enableQuiz: boolean;
  quizQuestions: QuizQuestion[];
  enableInsideJokes: boolean;
  insideJokes: InsideJoke[];
  enableHiddenMessages: boolean;
  hiddenMessages: string[];
  enableScratchCards: boolean;
  scratchCards: ScratchCardItem[];
  photoPreviews: string[];
}


