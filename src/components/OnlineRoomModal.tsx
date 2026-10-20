import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Send,
  X,
  MessageSquare,
  Play,
  Share2,
} from 'lucide-react';
import { RoomMessage } from '../types/ludo';
import { sounds } from '../utils/audio';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onStartRoomGame: (roomCode: string, isHost: boolean) => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  playerName,
  onStartRoomGame,
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [roomPlayers, setRoomPlayers] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    sounds.playClick();
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveRoom(newCode);
    setIsHost(true);
    setRoomPlayers([playerName, 'Royal AI 2 (Bot)', 'Royal AI 3 (Bot)']);
    setMessages([
      {
        id: '1',
        sender: 'SYSTEM',
        text: `Room ${newCode} created by ${playerName}. Waiting for players or tap Start.`,
        color: '#FFC857',
        time: 'Just now',
      },
    ]);
  };

  const handleJoinRoom = () => {
    sounds.playClick();
    const trimmed = roomCode.trim();
    if (!trimmed) return;
    setActiveRoom(trimmed);
    setIsHost(false);
    setRoomPlayers(['Player One (Host)', playerName, 'Royal AI 3 (Bot)']);
    setMessages([
      {
        id: '1',
        sender: 'SYSTEM',
        text: `${playerName} successfully joined room ${trimmed}!`,
        color: '#06D6A0',
        time: 'Just now',
      },
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sounds.playClick();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: playerName,
        text: inputText.trim(),
        color: '#EF476F',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    sounds.playClick();
    navigator.clipboard.writeText(activeRoom);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#141930] border-2 border-[#FFC857]/60 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-white p-5 sm:p-6">
        {/* Close Button */}
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

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-300">ONLINE ROOM MULTIPLAYER</h2>
            <p className="text-xs text-white/60">
              Create a private lobby or enter a 6-digit room code
            </p>
          </div>
        </div>

        {!activeRoom ? (
          /* Lobby Selection */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
                Join an Existing Room
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white font-mono tracking-widest text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={roomCode.trim().length < 4}
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 font-bold text-xs text-white transition cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-xs text-white/40 font-bold uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              onClick={handleCreateRoom}
              type="button"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-[#101426] font-black text-sm hover:brightness-110 active:scale-98 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              CREATE NEW ROOM
            </button>
          </div>
        ) : (
          /* Active Room Screen */
          <div className="space-y-4">
            {/* Room Code Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400/10 via-amber-400/20 to-amber-400/10 border border-amber-400/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300/80 uppercase tracking-widest block font-bold">
                  Room Code (Share with Friends)
                </span>
                <span className="text-2xl font-black font-mono tracking-widest text-amber-200">
                  {activeRoom}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-amber-400 text-[#101426] text-xs font-bold flex items-center gap-1.5 hover:bg-amber-300 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Players in Room */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white/70 block mb-2">
                Players in Room ({roomPlayers.length}/4)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {roomPlayers.map((name, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold truncate">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Box */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 mb-2">
                <MessageSquare className="w-3.5 h-3.5" /> Room Chat
              </div>
              <div className="h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {messages.map((m) => (
                  <div key={m.id} className="leading-tight">
                    <span style={{ color: m.color }} className="font-bold mr-1.5">
                      {m.sender}:
                    </span>
                    <span className="text-white/80">{m.text}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-amber-400 text-[#101426] hover:bg-amber-300 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Start Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onStartRoomGame(activeRoom, isHost);
                onClose();
              }}
              type="button"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 text-white font-black text-sm hover:brightness-110 active:scale-98 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              START ROOM GAME
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
