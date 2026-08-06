import React from 'react';
import { Moon, Sun, Sparkles, Heart, Zap, Compass } from 'lucide-react';
import { ThemeType } from '../types';

interface ThemeToggleProps {
  currentTheme?: ThemeType;
  activeTheme?: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, activeTheme, onThemeChange }) => {
  const selectedTheme = activeTheme || currentTheme || 'midnight';
  const themes: Array<{ id: ThemeType; label: string; icon: React.FC<{ className?: string }>; colorClass: string }> = [
    { id: 'midnight', label: 'Midnight Glass', icon: Moon, colorClass: 'from-violet-600 to-indigo-600' },
    { id: 'romance', label: 'Rose Gold', icon: Heart, colorClass: 'from-pink-600 to-rose-600' },
    { id: 'celestial', label: 'Celestial Night', icon: Compass, colorClass: 'from-amber-500 to-indigo-800' },
    { id: 'cyber', label: 'Cyber Celebration', icon: Zap, colorClass: 'from-cyan-500 to-fuchsia-600' },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 p-1.5 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
      <div className="flex items-center gap-1 px-2 text-xs font-mono text-white/50 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Theme:</span>
      </div>
      <div className="flex items-center gap-1">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = selectedTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? `bg-gradient-to-r ${t.colorClass} text-white shadow-md scale-105 font-semibold`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={t.label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
