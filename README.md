# 🎁 SurpriseUngaluku (சர்ப்ரைஸ் உங்களுக்கு) 🎉

An interactive, multi-themed, immersive celebration web application built for creating unforgettable personalized surprise experiences for Birthdays, Weddings, and Anniversaries.

Powered by **React 19**, **Vite**, **Express**, **Tailwind CSS v4**, **Framer Motion**, **Supabase**, and **Google Gemini AI**.

---

## 🌟 Highlights & Key Features

### 🎂 Interactive Celebration Modules
* **🔪 Virtual Cake Cutting Experience** (`CakeCutting.tsx`): Interactive cake slicing with knife animations, blowable candles, candle sparklers, and celebratory sound effects.
* **🎈 Balloon Popping Mini-Game** (`BalloonsGame.tsx`): Tap floating celebratory balloons to pop them and discover hidden secret messages and birthday wishes.
* **🎟️ Interactive Scratch Cards** (`ScratchCard.tsx`): Canvas-powered scratch-off cards that recipients can scratch with their cursor or touch to reveal hidden surprises.
* **💌 Sealed Envelope & Letter** (`HiddenMessagesEnvelope.tsx`): Interactive envelope with letter extraction animation for reading intimate messages.
* **✨ Before & After Memory Slider** (`BeforeAfterSlider.tsx`): Interactive dual-image slider allowing recipients to compare "Then vs Now" memories.
* **❓ Relationship Mini-Quiz** (`MiniQuiz.tsx`): Custom relationship trivia quiz for the recipient with scoring, confetti, and instant feedback.
* **🃏 Inside Jokes Flip Cards** (`InsideJokesCards.tsx`): Interactive 3D flip cards displaying shared memories, inside jokes, and funny moments.
* **⏳ IST Countdown Timer & Early Lock** (`CountdownTimer.tsx`): Real-time countdown timer with Indian Standard Time (IST) support. If opened early, recipients see a lock screen with *"இன்னும் சிறிது நேரம் காத்திருங்கள் ⏳"*.
* **🖼️ Memory Photo Gallery & Lightbox** (`PhotoGallery.tsx`): High-definition photo memory grid with modal lightbox zoom.
* **🎵 Background Music Player** (`MusicPlayer.tsx`): Integrated audio player with custom controls, volume adjustment, and auto-play trigger on reveal.
* **🎤 Voice Note Player** (`VoiceNotePlayer.tsx`): Dedicated player for personalized audio voice recordings.
* **📅 Story Timeline View** (`TimelineView.tsx`): Chronological milestone timeline tracking special moments throughout your journey together.
* **🎊 Confetti Explosions** (`Confetti.tsx`): Dynamic particle confetti cannons powered by `canvas-confetti`.

---

## 🤖 AI-Powered Wish Generator (Google Gemini AI)

Integrated with Google Gemini AI (`@google/genai`) to generate tailored celebration content on demand:
* Personalized birthday, anniversary, and wedding wish messages.
* Automatically generated relationship trivia quizzes.
* Creative inside joke suggestions and photo captions.

---

## 🛟 Smart Hybrid Storage & Fallback Architecture

* **Supabase Integration**: Stores surprises in PostgreSQL with Row Level Security (RLS) and uploads media files (photos & audio) to Supabase Storage buckets.
* **Automatic In-Memory Fallback**: If Supabase credentials are not provided or unreachable, the Express server automatically falls back to an internal memory store (`Map`), allowing instant testing and demo creation without database dependencies.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript 5.8, Vite 6 |
| **Styling & UI** | Tailwind CSS v4, Framer Motion (`motion/react`), Lucide Icons |
| **Backend & Server** | Node.js, Express.js 4, `tsx` (TypeScript Execution) |
| **AI Integration** | Google Gemini AI SDK (`@google/genai`) |
| **Database & Storage** | Supabase PostgreSQL, Supabase Storage (`photos` & `audio` buckets) |
| **Effects & Canvas** | Canvas Confetti, HTML5 Canvas API |

---

## 📂 Project Structure

