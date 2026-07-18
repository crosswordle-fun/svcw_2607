import { createGameState, type GameState } from './GameCore';
import { getLeaderboards, type Leaderboards } from './gameApi';

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

export interface LeaderboardState extends Leaderboards {
	loading: boolean;
	error: string | null;
}

/** Shared client-side game session state. */
export const gameSession = $state({
	gameState: createGameState() as GameState,
	displayedLevel: 1,
	resourceMode: 'fragments' as ResourceMode,
	gameMode: 'wordle' as GameMode,
	levelComplete: null as LevelComplete | null,
	craftComplete: null as CraftComplete | null
});

export const leaderboardState = $state<LeaderboardState>({
	xp: [],
	coins: [],
	loading: false,
	error: null
});

export async function refreshLeaderboards(): Promise<void> {
	leaderboardState.loading = true;
	try {
		const nextLeaderboards = await getLeaderboards();
		leaderboardState.xp = nextLeaderboards.xp;
		leaderboardState.coins = nextLeaderboards.coins;
		leaderboardState.error = null;
	} catch (error) {
		leaderboardState.error = error instanceof Error ? error.message : 'Unable to load leaderboards';
		throw error;
	} finally {
		leaderboardState.loading = false;
	}
}
