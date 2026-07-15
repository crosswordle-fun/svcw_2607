import type { GameState } from './GameCore';

const API_URL = 'http://localhost:3000';

export interface AuthResponse { token: string; username: string; game: GameState }

function token(): string | null {
	return typeof localStorage === 'undefined' ? null : localStorage.getItem('crosswordle_token');
}

async function request(path: string, options?: RequestInit): Promise<GameState> {
	const headers = new Headers(options?.headers);
	headers.set('Content-Type', 'application/json');
	const currentToken = token();
	if (currentToken) headers.set('Authorization', `Bearer ${currentToken}`);
	const response = await fetch(`${API_URL}${path}`, { ...options, headers });
	if (!response.ok) throw new Error(`Game server request failed: ${response.status}`);
	return response.json() as Promise<GameState>;
}

async function authenticate(path: string, username: string, password: string): Promise<AuthResponse> {
	const response = await fetch(`${API_URL}${path}`, {
		method: 'POST', headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});
	if (!response.ok) throw new Error(response.status === 401 ? 'INVALID_LOGIN' : 'AUTH_FAILED');
	const result = (await response.json()) as AuthResponse;
	localStorage.setItem('crosswordle_token', result.token);
	localStorage.setItem('crosswordle_username', result.username);
	return result;
}

export function login(username: string, password: string) { return authenticate('/api/auth/login', username, password); }
export function signup(username: string, password: string) { return authenticate('/api/auth/signup', username, password); }
export function isAuthenticated() { return Boolean(token()); }
export function logout() { localStorage.removeItem('crosswordle_token'); localStorage.removeItem('crosswordle_username'); }
export function getGameState(): Promise<GameState> { return request('/api/game'); }
export function submitWordleGuess(guess: string): Promise<GameState> { return request('/api/game/wordle/guess', { method: 'POST', body: JSON.stringify({ guess }) }); }
export function submitFragment(letter: string, x: number, y: number): Promise<GameState> { return request('/api/game/crossword/fragment', { method: 'POST', body: JSON.stringify({ letter, x, y }) }); }
export function submitRune(letter: string, x: number, y: number): Promise<GameState> { return request('/api/game/crossword/rune', { method: 'POST', body: JSON.stringify({ letter, x, y }) }); }
export function submitSelectedRune(letter: string): Promise<GameState> { return request('/api/game/craft/selected-rune', { method: 'POST', body: JSON.stringify({ letter }) }); }
export function submitRandomRune(letters: string): Promise<GameState> { return request('/api/game/craft/random-rune', { method: 'POST', body: JSON.stringify({ letters }) }); }
export function incrementDebugResources(): Promise<GameState> { return request('/api/game/debug/increment', { method: 'POST' }); }
