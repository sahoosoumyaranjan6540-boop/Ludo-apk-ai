import React, { useState } from 'react';
import { EmojiReaction } from '../types/ludo';
import { sounds } from '../utils/audio';
import { Smile } from 'lucide-react';

interface EmojiReactionsProps {
  onSendReaction: (emoji: string) => void;
  reactions: EmojiReaction[];
}

export const ROYAL_EMOJIS = ['👑', '🔥', '🎲', '😂', '👏', '❤️', '😎', '💥', '🏆', '⚡'];

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  onSendReaction,
  reactions,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Animated Emojis on Screen */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{
              left: `${r.x}%`,
              bottom: '15%',
            }}
            className="absolute flex flex-col items-center animate-float-up opacity-0"
          >
            <span className="text-4xl sm:text-5xl filter drop-shadow-lg">
              {r.emoji}
            </span>
            <span
              style={{ color: r.playerColor }}
              className="text-[10px] font-black bg-black/60 px-2 py-0.5 rounded-full border border-white/20 mt-1"
            >
              {r.playerName}
            </span>
          </div>
        ))}
      </div>

      {/* Emoji Trigger Button & Popover */}
      <div className="relative">
        <button
          onClick={() => {
            sounds.playClick();
            setIsOpen(!isOpen);
          }}
          type="button"
          aria-label="Emoji Reactions"
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-amber-300 hover:text-amber-200 transition active:scale-95 flex items-center justify-center cursor-pointer shadow"
        >
          <Smile className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-full right-0 mb-3 z-40 p-2.5 rounded-2xl bg-[#161B32] border border-[#FFC857]/40 shadow-2xl backdrop-blur-md flex flex-wrap gap-1.5 w-52 sm:w-60 animate-scale-in">
              <div className="w-full text-[10px] font-bold text-amber-300/80 px-1 pb-1 uppercase tracking-wider flex items-center justify-between">
                <span>Royal Reactions</span>
                <span className="text-[9px] text-white/40">Tap to react</span>
              </div>
              {ROYAL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    sounds.playClick();
                    onSendReaction(emoji);
                    setIsOpen(false);
                  }}
                  type="button"
                  className="w-9 h-9 rounded-xl hover:bg-white/10 text-xl flex items-center justify-center transition hover:scale-125 active:scale-95 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
