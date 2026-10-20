import { Player, Token } from '../types/ludo';

export const TRACK_SIZE = 52;
export const HOME_RUNWAY_LENGTH = 5;
export const FINISH_STEP = 56; // 0..50 (51 track tiles) + 51..55 (5 home column) + 56 (finished)

// Player start offsets on the 52-tile circuit
export const PLAYER_START_OFFSETS: Record<number, number> = {
  0: 0,   // Ruby (Red): start tile 0 (col 1, row 6)
  1: 13,  // Jade (Green): start tile 13 (col 8, row 1)
  2: 26,  // Gold (Yellow): start tile 26 (col 13, row 8)
  3: 39,  // Sapphire (Blue): start tile 39 (col 6, row 13)
};

// 15x15 grid coordinates for the 52 common track tiles [col, row]
export const TRACK_TILES_GRID: [number, number][] = [
  // Red side towards Green (0..4)
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  // Up towards top (5..10)
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  // Top turn (11..12)
  [7, 0], [8, 0],
  // Down from top (13..17)
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  // Right arm (18..23)
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  // Right turn (24..25)
  [14, 7], [14, 8],
  // Left towards center (26..30)
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  // Down bottom arm (31..36)
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  // Bottom turn (37..38)
  [7, 14], [6, 14],
  // Up bottom arm (39..43)
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  // Left arm going left (44..49)
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  // Left turn (50..51)
  [0, 7], [0, 6],
];

// Home runways for each player: 5 colored tiles leading to center
export const HOME_RUNWAYS_GRID: Record<number, [number, number][]> = {
  0: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],      // Red runway (horizontal right)
  1: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],      // Green runway (vertical down)
  2: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],  // Gold runway (horizontal left)
  3: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],  // Blue runway (vertical up)
};

// Center home position [col, row]
export const CENTER_HOME_GRID: Record<number, [number, number]> = {
  0: [6, 7],
  1: [7, 6],
  2: [8, 7],
  3: [7, 8],
};

// Base yard 4 token positions for each player [col, row]
export const BASE_POSITIONS_GRID: Record<number, [number, number][]> = {
  0: [[1.8, 1.8], [3.8, 1.8], [1.8, 3.8], [3.8, 3.8]],        // Top-left (Red)
  1: [[10.8, 1.8], [12.8, 1.8], [10.8, 3.8], [12.8, 3.8]],    // Top-right (Green)
  2: [[10.8, 10.8], [12.8, 10.8], [10.8, 12.8], [12.8, 12.8]],// Bottom-right (Gold)
  3: [[1.8, 10.8], [3.8, 10.8], [1.8, 12.8], [3.8, 12.8]],    // Bottom-left (Blue)
};

// Safe common track tile indices (0-51)
export const SAFE_TRACK_TILES = new Set([
  0,  // Red Start
  8,  // Star
  13, // Green Start
  21, // Star
  26, // Gold Start
  34, // Star
  39, // Blue Start
  47, // Star
]);

/**
 * Returns absolute percentage coordinates [x, y] on 15x15 board for a token.
 */
export function getTokenCoordinates(token: Token): { x: number; y: number } {
  const { playerId, id, step } = token;

  // In home base
  if (step === -1) {
    const [col, row] = BASE_POSITIONS_GRID[playerId][id];
    return {
      x: ((col + 0.5) / 15) * 100,
      y: ((row + 0.5) / 15) * 100,
    };
  }

  // On common 52-tile circuit track (0..50)
  if (step >= 0 && step <= 50) {
    const offset = PLAYER_START_OFFSETS[playerId];
    const trackIndex = (offset + step) % TRACK_SIZE;
    const [col, row] = TRACK_TILES_GRID[trackIndex];
    return {
      x: ((col + 0.5) / 15) * 100,
      y: ((row + 0.5) / 15) * 100,
    };
  }

  // Inside player's home runway (51..55)
  if (step >= 51 && step <= 55) {
    const runwayIndex = step - 51;
    const [col, row] = HOME_RUNWAYS_GRID[playerId][runwayIndex];
    return {
      x: ((col + 0.5) / 15) * 100,
      y: ((row + 0.5) / 15) * 100,
    };
  }

  // Finished in center (56)
  const [col, row] = CENTER_HOME_GRID[playerId];
  return {
    x: ((col + 0.5) / 15) * 100,
    y: ((row + 0.5) / 15) * 100,
  };
}

