export const WORDLE_LIST = ['apple', 'cross', 'jesus', 'slate', 'elton'] as const;
export const WORDLE_LENGTH = 5;
export const ALPHABET_SIZE = 26;
export const WORDLE_EXPERIENCE_PER_LEVEL = 10;
export const CROSSWORD_GRID_SIZE = 25;
export const CROSSWORD_COIN_REWARD_COUNT = 25;
export const COIN_REWARD_VALUES = [5, 10, 25, 50] as const;
export const FRAGMENT_COST_PER_RUNE = 3;
export const INITIAL_COIN_BALANCE = 100;
export const COIN_COST_PER_LEVEL = 1;

export type LetterCounts = Record<string, number>;
export type Hint = 'Absent' | 'Present' | 'Correct';

export interface GameState {
	wordle: WordleState;
	crossword: CrosswordState;
}

export interface CrosswordState {
	tiles: Tile[][];
}

export interface TilePiece {
	letter: string | null;
	playerId: number | null;
	playerName: string | null;
	experienceReward: number;
	coinReward: number;
}

export interface Tile {
	fragment: TilePiece;
	rune: TilePiece;
}

export interface WordleState {
	playerId: number;
	level: number;
	levelStarted: boolean;
	experience: number;
	coin: number;
	fragmentCounts: LetterCounts;
	runeCounts: LetterCounts;
	currentWord: Wordle;
	previousWords: Wordle[];
}

export interface Wordle {
	truth: string;
	guesses: Guess[];
	experienceReward: number;
	fragmentReward: string | null;
	fragmentRewardIndex: number | null;
}

export interface Guess {
	word: string;
	hints: Hint[];
}

function emptyCounts(): LetterCounts {
	const counts: LetterCounts = {};

	for (let i = 0; i < ALPHABET_SIZE; i++) {
		counts[String.fromCharCode('a'.charCodeAt(0) + i)] = 0;
	}

	return counts;
}

function emptyHints(): Hint[] {
	return Array.from({ length: WORDLE_LENGTH }, () => 'Absent' as Hint);
}

function isLowercaseAscii(letter: string): boolean {
	return letter.length === 1 && letter >= 'a' && letter <= 'z';
}

function isWord(word: string): boolean {
	return word.length === WORDLE_LENGTH && [...word].every(isLowercaseAscii);
}

function randomIndex(length: number): number {
	return Math.floor(Math.random() * length);
}

function createTilePiece(): TilePiece {
	return {
		letter: null,
		playerId: null,
		playerName: null,
		experienceReward: 0,
		coinReward: 0
	};
}

export function createTile(): Tile {
	return {
		fragment: createTilePiece(),
		rune: createTilePiece()
	};
}

export function createWordle(index: number, level: number): Wordle {
	const word =
		WORDLE_LIST[((index % WORDLE_LIST.length) + WORDLE_LIST.length) % WORDLE_LIST.length];

	return {
		truth: word,
		guesses: [],
		experienceReward: level * WORDLE_EXPERIENCE_PER_LEVEL,
		fragmentReward: null,
		fragmentRewardIndex: null
	};
}

export function createTileGrid(rows: number, tilesPerRow: number): Tile[][] {
	return Array.from({ length: rows }, () => Array.from({ length: tilesPerRow }, createTile));
}

/** Randomly assigns exactly the configured number of coin rewards to tiles. */
export function disperseCoinRewards(tiles: Tile[][]): void {
	for (const row of tiles) {
		for (const tile of row) {
			tile.fragment.coinReward = 0;
			tile.rune.coinReward = 0;
		}
	}
	const candidates = tiles.flatMap((row, y) => row.map((_, x) => ({ x, y })));
	for (let i = candidates.length - 1; i > 0; i--) {
		const j = randomIndex(i + 1);
		[candidates[i], candidates[j]] = [candidates[j], candidates[i]];
	}

	for (const { x, y } of candidates.slice(0, Math.min(CROSSWORD_COIN_REWARD_COUNT, candidates.length))) {
		const piece = randomIndex(2) === 0 ? tiles[y][x].fragment : tiles[y][x].rune;
		piece.coinReward = COIN_REWARD_VALUES[randomIndex(COIN_REWARD_VALUES.length)];
	}
}

export class InsufficientCoinsError extends Error {
	constructor() {
		super('INSUFFICIENT_COINS');
		this.name = 'InsufficientCoinsError';
	}
}