```
SurpriseUngaluku/
├── assets/                       # Static branding and assets
├── lib/                          # Backend & shared utilities
├── src/
│   ├── components/               # Interactive UI components
│   │   ├── BalloonsGame.tsx      # Balloon pop mini-game
│   │   ├── BeforeAfterSlider.tsx # Before/After image comparison slider
│   │   ├── CakeCutting.tsx       # Interactive virtual cake cutting
│   │   ├── Confetti.tsx          # Confetti particle animations
│   │   ├── CountdownTimer.tsx    # Real-time IST countdown timer
│   │   ├── HiddenMessagesEnvelope.tsx # Sealed envelope animation
│   │   ├── InsideJokesCards.tsx  # 3D flip card memory grid
│   │   ├── MiniQuiz.tsx          # Custom trivia quiz module
│   │   ├── MusicPlayer.tsx       # Audio player module
│   │   ├── PhotoGallery.tsx      # Lightbox photo gallery
│   │   ├── ScratchCard.tsx       # Canvas scratch card module
│   │   ├── SurpriseForm.tsx      # Multi-step surprise builder form
│   │   ├── SurprisePage.tsx      # Recipient celebration view
│   │   ├── TimelineView.tsx      # Milestone timeline component
│   │   └── VoiceNotePlayer.tsx   # Audio voice note player
│   ├── lib/
│   │   └── supabase.ts           # Supabase client initialization
│   ├── App.tsx                   # Main React App router & state
│   ├── index.css                 # Global CSS & Tailwind v4 imports
│   └── main.tsx                  # React entry point
├── server.ts                     # Express server & API endpoints
├── .env.example                  # Environment template file
├── .env                          # Local environment variables
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite build configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js (v18+ recommended) and `npm` installed.

```bash
node -v
npm -v
```

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/SurpriseUngaluku.git
cd SurpriseUngaluku
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
# Google Gemini AI Key (Optional: for AI message & quiz generation)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"

# Supabase Credentials (Required for cloud persistence & file uploads)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

---

## 🗄️ Supabase Setup & SQL Schema

If using Supabase for production persistence, run the following script in the **Supabase SQL Editor**:

```sql
-- 1. Create the 'surprises' table
CREATE TABLE IF NOT EXISTS public.surprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name TEXT NOT NULL,
  occasion_type TEXT NOT NULL,
  occasion_datetime TIMESTAMPTZ NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  song_url TEXT,
  timer_enabled BOOLEAN DEFAULT true,
  birth_date TEXT,
  partner_name TEXT,
  nickname TEXT,
  before_after JSONB,
  timeline_events JSONB,
  quiz_questions JSONB,
  inside_jokes JSONB,
  hidden_messages JSONB,
  scratch_cards JSONB,
  voice_note_url TEXT,
  balloon_messages JSONB,
  cake_cutting_enabled BOOLEAN DEFAULT true,
  balloons_game_enabled BOOLEAN DEFAULT true,
  theme_preference TEXT DEFAULT 'midnight',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.surprises ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for public access
CREATE POLICY "Allow public read access on surprises"
  ON public.surprises FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on surprises"
  ON public.surprises FOR INSERT
  WITH CHECK (true);

-- 4. Storage Buckets Configuration
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true) ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies
CREATE POLICY "Public storage read photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public storage insert photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Public storage read audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio');
CREATE POLICY "Public storage insert audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio');
```

---

## 🏃 Running the Application

### Development Mode

Start the development server (runs Express + Vite middleware on port 3000):

```bash
npm run dev
```

Open your browser and navigate to: `http://localhost:3000`

### Production Build

Build the Vite client bundle and transpile the Express server:

```bash
npm run build
```

Start the production Node server:

```bash
npm start
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the server in development mode using `tsx` on `server.ts` |
| `npm run build` | Builds client assets with Vite and bundles `server.ts` with `esbuild` |
| `npm start` | Launches the compiled production server (`dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking without emitting files |
| `npm run clean` | Removes the `dist` build directory |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p center>
  Made with ❤️ to bring smiles and magical celebration memories to your loved ones! 🎉✨
</p>
