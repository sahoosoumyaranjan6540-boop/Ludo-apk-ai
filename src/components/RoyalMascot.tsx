import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { Crown, Sparkles } from 'lucide-react';

export type MascotMood = 'idle' | 'cheer' | 'shock' | 'thinking' | 'victory';

interface RoyalMascotProps {
  mood: MascotMood;
  speechText?: string;
  onTap?: () => void;
}

const QUIPS = [
  'Fortune favors the bold roll!',
  'May the golden dice roll a six!',
  'Watch your flanks — no one is safe!',
  'Rule the board like a true king!',
  'A masterclass in Ludo strategy!',
];

export const RoyalMascot: React.FC<RoyalMascotProps> = ({
  mood = 'idle',
  speechText,
  onTap,
}) => {
  const [localQuipIndex, setLocalQuipIndex] = useState(0);
  const [isPokePumping, setIsPokePumping] = useState(false);

  const handleMascotClick = () => {
    sounds.playClick();
    setIsPokePumping(true);
    setLocalQuipIndex((prev) => (prev + 1) % QUIPS.length);
    setTimeout(() => setIsPokePumping(false), 600);
    if (onTap) onTap();
  };

  const displayText = speechText || QUIPS[localQuipIndex];

  // Dynamic animation classes
  let moodClass = 'animate-mascot-bounce';
  if (mood === 'cheer' || isPokePumping) moodClass = 'animate-mascot-cheer';
  else if (mood === 'shock') moodClass = 'animate-shake';
  else if (mood === 'thinking') moodClass = 'animate-pulse';
  else if (mood === 'victory') moodClass = 'animate-bounce';

  return (
    <div className="relative inline-flex items-center gap-2 select-none group">
      {/* Interactive Mascot King SVG Figure */}
      <button
        onClick={handleMascotClick}
        type="button"
        title="Tap King Ludo for royal advice!"
        className={`relative w-12 h-14 sm:w-14 sm:h-16 cursor-pointer focus:outline-none transition-transform active:scale-95 ${moodClass}`}
      >
        {/* Glow halo behind King */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-amber-500/20 to-yellow-400/40 blur-md pointer-events-none" />

        <svg
          viewBox="0 0 100 120"
          className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
        >
          {/* Royal Cape */}
          <path
            d="M 22 55 Q 10 95 20 110 L 80 110 Q 90 95 78 55 Z"
            fill="#7A142E"
            stroke="#FFC857"
            strokeWidth="3"
          />

          {/* Royal Body & Robe */}
          <path
            d="M 30 58 L 70 58 L 74 105 L 26 105 Z"
            fill="#EF476F"
            stroke="#FFE3A3"
            strokeWidth="2.5"
          />

          {/* Golden Scepter in Right Hand */}
          <g transform="translate(76, 40) rotate(15)">
            <line x1="0" y1="0" x2="0" y2="45" stroke="#FFC857" strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="0" r="7" fill="#FFC857" stroke="#FFF" strokeWidth="2" />
            <polygon points="-4,-4 0,-9 4,-4" fill="#06D6A0" />
          </g>

          {/* King Head */}
          <circle cx="50" cy="42" r="22" fill="#FCEADE" stroke="#B8860B" strokeWidth="2" />

          {/* Rosy Cheeks */}
          <circle cx="36" cy="48" r="4" fill="#EF476F" opacity="0.4" />
          <circle cx="64" cy="48" r="4" fill="#EF476F" opacity="0.4" />

          {/* Eyes depending on mood */}
          {mood === 'shock' ? (
            /* Big Shock Eyes */
            <>
              <circle cx="41" cy="38" r="5" fill="#FFF" stroke="#222" strokeWidth="1.5" />
              <circle cx="41" cy="38" r="2" fill="#111" />
              <circle cx="59" cy="38" r="5" fill="#FFF" stroke="#222" strokeWidth="1.5" />
              <circle cx="59" cy="38" r="2" fill="#111" />
              <ellipse cx="50" cy="52" rx="4" ry="6" fill="#7A142E" />
            </>
          ) : mood === 'cheer' || mood === 'victory' ? (
            /* Cheerful Happy Curve Eyes */
            <>
              <path d="M 36 38 Q 41 33 46 38" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 54 38 Q 59 33 64 38" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
              {/* Big Joy Smile */}
              <path d="M 40 48 Q 50 60 60 48 Z" fill="#EF476F" stroke="#222" strokeWidth="1.5" />
            </>
          ) : (
            /* Standard Royal Confident Eyes */
            <>
              <circle cx="42" cy="38" r="2.5" fill="#161B30" />
              <circle cx="58" cy="38" r="2.5" fill="#161B30" />
              {/* Grand Mustache */}
              <path
                d="M 50 48 Q 42 45 36 49 Q 44 54 50 50 Q 56 54 64 49 Q 58 45 50 48 Z"
                fill="#FFC857"
                stroke="#B8860B"
                strokeWidth="1"
              />
            </>
          )}

          {/* Crown */}
          <path
            d="M 30 24 L 33 10 L 42 16 L 50 6 L 58 16 L 67 10 L 70 24 Z"
            fill="#FFC857"
            stroke="#B8860B"
            strokeWidth="2.5"
          />
          {/* Crown Rubies */}
          <circle cx="50" cy="18" r="2.5" fill="#EF476F" />
          <circle cx="39" cy="20" r="2" fill="#06D6A0" />
          <circle cx="61" cy="20" r="2" fill="#118AB2" />

          {/* Left Hand Waving */}
          <circle cx="24" cy="62" r="6" fill="#FCEADE" stroke="#B8860B" strokeWidth="1.5" />
        </svg>

        {/* Floating Sparkles when Cheerful */}
        {(mood === 'cheer' || mood === 'victory') && (
          <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-ping" />
        )}
      </button>

      {/* Royal Speech Bubble */}
      <div className="relative max-w-[170px] sm:max-w-[210px] bg-gradient-to-r from-[#1E2548] to-[#141A33] border border-[#FFC857]/50 rounded-2xl p-2 sm:p-2.5 shadow-xl text-left">
        {/* Triangle pointer to Mascot */}
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#FFC857]/50" />
        
        <div className="flex items-center gap-1 mb-0.5">
          <Crown className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] font-black tracking-widest uppercase text-amber-300">
            King Ludo
          </span>
        </div>
        <p className="text-[11px] sm:text-xs font-semibold text-white/90 leading-tight">
          "{displayText}"
        </p>
      </div>
    </div>
  );
};
