export type PlayerColor = 'ruby' | 'jade' | 'sapphire' | 'gold';

export interface Token {
  id: number;
  playerId: number;
  // -1: in home yard / base
  // 0 to 50: on common 52-tile circuit track
  // 51 to 55: inside player's colored home column (5 steps)
  // 56: finished in central triangle
  step: number;
}

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  hex: string;
  isAi: boolean;
  avatar: string;
  tokens: Token[];
  score: number;
}

export interface BoardCoordinate {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  isSafe?: boolean;
  starColor?: string;
  cellColor?: string;
  label?: string;
}

export type GameMode = 'pass_and_play' | 'vs_ai' | 'online_room';

export interface EmojiReaction {
  id: string;
  emoji: string;
  playerName: string;
  playerColor: string;
  x: number; // random horizontal percent
  timestamp: number;
}

export interface RoomMessage {
  id: string;
  sender: string;
  text: string;
  color: string;
  time: string;
}