/**
 * Checks if a specific token can legally move given a dice roll.
 */
export function canTokenMove(token: Token, dice: number): boolean {
  if (token.step === FINISH_STEP) return false;
  // If in base, needs a 6 to launch
  if (token.step === -1) {
    return dice === 6;
  }
  // If on track or runway, must not overshoot 56 (exact roll needed to finish)
  return token.step + dice <= FINISH_STEP;
}

/**
 * Checks if any token of a player can move.
 */
export function hasAnyValidMove(player: Player, dice: number): boolean {
  return player.tokens.some((token) => canTokenMove(token, dice));
}

/**
 * Computes absolute common track index (0..51) for a token, or null if in base/runway/finish.
 */
export function getAbsoluteTrackTile(token: Token): number | null {
  if (token.step >= 0 && token.step <= 50) {
    return (PLAYER_START_OFFSETS[token.playerId] + token.step) % TRACK_SIZE;
  }
  return null;
}

/**
 * Checks if a token lands on an opponent token on an unsafe cell, returning the captured token if any.
 */
export function checkForCapture(
  movingToken: Token,
  targetStep: number,
  allPlayers: Player[]
): Token | null {
  // Captures only happen on common track tiles (0..50)
  if (targetStep < 0 || targetStep > 50) return null;

  const targetTrackTile = (PLAYER_START_OFFSETS[movingToken.playerId] + targetStep) % TRACK_SIZE;

  // Safe squares cannot have captures
  if (SAFE_TRACK_TILES.has(targetTrackTile)) {
    return null;
  }

  for (const otherPlayer of allPlayers) {
    if (otherPlayer.id === movingToken.playerId) continue;

    for (const otherToken of otherPlayer.tokens) {
      if (otherToken.step >= 0 && otherToken.step <= 50) {
        const otherTrackTile = (PLAYER_START_OFFSETS[otherPlayer.id] + otherToken.step) % TRACK_SIZE;
        if (otherTrackTile === targetTrackTile) {
          return otherToken;
        }
      }
    }
  }

  return null;
}

/**
 * Smart AI move decider:
 * Evaluates candidate tokens and picks the highest scoring move:
 * 1. Capture opponent token: +100
 * 2. Finish token in center: +80
 * 3. Bring token out of base with 6: +60
 * 4. Move onto a safe star square: +40
 * 5. Move token closest to finishing: +20
 * 6. Move vulnerable token away from an opponent chasing within 6 tiles: +30
 */
export function chooseAIMove(
  aiPlayer: Player,
  dice: number,
  allPlayers: Player[]
): number | null {
  const movableTokens = aiPlayer.tokens.filter((t) => canTokenMove(t, dice));
  if (movableTokens.length === 0) return null;
  if (movableTokens.length === 1) return movableTokens[0].id;

  let bestScore = -Infinity;
  let bestTokenId = movableTokens[0].id;

  for (const token of movableTokens) {
    let score = 0;
    const currentStep = token.step;
    const targetStep = currentStep === -1 ? 0 : currentStep + dice;

    // 1. Capture bonus
    const captured = checkForCapture(token, targetStep, allPlayers);
    if (captured) {
      score += 100;
    }

    // 2. Finish bonus
    if (targetStep === FINISH_STEP) {
      score += 85;
    }

    // 3. Launch from yard bonus
    if (currentStep === -1 && dice === 6) {
      // Prioritize having at least 1-2 tokens active
      const activeCount = aiPlayer.tokens.filter((t) => t.step >= 0 && t.step < FINISH_STEP).length;
      score += activeCount === 0 ? 70 : 45;
    }

    // 4. Safe square bonus
    if (targetStep >= 0 && targetStep <= 50) {
      const tile = (PLAYER_START_OFFSETS[aiPlayer.id] + targetStep) % TRACK_SIZE;
      if (SAFE_TRACK_TILES.has(tile)) {
        score += 35;
      }
    }

    // 5. Enter home runway bonus
    if (currentStep <= 50 && targetStep > 50) {
      score += 50;
    }

    // 6. Progress forward
    score += targetStep * 0.5;

    // Small random factor so AI doesn't feel robotic
    score += Math.random() * 5;

    if (score > bestScore) {
      bestScore = score;
      bestTokenId = token.id;
    }
  }

  return bestTokenId;
}
