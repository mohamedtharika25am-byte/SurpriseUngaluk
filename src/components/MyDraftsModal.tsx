import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Trash2, Play, X, Clock, Calendar, Gift, Sparkles, AlertCircle } from 'lucide-react';
import { DraftSurprise } from '../types';
import { getAllDrafts, deleteDraft } from '../lib/draftHelper';

interface MyDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDraft: (draft: DraftSurprise) => void;
}

export const MyDraftsModal: React.FC<MyDraftsModalProps> = ({
  isOpen,
  onClose,
  onSelectDraft
}) => {
  const [drafts, setDrafts] = useState<DraftSurprise[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDrafts(getAllDrafts());
    }
  }, [isOpen]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSelect = (draft: DraftSurprise) => {
    onSelectDraft(draft);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  My Saved Drafts
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {drafts.length}
                  </span>
                </h3>
                <p className="text-xs text-white/50 font-light">
                  Pick up right where you left off creating your surprises
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Draft List */}
          <div className="overflow-y-auto space-y-3 pr-1 grow">
            {drafts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white/80">No Saved Drafts Found</h4>
                <p className="text-xs text-white/40 max-w-sm mx-auto">
                  When you work on a surprise, click "Save Draft" in the builder to save your progress here.
                </p>
              </div>
            ) : (
              drafts.map((draft) => {
                const formattedDate = new Date(draft.updated_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <motion.div
                    key={draft.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleSelect(draft)}
                    className="group relative p-4 sm:p-5 rounded-2xl bg-black/40 hover:bg-white/5 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 grow">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-white group-hover:text-pink-300 transition-colors">
                          {draft.recipient_name.trim() || 'Untitled Recipient'}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400">
                          {draft.occasion_type}
                        </span>
                        {draft.photoPreviews && draft.photoPreviews.length > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                            📷 {draft.photoPreviews.length} photos
                          </span>
                        )}
                        {draft.enableVoiceNote && draft.voiceNoteUrl && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            🎙️ Voice note
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white/60 line-clamp-1 italic font-light">
                        "{draft.message || 'No message added yet...'}"
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-white/40 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-pink-400" /> Saved: {formattedDate}
                        </span>
                        {draft.sender_name && (
                          <span>• From: {draft.sender_name}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={(e) => handleDelete(e, draft.id)}
                        className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSelect(draft)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-mono">
            <span>Drafts are saved locally on this browser</span>
            <button
              onClick={onClose}
              className="text-pink-400 hover:text-pink-300 transition-colors cursor-pointer font-sans font-medium"
            >
              Close Window
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MyDraftsModal;
