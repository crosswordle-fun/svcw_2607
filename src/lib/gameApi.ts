import type { GameState } from './GameCore';

const API_URL = 'http://localhost:3000';

async function request(path: string, options?: RequestInit): Promise<GameState> {
	const response = await fetch(`${API_URL}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...options
	});

	if (!response.ok) {
		throw new Error(`Game server request failed: ${response.status}`);
	}

	return response.json() as Promise<GameState>;
}

export function getGameState(): Promise<GameState> {
	return request('/api/game');
}

export function submitWordleGuess(guess: string): Promise<GameState> {
	return request('/api/game/wordle/guess', {
		method: 'POST',
		body: JSON.stringify({ guess })
	});
}

export function submitFragment(letter: string, x: number, y: number): Promise<GameState> {
	return request('/api/game/crossword/fragment', {
		method: 'POST',
		body: JSON.stringify({ letter, x, y })
	});
}

export function submitRune(letter: string, x: number, y: number): Promise<GameState> {
	return request('/api/game/crossword/rune', {
		method: 'POST',
		body: JSON.stringify({ letter, x, y })
	});
}

export function submitSelectedRune(letter: string): Promise<GameState> {
	return request('/api/game/craft/selected-rune', {
		method: 'POST',
		body: JSON.stringify({ letter })
	});
}

export function submitRandomRune(letters: string): Promise<GameState> {
	return request('/api/game/craft/random-rune', {
		method: 'POST',
		body: JSON.stringify({ letters })
	});
}

export function incrementDebugResources(): Promise<GameState> {
	return request('/api/game/debug/increment', { method: 'POST' });
}

export function resetGame(): Promise<GameState> {
	return request('/api/game/reset', {
		method: 'POST',
		body: JSON.stringify({})
	});
}
