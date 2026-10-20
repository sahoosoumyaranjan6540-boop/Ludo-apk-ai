import React from 'react';
import { Crown } from 'lucide-react';

interface PawnManProps {
  color: string;
  borderColor: string;
  tokenNumber: number;
  isMovable: boolean;
  isFinished: boolean;
  isHopping?: boolean;
}

export const PawnMan: React.FC<PawnManProps> = ({
  color,
  borderColor,
  tokenNumber,
  isMovable,
  isFinished,
  isHopping = false,
}) => {
  return (
    <div
      className={`relative w-7 h-8 sm:w-8 sm:h-9 flex flex-col items-center justify-end select-none transition-transform ${
        isHopping ? 'animate-hop-step z-40' : isMovable ? 'hover:scale-125' : ''
      }`}
    >
      {/* Movable Pulsing Ring */}
      {isMovable && (
        <span
          style={{ backgroundColor: color }}
          className="absolute -inset-1 rounded-full animate-ping opacity-75 pointer-events-none"
        />
      )}

      {/* Finished Golden Crown Trophy */}
      {isFinished ? (
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center shadow-lg animate-bounce">
            <Crown className="w-3.5 h-3.5 text-[#101426] fill-[#101426]" />
          </div>
          <div
            style={{ backgroundColor: color }}
            className="w-4 h-2 rounded-t-sm border border-amber-300"
          />
        </div>
      ) : (
        /* Royal Pawn Man Character */
        <svg
          viewBox="0 0 32 40"
          className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
        >
          {/* Pawn Head (Helmet with Gem) */}
          <circle
            cx="16"
            cy="11"
            r="8"
            fill={color}
            stroke={isMovable ? '#FFFFFF' : borderColor}
            strokeWidth="2"
          />
          {/* Helmet Visor / Face */}
          <rect
            x="11"
            y="9"
            width="10"
            height="4"
            rx="2"
            fill="#101426"
            stroke="#FFE3A3"
            strokeWidth="0.8"
          />
          {/* Eye Sparkle */}
          <circle cx="14" cy="11" r="1" fill="#FFF" />
          <circle cx="18" cy="11" r="1" fill="#FFF" />

          {/* Helmet Crest / Spike */}
          <polygon
            points="16,1 19,5 13,5"
            fill="#FFC857"
            stroke="#B8860B"
            strokeWidth="0.8"
          />

          {/* Torso / Robe */}
          <path
            d="M 9 20 L 23 20 L 26 33 L 6 33 Z"
            fill={color}
            stroke={isMovable ? '#FFFFFF' : borderColor}
            strokeWidth="1.8"
          />

          {/* Belt with Number Badge */}
          <rect x="8" y="24" width="16" height="7" rx="3.5" fill="#101426" stroke="#FFC857" strokeWidth="1" />
          <text
            x="16"
            y="29.5"
            textAnchor="middle"
            fontSize="5.5"
            fontWeight="900"
            fill="#FFFFFF"
          >
            {tokenNumber}
          </text>

          {/* Little Animated Feet / Base Pedestal */}
          <ellipse
            cx="16"
            cy="36"
            rx="11"
            ry="3.5"
            fill="#101426"
            stroke={borderColor}
            strokeWidth="1.2"
          />
        </svg>
      )}

      {/* Ground Shadow underneath */}
      <div
        className={`w-5 h-1.5 rounded-full bg-black/60 blur-[1px] transition-transform ${
          isHopping ? 'scale-50 opacity-40' : 'scale-100 opacity-80'
        }`}
      />
    </div>
  );
};
