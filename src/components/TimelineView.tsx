import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, Heart, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineViewProps {
  events?: TimelineEvent[] | null;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const [expandedId, setExpandedId] = useState<string | null>(events && events.length > 0 ? events[0].id : null);

  const list: TimelineEvent[] = events && events.length > 0 ? events : [
    { id: '1', year: '2018', title: 'First Meeting', description: 'Met over coffee, lost track of time talking for 4 hours!', emoji: '☕' },
    { id: '2', year: '2020', title: 'Unforgettable Vacation', description: 'Beach sunrise, late night songs & best laughters ever.', emoji: '🏖️' },
    { id: '3', year: '2022', title: 'Adopted Cute Pet', description: 'Welcomed our fluffy companion into the house!', emoji: '🐾' },
    { id: '4', year: '2024', title: 'Celebrated Big Dreams', description: 'Shared milestones & achieved lifelong goals together!', emoji: '🎉' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 sm:p-8 rounded-3xl border border-white/10 glow-violet space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-widest font-mono">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>Timeline of Beautiful Memories ⏳</span>
        </div>
        <span className="text-[11px] text-white/50 font-mono">
          {list.length} Milestones Recorded
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-gradient-to-b border-violet-500/40 space-y-6">
        {list.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Year Dot Marker */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 text-white font-mono font-bold text-xs flex items-center justify-center border-2 border-black shadow-lg shadow-pink-500/30">
                {item.emoji || '✨'}
              </div>

              {/* Memory Card */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isExpanded
                    ? 'bg-gradient-to-r from-violet-900/40 to-pink-900/30 border-pink-500/40 shadow-xl'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold font-mono border border-pink-500/30">
                      {item.year}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-semibold text-white group-hover:text-pink-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <button className="text-white/40 hover:text-white p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-3 border-t border-white/10 mt-3 text-sm text-white/80 font-light leading-relaxed"
                    >
                      <p>{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
