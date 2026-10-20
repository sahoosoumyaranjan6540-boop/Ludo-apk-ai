import React, { useEffect, useState } from 'react';
import { sounds } from '../utils/audio';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  accentColor?: string;
  size?: number;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  canRoll,
  onRoll,
  accentColor = '#FFC857',
  size = 68,
}) => {
  const [internalAngle, setInternalAngle] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (isRolling) {
      sounds.playDiceRoll();
      // Continuous random tumble during rolling
      const interval = setInterval(() => {
        setInternalAngle({
          x: Math.floor(Math.random() * 360 * 3),
          y: Math.floor(Math.random() * 360 * 3),
          z: Math.floor(Math.random() * 360 * 2),
        });
      }, 70);

      return () => clearInterval(interval);
    } else {
      // Settle on face
      setInternalAngle({ x: 0, y: 0, z: 0 });
    }
  }, [isRolling]);

  // Pip patterns for 1..6
  const renderPips = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className="w-4 h-4 rounded-full bg-red-600 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900 self-start shadow-inner" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900 self-end shadow-inner" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900 self-start" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900 self-center" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900 self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-2.5 p-2 w-full h-full place-items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2">
            <span className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="absolute bottom-2 left-2 w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-gray-900" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-2 w-full h-full place-items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
            <span className="w-3.5 h-3.5 rounded-full bg-gray-900" />
          </div>
        );
    }
  };

  const isSix = value === 6;

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Outer Glow when can roll or when 6 is rolled */}
      <button
        onClick={canRoll && !isRolling ? onRoll : undefined}
        disabled={!canRoll || isRolling}
        type="button"
        aria-label="Roll Dice"
        style={{ width: size, height: size }}
        className={`relative cursor-pointer transition-transform duration-200 focus:outline-none ${
          canRoll && !isRolling
            ? 'hover:scale-105 active:scale-95 animate-bounce-subtle'
            : canRoll
            ? ''
            : 'opacity-60 cursor-not-allowed'
        }`}
      >
        {/* Glow halo */}
        {canRoll && (
          <div
            className="absolute -inset-2 rounded-2xl opacity-75 blur-md transition-all duration-300 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* 3D Dice Face */}
        <div
          style={{
            width: size,
            height: size,
            transform: isRolling
              ? `rotateX(${internalAngle.x}deg) rotateY(${internalAngle.y}deg) rotateZ(${internalAngle.z}deg)`
              : 'none',
            transition: isRolling ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow:
              '0 8px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.2)',
          }}
          className={`relative rounded-2xl border-2 flex items-center justify-center bg-gradient-to-br from-white via-neutral-100 to-neutral-300 ${
            isSix ? 'border-amber-400' : 'border-neutral-300'
          }`}
        >
          {/* Subtle gold crown watermark in top corner */}
          {isSix && (
            <span className="absolute -top-3 -right-2 text-base filter drop-shadow">
              👑
            </span>
          )}

          {renderPips(value)}
        </div>
      </button>

      {/* Helper label below dice */}
      <div className="mt-1 text-center">
        {canRoll && !isRolling && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFC857] animate-pulse">
            Tap to Roll
          </span>
        )}
        {isRolling && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
            Rolling…
          </span>
        )}
        {!canRoll && !isRolling && isSix && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
            Bonus Roll!
          </span>
        )}
      </div>
    </div>
  );
};