export function createGameState(): GameState {
	return {
		wordle: {
			playerId: 0,
			level: 1,
			levelStarted: false,
			experience: 0,
			coin: INITIAL_COIN_BALANCE,
			fragmentCounts: emptyCounts(),
			runeCounts: emptyCounts(),
			currentWord: createWordle(0, 1),
			previousWords: []
		},
		crossword: (() => {
			const tiles = createTileGrid(CROSSWORD_GRID_SIZE, CROSSWORD_GRID_SIZE);
			disperseCoinRewards(tiles);
			return { tiles };
		})()
	};
}

/** Start the current level and charge its entry cost exactly once. */
export function startWordleLevel(game: GameState): void {
	const wordle = game.wordle;
	if (wordle.levelStarted) return;
	if (wordle.coin < COIN_COST_PER_LEVEL) throw new InsufficientCoinsError();

	wordle.coin -= COIN_COST_PER_LEVEL;
	wordle.levelStarted = true;
}

export function guessWordle(game: GameState, guess: string): void {
	if (!isWord(guess)) return;

	const wordle = game.wordle;
	if (!wordle.levelStarted) return;
	const truth = wordle.currentWord.truth;
	const hints = emptyHints();
	const available = Array(WORDLE_LENGTH).fill(true);

	for (let i = 0; i < WORDLE_LENGTH; i++) {
		if (guess[i] === truth[i]) {
			hints[i] = 'Correct';
			available[i] = false;
		}
	}

	for (let i = 0; i < WORDLE_LENGTH; i++) {
		if (hints[i] === 'Correct') continue;

		for (let j = 0; j < WORDLE_LENGTH; j++) {
			if (available[j] && guess[i] === truth[j]) {
				hints[i] = 'Present';
				available[j] = false;
				break;
			}
		}
	}

	wordle.currentWord.guesses.push({ word: guess, hints });

	if (hints.every((hint) => hint === 'Correct')) {
		const fragmentRewardIndex = randomIndex(truth.length);
		const rewardLetter = truth[fragmentRewardIndex];
		wordle.currentWord.fragmentReward = rewardLetter;
		wordle.currentWord.fragmentRewardIndex = fragmentRewardIndex;
		wordle.level += 1;
		wordle.levelStarted = false;
		wordle.experience += wordle.currentWord.experienceReward;
		wordle.fragmentCounts[rewardLetter] += 1;
		wordle.previousWords.push(wordle.currentWord);
		wordle.currentWord = createWordle(randomIndex(WORDLE_LIST.length), wordle.level);
	}
}

export function placeFragment(game: GameState, letter: string, x: number, y: number): void {
	if (!isLowercaseAscii(letter)) return;

	const tile = game.crossword.tiles[y]?.[x];
	if (!tile || tile.fragment.letter !== null || game.wordle.fragmentCounts[letter] === 0) return;

	game.wordle.fragmentCounts[letter] -= 1;
	tile.fragment.letter = letter;
	tile.fragment.playerId = game.wordle.playerId;
	game.wordle.coin += tile.fragment.coinReward;
	tile.fragment.coinReward = 0;
}

export function placeRune(game: GameState, letter: string, x: number, y: number): void {
	if (!isLowercaseAscii(letter)) return;

	const tile = game.crossword.tiles[y]?.[x];
	if (
		!tile ||
		tile.fragment.letter !== letter ||
		tile.rune.letter !== null ||
		game.wordle.runeCounts[letter] === 0
	)
		return;

	game.wordle.runeCounts[letter] -= 1;
	tile.rune.letter = letter;
	tile.rune.playerId = game.wordle.playerId;
	game.wordle.coin += tile.rune.coinReward;
	tile.rune.coinReward = 0;
}

export function craftSelectedRune(game: GameState, letter: string): string | null {
	if (!isLowercaseAscii(letter)) return null;
	if (game.wordle.fragmentCounts[letter] < FRAGMENT_COST_PER_RUNE) return null;

	game.wordle.fragmentCounts[letter] -= FRAGMENT_COST_PER_RUNE;
	game.wordle.runeCounts[letter] += 1;
	return letter;
}

export function craftRandomRune(game: GameState, letters: string): string | null {
	if (!isWord(letters)) return null;

	const required = emptyCounts();
	for (const letter of letters) required[letter] += 1;

	for (const letter in required) {
		if (game.wordle.fragmentCounts[letter] < required[letter]) return null;
	}

	for (const letter in required) {
		game.wordle.fragmentCounts[letter] -= required[letter];
	}

	const randomLetter = String.fromCharCode('a'.charCodeAt(0) + randomIndex(ALPHABET_SIZE));
	game.wordle.runeCounts[randomLetter] += 1;
	return randomLetter;
}

export function debugIncrementFragmentsAndRunes(game: GameState): void {
	for (const letter in game.wordle.fragmentCounts) {
		game.wordle.fragmentCounts[letter] += 5;
		game.wordle.runeCounts[letter] += 1;
	}
}
