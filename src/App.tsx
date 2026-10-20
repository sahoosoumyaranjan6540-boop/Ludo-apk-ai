import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Crown,
  Download,
  Smartphone,
  Volume2,
  VolumeX,
  RotateCcw,
  Users,
  Bot,
  Zap,
  Sparkles,
  Trophy,
  User,
  Share2,
} from 'lucide-react';
import { Player, Token, GameMode, EmojiReaction } from './types/ludo';
import {
  canTokenMove,
  hasAnyValidMove,
  chooseAIMove,
  checkForCapture,
  FINISH_STEP,
} from './utils/ludoBoardLogic';
import { sounds } from './utils/audio';
import { Dice3D } from './components/Dice3D';
import { LudoBoard } from './components/LudoBoard';
import { APKDownloadModal } from './components/APKDownloadModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { ProfileModal } from './components/ProfileModal';
import { EmojiReactions } from './components/EmojiReactions';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RoyalMascot, MascotMood } from './components/RoyalMascot';
import { getTokenCoordinates } from './utils/ludoBoardLogic';
import { usePWAInstall } from './hooks/usePWAInstall';

const INITIAL_PLAYERS_DEF = [
  { name: 'RUBY', color: 'ruby' as const, hex: '#EF476F', avatar: '👑' },
  { name: 'JADE', color: 'jade' as const, hex: '#06D6A0', avatar: '⚔️' },
  { name: 'GOLD', color: 'gold' as const, hex: '#FFC857', avatar: '🛡️' },
  { name: 'SAPPHIRE', color: 'sapphire' as const, hex: '#118AB2', avatar: '💎' },
];

function createDefaultPlayers(count: number, mode: GameMode, humanName: string): Player[] {
  const newPlayers: Player[] = [];
  for (let i = 0; i < count; i++) {
    const def = INITIAL_PLAYERS_DEF[i];
    const isAi = mode === 'vs_ai' ? i > 0 : false;
    const name = i === 0 ? humanName : isAi ? `Royal AI ${i + 1}` : `Player ${i + 1}`;

    newPlayers.push({
      id: i,
      name,
      color: def.color,
      hex: def.hex,
      isAi,
      avatar: def.avatar,
      score: 0,
      tokens: [
        { id: 0, playerId: i, step: -1 },
        { id: 1, playerId: i, step: -1 },
        { id: 2, playerId: i, step: -1 },
        { id: 3, playerId: i, step: -1 },
      ],
    });
  }
  return newPlayers;
}

