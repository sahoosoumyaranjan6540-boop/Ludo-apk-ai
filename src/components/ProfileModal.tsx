import React, { useState } from 'react';
import { User, Crown, X, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onSaveName: (newName: string) => void;
}

export const ROYAL_TITLES = [
  'Ludo Emperor',
  'Grandmaster',
  'Dice King',
  'Royal Strategist',
  'Board Conqueror',
  'Crown Prince',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  playerName,
  onSaveName,
}) => {
  const [name, setName] = useState(playerName);
  const [selectedTitle, setSelectedTitle] = useState('Ludo Emperor');

  if (!isOpen) return null;

  const handleSave = () => {
    sounds.playClick();
    const clean = name.trim();
    if (clean) {
      onSaveName(clean);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#141930] border-2 border-[#FFC857]/60 shadow-2xl text-white p-6">
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-300">PLAYER PROFILE</h2>
            <p className="text-xs text-white/60">Customize your name and royal title</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              maxLength={18}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white font-semibold text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-2 uppercase tracking-wider">
              Royal Honorific Title
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROYAL_TITLES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTitle(t);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold text-left transition border flex items-center justify-between cursor-pointer ${
                    selectedTitle === t
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{t}</span>
                  {selectedTitle === t && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            type="button"
            className="w-full mt-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#101426] font-black text-sm transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            SAVE PROFILE
          </button>
        </div>
      </div>
    </div>
  );
};
