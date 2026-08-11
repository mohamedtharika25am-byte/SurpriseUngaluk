import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Database, ExternalLink, ShieldCheck, HardDrive, Terminal } from 'lucide-react';

interface SupabaseInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_SQL_SCRIPT = `-- 1. Create the 'surprises' table
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
-- In Supabase Dashboard -> Storage -> Create two Public buckets:
-- Bucket 1: 'photos' (Public bucket)
-- Bucket 2: 'audio' (Public bucket)

-- Policy for photos storage bucket (Run in SQL Editor):
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public storage read photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public storage insert photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Public storage read audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio');
CREATE POLICY "Public storage insert audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio');
`;

export const SupabaseInstructionsModal: React.FC<SupabaseInstructionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative max-w-3xl w-full glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 my-8 max-h-[90vh] overflow-y-auto text-white glow-pink"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-white">
                Supabase Setup & SQL Schema
              </h3>
              <p className="text-xs text-white/50 font-light">
                Configure your free Supabase PostgreSQL database and Storage buckets
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-white/70">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <h4 className="font-semibold text-white flex items-center gap-2 mb-2 font-serif">
                <ExternalLink className="w-4 h-4 text-pink-400" />
                Step 1: Create a Free Supabase Project
              </h4>
              <p className="text-xs text-white/60 font-light">
                Sign up at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-400 font-medium underline"
                >
                  supabase.com
                </a>{' '}
                and create a new project. Navigate to <strong>Project Settings → API</strong> to find your Project URL and Anon Key.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white flex items-center gap-2 font-serif">
                  <Terminal className="w-4 h-4 text-violet-400" />
                  Step 2: Run SQL Migration Script
                </h4>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied SQL!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy SQL
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-white/50 mb-3 font-light">
                In Supabase Dashboard, open the <strong>SQL Editor</strong>, paste this query, and click <strong>Run</strong>:
              </p>
              <pre className="p-3 bg-black/60 text-pink-200 text-xs font-mono rounded-xl overflow-x-auto max-h-48 border border-white/10">
                {SUPABASE_SQL_SCRIPT}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <h4 className="font-semibold text-white flex items-center gap-2 mb-2 font-serif">
                <HardDrive className="w-4 h-4 text-amber-400" />
                Step 3: Storage Buckets
              </h4>
              <p className="text-xs text-white/60 font-light">
                In Supabase Dashboard → <strong>Storage</strong>, create two <strong>Public</strong> buckets:
              </p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1 text-white/80 font-mono">
                <li><code className="bg-white/10 px-1.5 py-0.5 rounded text-pink-300">photos</code> (Public bucket)</li>
                <li><code className="bg-white/10 px-1.5 py-0.5 rounded text-pink-300">audio</code> (Public bucket)</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <h4 className="font-semibold text-white flex items-center gap-2 mb-2 font-serif">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Step 4: Environment Variables
              </h4>
              <p className="text-xs text-white/60 font-light mb-2">
                Set these variables in your deployment environment or <code className="bg-white/10 px-1 py-0.5 rounded text-pink-300">.env.local</code>:
              </p>
              <div className="p-3 bg-black/60 text-emerald-400 text-xs font-mono rounded-xl border border-white/10">
                NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co<br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SupabaseInstructionsModal;
