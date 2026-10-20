import React from 'react';
import { Player, Token } from '../types/ludo';
import {
  canTokenMove,
  getTokenCoordinates,
  SAFE_TRACK_TILES,
  TRACK_TILES_GRID,
  HOME_RUNWAYS_GRID,
  FINISH_STEP,
  BASE_POSITIONS_GRID,
} from '../utils/ludoBoardLogic';
import { Crown, Sparkles, Shield } from 'lucide-react';
import { PawnMan } from './PawnMan';

interface LudoBoardProps {
  players: Player[];
  activePlayerIndex: number;
  diceValue: number;
  hasRolled: boolean;
  onTokenClick: (token: Token) => void;
  isAiTurn: boolean;
  hoppingToken?: { playerId: number; tokenId: number; step: number } | null;
  captureBlast?: { x: number; y: number } | null;
}

const PLAYER_THEMES = [
  {
    name: 'Ruby',
    bg: '#EF476F',
    glow: 'rgba(239, 71, 111, 0.4)',
    border: '#FF88A5',
    dark: '#7A142E',
  },
  {
    name: 'Jade',
    bg: '#06D6A0',
    glow: 'rgba(6, 214, 160, 0.4)',
    border: '#6CF0CD',
    dark: '#03644B',
  },
  {
    name: 'Gold',
    bg: '#FFC857',
    glow: 'rgba(255, 200, 87, 0.4)',
    border: '#FFE3A3',
    dark: '#855E08',
  },
  {
    name: 'Sapphire',
    bg: '#118AB2',
    glow: 'rgba(17, 138, 178, 0.4)',
    border: '#60C4E6',
    dark: '#08485E',
  },
];

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activePlayerIndex,
  diceValue,
  hasRolled,
  onTokenClick,
  isAiTurn,
  hoppingToken,
  captureBlast,
}) => {
  // Check which tokens are currently movable
  const activePlayer = players[activePlayerIndex];
  const movableTokenIds = new Set<number>();

  if (hasRolled && !isAiTurn && activePlayer) {
    activePlayer.tokens.forEach((t) => {
      if (canTokenMove(t, diceValue)) {
        movableTokenIds.add(t.id);
      }
    });
  }

  // Group tokens by identical position for visual stacking/offset
  const tokensByPos: Record<string, Token[]> = {};
  players.forEach((p) => {
    p.tokens.forEach((t) => {
      const pos = getTokenCoordinates(t);
      const key = `${Math.round(pos.x * 10)}_${Math.round(pos.y * 10)}`;
      if (!tokensByPos[key]) tokensByPos[key] = [];
      tokensByPos[key].push(t);
    });
  });

  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto select-none p-1 sm:p-2 rounded-3xl bg-gradient-to-br from-[#2A2345] via-[#161B30] to-[#0D1020] shadow-[0_16px_40px_rgba(0,0,0,0.7)] border-2 border-[#FFC857]/40">
      {/* Board Base Container */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#12162A] border border-white/10 shadow-inner">
        {/* 15x15 Board Grid Elements */}
        
        {/* 1. Four Corner Home Yards (6x6 cells each) */}
        {/* Top-Left: Player 0 (Ruby Red) */}
        <div className="absolute top-0 left-0 w-[40%] h-[40%] p-2 bg-[#EF476F]/20 border-r border-b border-[#EF476F]/30">
          <div className="w-full h-full rounded-xl bg-[#161A32] border-2 border-[#EF476F] p-2 flex flex-col justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-[#EF476F]/10 font-black text-6xl">RUBY</div>
            <div className="text-[10px] font-bold tracking-wider text-[#EF476F] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EF476F]" /> RUBY YARD
            </div>
            {/* 4 Pedestal Circles */}
            <div className="grid grid-cols-2 gap-3 w-[78%] h-[78%] place-items-center">
              {[0, 1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#EF476F]/10 border border-[#EF476F]/40 flex items-center justify-center shadow-inner"
                >
                  <span className="text-[9px] text-[#EF476F]/50 font-bold">{slot + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top-Right: Player 1 (Jade Green) */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] p-2 bg-[#06D6A0]/20 border-l border-b border-[#06D6A0]/30">
          <div className="w-full h-full rounded-xl bg-[#161A32] border-2 border-[#06D6A0] p-2 flex flex-col justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-[#06D6A0]/10 font-black text-6xl">JADE</div>
            <div className="text-[10px] font-bold tracking-wider text-[#06D6A0] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#06D6A0]" /> JADE YARD
            </div>
            <div className="grid grid-cols-2 gap-3 w-[78%] h-[78%] place-items-center">
              {[0, 1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/40 flex items-center justify-center shadow-inner"
                >
                  <span className="text-[9px] text-[#06D6A0]/50 font-bold">{slot + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom-Right: Player 2 (Imperial Gold) */}
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] p-2 bg-[#FFC857]/20 border-l border-t border-[#FFC857]/30">
          <div className="w-full h-full rounded-xl bg-[#161A32] border-2 border-[#FFC857] p-2 flex flex-col justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-[#FFC857]/10 font-black text-6xl">GOLD</div>
            <div className="text-[10px] font-bold tracking-wider text-[#FFC857] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FFC857]" /> GOLD YARD
            </div>
            <div className="grid grid-cols-2 gap-3 w-[78%] h-[78%] place-items-center">
              {[0, 1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFC857]/10 border border-[#FFC857]/40 flex items-center justify-center shadow-inner"
                >
                  <span className="text-[9px] text-[#FFC857]/50 font-bold">{slot + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom-Left: Player 3 (Sapphire Blue) */}
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] p-2 bg-[#118AB2]/20 border-r border-t border-[#118AB2]/30">
          <div className="w-full h-full rounded-xl bg-[#161A32] border-2 border-[#118AB2] p-2 flex flex-col justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-[#118AB2]/10 font-black text-6xl">BLUE</div>
            <div className="text-[10px] font-bold tracking-wider text-[#118AB2] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#118AB2]" /> SAPPHIRE YARD
            </div>
            <div className="grid grid-cols-2 gap-3 w-[78%] h-[78%] place-items-center">
              {[0, 1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#118AB2]/10 border border-[#118AB2]/40 flex items-center justify-center shadow-inner"
                >
                  <span className="text-[9px] text-[#118AB2]/50 font-bold">{slot + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Common Track Grid Cells (52 tiles) */}
        {TRACK_TILES_GRID.map(([col, row], index) => {
          const leftPercent = (col / 15) * 100;
          const topPercent = (row / 15) * 100;
          const isSafe = SAFE_TRACK_TILES.has(index);

          // Check if it's a starting square for a player
          let startPlayerColor = '';
          if (index === 0) startPlayerColor = '#EF476F';
          else if (index === 13) startPlayerColor = '#06D6A0';
          else if (index === 26) startPlayerColor = '#FFC857';
          else if (index === 39) startPlayerColor = '#118AB2';

          return (
            <div
              key={`track-${index}`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${100 / 15}%`,
                height: `${100 / 15}%`,
                backgroundColor: startPlayerColor
                  ? `${startPlayerColor}33`
                  : isSafe
                  ? '#FFC85718'
                  : 'rgba(255, 255, 255, 0.03)',
              }}
              className={`absolute border border-white/10 flex items-center justify-center transition-colors ${
                isSafe ? 'border-amber-400/40' : ''
              }`}
            >
              {isSafe && (
                <Shield
                  className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 opacity-75"
                  fill="#FFC85733"
                />
              )}
              {startPlayerColor && (
                <div
                  className="w-2 h-2 rounded-full absolute"
                  style={{ backgroundColor: startPlayerColor }}
                />
              )}
            </div>
          );
        })}

        {/* 3. Four Colored Home Runways (5 steps each) */}
        {Object.entries(HOME_RUNWAYS_GRID).map(([pId, tiles]) => {
          const color = PLAYER_THEMES[Number(pId)].bg;
          return tiles.map(([col, row], rIdx) => (
            <div
              key={`runway-${pId}-${rIdx}`}
              style={{
                left: `${(col / 15) * 100}%`,
                top: `${(row / 15) * 100}%`,
                width: `${100 / 15}%`,
                height: `${100 / 15}%`,
                backgroundColor: `${color}66`,
              }}
              className="absolute border border-white/20 flex items-center justify-center shadow-inner"
            >
              <div
                className="w-2 h-2 rounded-full opacity-60"
                style={{ backgroundColor: color }}
              />
            </div>
          ));
        })}

        {/* 4. Center Royal Home Triangle (3x3 cells: cols 6..8, rows 6..8) */}
        <div
          style={{
            left: `${(6 / 15) * 100}%`,
            top: `${(6 / 15) * 100}%`,
            width: `${(3 / 15) * 100}%`,
            height: `${(3 / 15) * 100}%`,
          }}
          className="absolute bg-[#161B30] border-2 border-[#FFC857] shadow-2xl flex items-center justify-center overflow-hidden"
        >
          {/* 4 Colored Triangles pointing to center */}
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
            {/* Left triangle (Red) */}
            <polygon points="0,0 50,50 0,100" fill="#EF476F" fillOpacity="0.85" />
            {/* Top triangle (Green) */}
            <polygon points="0,0 100,0 50,50" fill="#06D6A0" fillOpacity="0.85" />
            {/* Right triangle (Gold) */}
            <polygon points="100,0 100,100 50,50" fill="#FFC857" fillOpacity="0.85" />
            {/* Bottom triangle (Blue) */}
            <polygon points="0,100 100,100 50,50" fill="#118AB2" fillOpacity="0.85" />
          </svg>

          {/* Central Golden Crown */}
          <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#101426] border-2 border-[#FFC857] shadow-xl flex items-center justify-center">
            <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-[#FFC857] filter drop-shadow" />
          </div>
        </div>

        {/* 5. Render Player Tokens */}
        {players.map((player) =>
          player.tokens.map((token) => {
            const isThisTokenHopping =
              hoppingToken &&
              hoppingToken.playerId === player.id &&
              hoppingToken.tokenId === token.id;

            const effectiveToken = isThisTokenHopping
              ? { ...token, step: hoppingToken.step }
              : token;

            const pos = getTokenCoordinates(effectiveToken);
            const isMovable =
              movableTokenIds.has(token.id) && player.id === activePlayerIndex && !hoppingToken;
            const isFinished = token.step === FINISH_STEP;
            const theme = PLAYER_THEMES[player.id];

            // Calculate slight offset if multiple tokens share the exact cell
            const key = `${Math.round(pos.x * 10)}_${Math.round(pos.y * 10)}`;
            const sharedList = tokensByPos[key] || [];
            const tokenIndexInCell = sharedList.findIndex(
              (t) => t.id === token.id && t.playerId === token.playerId
            );
            const offsetMultiplier = sharedList.length > 1 ? tokenIndexInCell : 0;
            const offsetX = (offsetMultiplier % 2 === 0 ? 1 : -1) * (offsetMultiplier > 0 ? 4 : 0);
            const offsetY = (offsetMultiplier > 1 ? 1 : -1) * (offsetMultiplier > 0 ? 4 : 0);

            return (
              <button
                key={`tok-${player.id}-${token.id}`}
                onClick={() => {
                  if (isMovable) {
                    onTokenClick(token);
                  }
                }}
                disabled={!isMovable}
                type="button"
                style={{
                  left: `calc(${pos.x}% + ${offsetX}px)`,
                  top: `calc(${pos.y}% + ${offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
                aria-label={`${player.name} token ${token.id + 1}`}
                className={`absolute z-20 flex items-center justify-center transition-all duration-150 ${
                  isThisTokenHopping ? 'z-40 scale-125' : isMovable ? 'cursor-pointer z-30' : 'cursor-default'
                }`}
              >
                <PawnMan
                  color={theme.bg}
                  borderColor={theme.border}
                  tokenNumber={(token.id ?? 0) + 1}
                  isMovable={isMovable}
                  isFinished={isFinished}
                  isHopping={!!isThisTokenHopping}
                />
              </button>
            );
          })
        )}

        {/* 6. Comic Capture Blast Explosion */}
        {captureBlast && (
          <div
            style={{
              left: `${captureBlast.x}%`,
              top: `${captureBlast.y}%`,
            }}
            className="absolute z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center animate-blast"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 blur-sm opacity-90" />
              <span className="absolute text-sm sm:text-base font-black text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-pulse">
                💥 STRIKE!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