export default function App() {
  // PWA install state
  const { isInstallable, install, isInstalled } = usePWAInstall();

  // Settings & Modals
  const [playerName, setPlayerName] = useState('PLAYER ONE');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');
  const [fastMode, setFastMode] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Game state initialized with guaranteed players
  const [players, setPlayers] = useState<Player[]>(() =>
    createDefaultPlayers(4, 'vs_ai', 'PLAYER ONE')
  );
  const [turn, setTurn] = useState<number>(0);
  const [dice, setDice] = useState<number>(6);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [gameStatus, setGameStatus] = useState<string>('Welcome to Ludo Royal. Tap the dice to roll!');
  const [winner, setWinner] = useState<Player | null>(null);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);

  // Animation states: Token hopping & Comic capture explosion
  const [hoppingToken, setHoppingToken] = useState<{
    playerId: number;
    tokenId: number;
    step: number;
  } | null>(null);
  const [captureBlast, setCaptureBlast] = useState<{ x: number; y: number } | null>(null);

  // Royal Mascot Animation Man state
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotSpeech, setMascotSpeech] = useState<string>('Welcome, Champion! Roll the dice to begin.');

  // Ref to prevent race conditions during AI turns
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  const initGame = useCallback(
    (count: number, mode: GameMode, humanName: string) => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      const newPlayers = createDefaultPlayers(count, mode, humanName);
      setPlayers(newPlayers);
      setTurn(0);
      setDice(1);
      setIsRolling(false);
      setHasRolled(false);
      setWinner(null);
      setHoppingToken(null);
      setCaptureBlast(null);
      setMascotMood('idle');
      setMascotSpeech(`Game ready! ${newPlayers[0]?.name || 'Player 1'}, roll for fortune!`);
      setGameStatus(`${newPlayers[0]?.name || 'Player 1'}'s turn. Roll the dice to deploy tokens!`);
    },
    []
  );

  // Initial load / settings change
  useEffect(() => {
    initGame(playerCount, gameMode, playerName);
  }, [initGame, playerCount, gameMode, playerName]);

  // Turn management
  const nextTurn = useCallback(
    (currentTurn: number, currentPlayers: Player[]) => {
      const next = (currentTurn + 1) % currentPlayers.length;
      setTurn(next);
      setHasRolled(false);
      setGameStatus(`${currentPlayers[next].name}'s turn. Roll the dice!`);
      if (currentPlayers[next].isAi) {
        setMascotMood('thinking');
        setMascotSpeech(`${currentPlayers[next].name} is calculating their strategy...`);
      } else {
        setMascotMood('idle');
      }
    },
    []
  );

  // Finalize move after hopping animation completes
  const finalizeMove = useCallback(
    (token: Token, targetStep: number) => {
      setPlayers((prevPlayers) => {
        const nextPlayers = prevPlayers.map((p) => ({
          ...p,
          tokens: p.tokens.map((t) => ({ ...t })),
        }));

        const movingPlayer = nextPlayers[token.playerId];
        const targetToken = movingPlayer.tokens[token.id];
        targetToken.step = targetStep;

        // Sounds & Mascot reactions
        if (targetStep === FINISH_STEP) {
          sounds.playHomeEntry();
          setMascotMood('cheer');
          setMascotSpeech('SPLENDID! Token reached the Royal Home!');
        }

        // Check for capture on common track
        let capturedTokenInfo: Token | null = null;
        if (targetStep >= 0 && targetStep <= 50) {
          capturedTokenInfo = checkForCapture(targetToken, targetStep, nextPlayers);
          if (capturedTokenInfo) {
            sounds.playCapture();
            const capturedCoords = getTokenCoordinates(targetToken);
            setCaptureBlast({ x: capturedCoords.x, y: capturedCoords.y });
            setMascotMood('shock');
            setMascotSpeech('💥 STRIKE! Sent straight back to yard!');
            setTimeout(() => setCaptureBlast(null), 650);

            // Send captured token back to base (-1)
            const capturedPlayer = nextPlayers[capturedTokenInfo.playerId];
            const capturedPiece = capturedPlayer.tokens[capturedTokenInfo.id];
            capturedPiece.step = -1;
          }
        }

        // Check for game victory (all 4 tokens finished)
        const finishedCount = movingPlayer.tokens.filter((t) => t.step === FINISH_STEP).length;
        if (finishedCount === 4) {
          setWinner(movingPlayer);
          sounds.playVictoryFanfare();
          setMascotMood('victory');
          setMascotSpeech(`🏆 ALL HAIL ${movingPlayer.name}! WINNER OF THE ROYAL CROWN!`);
          setGameStatus(`🏆 ${movingPlayer.name} WINS THE ROYAL CROWN! 🏆`);
          setHoppingToken(null);
          return nextPlayers;
        }

        // Determine next state
        const gotBonusRoll = dice === 6 || capturedTokenInfo !== null || targetStep === FINISH_STEP;

        if (gotBonusRoll) {
          setHasRolled(false);
          let reason = 'Rolled a 6!';
          if (capturedTokenInfo) reason = 'Captured opponent!';
          else if (targetStep === FINISH_STEP) reason = 'Token finished!';

          setMascotMood('cheer');
          setGameStatus(`🌟 ${movingPlayer.name} gets a bonus roll (${reason})`);
        } else {
          nextTurn(movingPlayer.id, nextPlayers);
        }

        setHoppingToken(null);
        return nextPlayers;
      });
    },
    [dice, nextTurn]
  );

  // Animated Token Hop Move
  const executeMove = useCallback(
    (token: Token) => {
      if (hoppingToken || isRolling) return;

      const oldStep = token.step;
      const targetStep = oldStep === -1 ? 0 : oldStep + dice;

      // Build sequence of steps for hopping animation
      const stepsToAnimate: number[] = [];
      if (oldStep === -1) {
        stepsToAnimate.push(0);
      } else {
        for (let s = oldStep + 1; s <= targetStep; s++) {
          stepsToAnimate.push(s);
        }
      }

      const stepDelay = fastMode ? 65 : 120;
      let currentIndex = 0;

      const animateNextStep = () => {
        if (currentIndex < stepsToAnimate.length) {
          const stepVal = stepsToAnimate[currentIndex];
          setHoppingToken({
            playerId: token.playerId,
            tokenId: token.id,
            step: stepVal,
          });
          sounds.playTokenStep();
          currentIndex++;
          setTimeout(animateNextStep, stepDelay);
        } else {
          finalizeMove(token, targetStep);
        }
      };

      animateNextStep();
    },
    [dice, fastMode, hoppingToken, isRolling, finalizeMove]
  );

  // Human / Bot Roll trigger
  const handleRollDice = useCallback(() => {
    if (isRolling || hasRolled || winner || hoppingToken) return;

    setIsRolling(true);
    setGameStatus(`${players[turn]?.name} is rolling…`);

    const rollDuration = fastMode ? 350 : 600;

    setTimeout(() => {
      const rolledNumber = Math.floor(Math.random() * 6) + 1;
      setDice(rolledNumber);
      setIsRolling(false);
      setHasRolled(true);

      if (rolledNumber === 6) {
        setMascotMood('cheer');
        setMascotSpeech('A ROYAL SIX! Tremendous! Bring out a token or surge forward!');
      } else {
        setMascotMood('idle');
      }

      const currentPlayer = players[turn];
      const hasMoves = hasAnyValidMove(currentPlayer, rolledNumber);

      if (!hasMoves) {
        setGameStatus(`Rolled a ${rolledNumber}. No tokens can move!`);
        setTimeout(() => {
          nextTurn(turn, players);
        }, fastMode ? 450 : 800);
      } else {
        if (rolledNumber === 6) {
          setGameStatus(`🎲 Rolled a 6! Deploy a new token or advance forward.`);
        } else {
          setGameStatus(`Rolled a ${rolledNumber}. Tap a highlighted pawn to move.`);
        }
      }
    }, rollDuration);
  }, [isRolling, hasRolled, winner, hoppingToken, players, turn, fastMode, nextTurn]);

  // AI Turn Handling
  useEffect(() => {
    if (winner) return;
    const current = players[turn];
    if (!current || !current.isAi) return;

    // AI rolling step
    if (!hasRolled && !isRolling) {
      const delay = fastMode ? 300 : 700;
      aiTimeoutRef.current = setTimeout(() => {
        handleRollDice();
      }, delay);
    } else if (hasRolled && !isRolling) {
      // AI moving step
      const delay = fastMode ? 350 : 750;
      aiTimeoutRef.current = setTimeout(() => {
        const bestTokenId = chooseAIMove(current, dice, players);
        if (bestTokenId !== null) {
          const tokenToMove = current.tokens[bestTokenId];
          executeMove(tokenToMove);
        } else {
          nextTurn(turn, players);
        }
      }, delay);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [turn, hasRolled, isRolling, winner, players, dice, fastMode, handleRollDice, executeMove, nextTurn]);

  // Send emoji reaction
  const handleSendReaction = (emoji: string) => {
    const current = players[turn] || players[0];
    const newReaction: EmojiReaction = {
      id: `${Date.now()}_${Math.random()}`,
      emoji,
      playerName: current.name,
      playerColor: current.hex,
      x: 20 + Math.random() * 60,
      timestamp: Date.now(),
    };

    setReactions((prev) => [...prev.slice(-8), newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2800);
  };

  const activePlayer = players[turn] ?? players[0] ?? {
    id: 0,
    name: playerName || 'PLAYER ONE',
    color: 'ruby' as const,
    hex: '#EF476F',
    isAi: false,
    avatar: '👑',
    score: 0,
    tokens: [],
  };

  return (
    <div className="min-h-screen bg-[#101426] text-white flex flex-col font-sans relative selection:bg-amber-400 selection:text-black">
      {/* Background Royal Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#EF476F]/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#06D6A0]/10 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#FFC857]/10 blur-[120px]" />
      </div>

      {/* HEADER NAVBAR */}
      <header className="relative z-30 px-3 sm:px-6 py-3 border-b border-white/10 bg-[#12162B]/80 backdrop-blur-md flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#101426]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                LUDO ROYAL
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Android APK
              </span>
            </div>
            <p className="text-[10px] text-white/50 hidden xs:block">
              Roll • Race • Rule the Board
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              const muted = sounds.toggleMute();
              setIsMuted(muted);
            }}
            type="button"
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsProfileModalOpen(true);
            }}
            type="button"
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <User className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">{playerName}</span>
          </button>

          {/* Online Rooms Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsOnlineModalOpen(true);
            }}
            type="button"
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Online Rooms</span>
          </button>

          {/* In-App PWA Install (if available) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={async () => {
                sounds.playClick();
                await install();
              }}
              type="button"
              className="px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* PROMINENT DOWNLOAD APK BUTTON */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsAPKModalOpen(true);
            }}
            type="button"
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-[#101426] font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer animate-pulse-glow"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>DOWNLOAD APK</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER: GAME MODES & SETTINGS BAR */}
      <div className="relative z-20 px-3 sm:px-6 py-2 bg-black/30 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sounds.playClick();
              setGameMode('vs_ai');
            }}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              gameMode === 'vs_ai'
                ? 'bg-amber-400 text-[#101426] shadow-sm'
                : 'text-white/60 hover:text-white bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> VS AI
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setGameMode('pass_and_play');
            }}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              gameMode === 'pass_and_play'
                ? 'bg-amber-400 text-[#101426] shadow-sm'
                : 'text-white/60 hover:text-white bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Pass & Play
          </button>
        </div>

        {/* Players Selector & Toggles */}
        <div className="flex items-center gap-2">
          {/* Player Count */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => {
                  sounds.playClick();
                  setPlayerCount(count);
                }}
                type="button"
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  playerCount === count
                    ? 'bg-amber-400/30 text-amber-300 border border-amber-400/40'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {count}P
              </button>
            ))}
          </div>

          {/* Fast Speed Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setFastMode(!fastMode);
            }}
            type="button"
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              fastMode
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" /> Fast
          </button>

          {/* Restart Button */}
          <button
            onClick={() => {
              sounds.playClick();
              initGame(playerCount, gameMode, playerName);
            }}
            type="button"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
            title="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN GAME CONTAINER */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-between p-2 sm:p-4 max-w-4xl mx-auto w-full">
        {/* Player Status Cards (Top) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {players.map((p, idx) => {
            const isActive = turn === idx && !winner;
            const finishedTokens = p.tokens.filter((t) => t.step === FINISH_STEP).length;

            return (
              <div
                key={p.id}
                style={{
                  borderColor: isActive ? p.hex : 'rgba(255,255,255,0.1)',
                  backgroundColor: isActive ? `${p.hex}18` : 'rgba(255,255,255,0.03)',
                }}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isActive
                    ? 'ring-2 ring-offset-2 ring-offset-[#101426] shadow-lg scale-[1.02]'
                    : 'opacity-75'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    style={{ backgroundColor: p.hex }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md"
                  >
                    {p.isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black truncate" style={{ color: p.hex }}>
                        {p.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60 block">
                      {p.isAi ? 'Royal AI' : 'Human'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-white">
                    {finishedTokens}/4
                  </span>
                  <span className="text-[9px] text-amber-300 block font-semibold">
                    Home
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* LUDO BOARD STAGE */}
        <div className="w-full flex-1 flex items-center justify-center my-1 sm:my-2">
          <LudoBoard
            players={players}
            activePlayerIndex={turn}
            diceValue={dice}
            hasRolled={hasRolled}
            onTokenClick={executeMove}
            isAiTurn={activePlayer?.isAi ?? false}
            hoppingToken={hoppingToken}
            captureBlast={captureBlast}
          />
        </div>

        {/* ANIMATED ROYAL MASCOT ("ANIMATION MAN") */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-center my-1 px-2">
          <RoyalMascot
            mood={mascotMood}
            speechText={mascotSpeech}
            onTap={() => {
              setMascotMood('cheer');
              setMascotSpeech('Fortune favors the bold roll! Take the crown!');
            }}
          />
        </div>

        {/* ACTION & DICE CONTROL DOCK (Bottom) */}
        <div className="w-full max-w-xl mx-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-3 sm:p-4 shadow-xl mt-1">
          {/* Status Message */}
          <div className="text-center mb-3">
            <p className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide drop-shadow">
              {gameStatus}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Active Player Indicator */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                style={{ backgroundColor: activePlayer?.hex }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg font-black text-sm text-white"
              >
                {activePlayer.isAi ? <Bot className="w-5 h-5" /> : ((activePlayer.id ?? 0) + 1)}
              </div>
              <div>
                <span className="text-[10px] text-amber-300 uppercase tracking-widest font-black block">
                  Current Turn
                </span>
                <span className="text-sm font-extrabold" style={{ color: activePlayer?.hex }}>
                  {activePlayer?.name}
                </span>
              </div>
            </div>

            {/* 3D Dice */}
            <Dice3D
              value={dice}
              isRolling={isRolling}
              canRoll={!hasRolled && !activePlayer?.isAi && !winner}
              onRoll={handleRollDice}
              accentColor={activePlayer?.hex}
              size={64}
            />

            {/* Reactions & Info */}
            <div className="flex items-center gap-2">
              <EmojiReactions
                onSendReaction={handleSendReaction}
                reactions={reactions}
              />

              <button
                onClick={() => setIsAPKModalOpen(true)}
                type="button"
                className="p-2.5 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 transition cursor-pointer"
                title="Download Android APK"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* WINNER VICTORY CELEBRATION MODAL */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-scale-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#241B3D] via-[#141930] to-[#0A0D1A] border-2 border-[#FFC857] shadow-[0_25px_60px_rgba(255,200,87,0.3)] text-center p-6 sm:p-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 mx-auto flex items-center justify-center shadow-2xl shadow-amber-400/40 animate-bounce mb-4">
              <Trophy className="w-10 h-10 text-[#101426]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
              ROYAL VICTORY!
            </h2>
            <p className="text-sm font-extrabold mt-1" style={{ color: winner.hex }}>
              {winner.name} RULES THE BOARD
            </p>
            <p className="text-xs text-white/60 mt-2">
              All 4 tokens safely reached the Royal Center Triangle!
            </p>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  initGame(playerCount, gameMode, playerName);
                }}
                type="button"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-[#101426] font-black text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> PLAY AGAIN
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsAPKModalOpen(true);
                }}
                type="button"
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" /> DOWNLOAD APK FOR ANDROID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <APKDownloadModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
      />

      <OnlineRoomModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        playerName={playerName}
        onStartRoomGame={(code) => {
          setGameStatus(`Connected to Room ${code}! Play is live.`);
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        playerName={playerName}
        onSaveName={(name) => {
          setPlayerName(name);
          initGame(playerCount, gameMode, name);
        }}
      />

      {/* PWA Offline Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
