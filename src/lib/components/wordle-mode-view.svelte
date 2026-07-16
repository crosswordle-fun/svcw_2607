<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { GameState, Hint } from '$lib/GameCore';
	import { gameSession } from '$lib/gameState.svelte';
	import { submitWordleGuess } from '$lib/gameApi';
	import WordleInput from '$lib/components/wordle-input.svelte';

	let { gameState, level }: { gameState: GameState; level: number | 'current' } = $props();
	let selectedGuessIndex = $state(-1);
	let visibleEnd = $state(0);
	let displayedWord = $derived(
		level === 'current' ? gameState.wordle.currentWord : gameState.wordle.previousWords[level - 1]
	);
	let visibleStart = $derived(Math.max(0, visibleEnd - 5));
	let visibleGuesses = $derived(displayedWord?.guesses.slice(visibleStart, visibleEnd) ?? []);
	let isCurrent = $derived(level === 'current');
	let previousLevel = $derived(level === 'current' ? gameState.wordle.level - 1 : level - 1);
	let nextLevel = $derived(level === 'current' ? null : level + 1);

	function syncView() {
		const guesses = displayedWord?.guesses ?? [];
		visibleEnd = guesses.length;
		selectedGuessIndex = guesses.length - 1;
		gameSession.displayedLevel = level === 'current' ? gameState.wordle.level : level;
	}

	$effect(() => {
		// Re-sync when a route or its game data changes so the newest five guesses
		// are visible even when the game state arrives after the page mounts.
		displayedWord;
		level;
		syncView();
	});

	onMount(() => {
		gameSession.gameMode = 'wordle';
		gameSession.levelComplete = null;
		function handleGuessNavigation(event: KeyboardEvent) {
			if (event.key === 'ArrowLeft' && previousLevel > 0) {
				goto(resolve(`/game/wordle/${previousLevel}`));
				return;
			}
			if (event.key === 'ArrowRight' && nextLevel !== null) {
				goto(
					nextLevel === gameState.wordle.level
						? resolve('/game/wordle/current')
						: resolve(`/game/wordle/${nextLevel}`)
				);
				return;
			}
			if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
			const guesses = displayedWord?.guesses ?? [];
			if (guesses.length === 0) return;
			event.preventDefault();
			const direction = event.key === 'ArrowUp' ? -1 : 1;
			selectedGuessIndex = Math.max(
				0,
				Math.min(selectedGuessIndex + direction, guesses.length - 1)
			);
			if (selectedGuessIndex < visibleStart) visibleEnd = selectedGuessIndex + 5;
			if (selectedGuessIndex >= visibleEnd) visibleEnd = selectedGuessIndex + 1;
		}

		window.addEventListener('keydown', handleGuessNavigation);
		return () => window.removeEventListener('keydown', handleGuessNavigation);
	});

	async function submitGuess(word: string) {
		try {
			const previousLevel = gameState.wordle.level;
			const previousFragments = { ...gameState.wordle.fragmentCounts };
			const nextState = await submitWordleGuess(word);
			const completedWord = nextState.wordle.previousWords.at(-1);

			gameSession.gameState = nextState;
			if (nextState.wordle.level > previousLevel && completedWord) {
				const rewardLetter = Object.keys(nextState.wordle.fragmentCounts).find(
					(letter) => nextState.wordle.fragmentCounts[letter] > (previousFragments[letter] ?? 0)
				);

				gameSession.levelComplete = {
					level: previousLevel,
					word: completedWord.truth,
					fragment: rewardLetter ?? completedWord.truth[0],
					experience: completedWord.experienceReward
				};
				gameSession.displayedLevel = previousLevel;
				goto(resolve('/game/wordle/level-complete'));
				return;
			}
			syncView();
		} catch (error) {
			console.error('Unable to submit Wordle guess', error);
		}
	}

	function tileClass(hint: Hint): string {
		if (hint === 'Correct') return 'bg-green-400';
		if (hint === 'Present') return 'bg-yellow-400';
		return 'bg-gray-400';
	}
</script>

<div class="pointer-events-none fixed inset-0 flex flex-col items-center justify-end gap-6 pb-24">
	<div class="flex flex-col gap-4" aria-label="Wordle guesses">
		{#each visibleGuesses as guess, guessIndex (level + ':' + (visibleStart + guessIndex))}
			<div
				class={`flex gap-2 ${selectedGuessIndex === visibleStart + guessIndex ? 'ring-4 ring-black ring-offset-4 ring-offset-white' : ''}`}
				aria-current={selectedGuessIndex === visibleStart + guessIndex ? 'true' : undefined}
			>
				{#each guess.hints as hint, index (index)}
					<div
						class={`flex size-28 items-center justify-center border-2 border-black font-medium text-black uppercase ${tileClass(hint)}`}
						aria-label={`${guess.word[index]}, ${hint}`}
					>
						<span class="text-6xl">{guess.word[index]}</span>
					</div>
				{/each}
			</div>
		{/each}
	</div>
	{#if isCurrent}
		<div class="pointer-events-auto">
			<WordleInput onSubmit={submitGuess} />
		</div>
	{/if}
</div>
