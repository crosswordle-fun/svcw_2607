import { createGameState, type GameState } from './GameCore';

export interface LevelComplete {
	level: number;
	word: string;
	fragment: string;
	experience: number;
}

export interface CraftComplete {
	kind: 'select' | 'random';
	rune: string;
	recipe: string;
}

export type GameMode = 'cross' | 'wordle' | 'craft';
export type ResourceMode = 'fragments' | 'runes';

/** Shared client-side game session state. */
export const gameSession = $state({
	gameState: createGameState() as GameState,
	displayedLevel: 1,
	resourceMode: 'fragments' as ResourceMode,
	gameMode: 'wordle' as GameMode,
	levelComplete: null as LevelComplete | null,
	craftComplete: null as CraftComplete | null
});
