import { createGameState, type GameState } from './GameCore';

export type GameMode = 'cross' | 'wordle' | 'craft';
export type ResourceMode = 'fragments' | 'runes';

/** Shared client-side game session state. */
export const gameSession = $state({
	gameState: createGameState() as GameState,
	displayedLevel: 1,
	resourceMode: 'fragments' as ResourceMode,
	gameMode: 'wordle' as GameMode
});
