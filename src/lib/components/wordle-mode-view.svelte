<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { GameState, Hint } from '$lib/GameCore';
	import { gameSession } from '$lib/gameState.svelte';
	import { GameApiError, submitWordleGuess } from '$lib/gameApi';
	import WordleInput from '$lib/components/wordle-input.svelte';

	let { gameState, level }: { gameState: GameState; level: number | 'current' } = $props();
	let selectedGuessIndex = $state(-1);
	let visibleEnd = $state(0);
	let displayedWord = $derived(
		level === 'current' ? gameState.wordle.currentWord : gameState.wordle.previousWords[level - 1]
	);
	let effectiveVisibleEnd = $derived(
		visibleEnd === 0 ? (displayedWord?.guesses.length ?? 0) : visibleEnd
	);
	let visibleStart = $derived(Math.max(0, effectiveVisibleEnd - 5));
	let visibleGuesses = $derived(displayedWord?.guesses.slice(visibleStart, effectiveVisibleEnd) ?? []);
	let effectiveSelectedGuessIndex = $derived(
		selectedGuessIndex < 0 ? effectiveVisibleEnd - 1 : selectedGuessIndex
	);
	let isCurrent = $derived(level === 'current');
	let previousLevel = $derived(level === 'current' ? gameState.wordle.level - 1 : level - 1);
	let nextLevel = $derived(level === 'current' ? null : level + 1);
	let submitting = $state(false);
	let errorMessage = $state('');

	function syncView() {
		const guesses = displayedWord?.guesses ?? [];
		visibleEnd = guesses.length;
		selectedGuessIndex = guesses.length - 1;
		gameSession.displayedLevel = level === 'current' ? gameState.wordle.level : level;
	}

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
			if (selectedGuessIndex >= effectiveVisibleEnd) visibleEnd = selectedGuessIndex + 1;
		}

		window.addEventListener('keydown', handleGuessNavigation);
		return () => window.removeEventListener('keydown', handleGuessNavigation);
	});

	async function submitGuess(word: string) {
		if (submitting || !gameState.wordle.levelStarted) return;
		submitting = true;
		errorMessage = '';
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
				goto(resolve('/game/wordle/current'));
				return;
			}
			syncView();
		} catch (error) {
			if (error instanceof GameApiError && error.code === 'INSUFFICIENT_COINS') {
				errorMessage = 'INSUFFICIENT COINS';
			} else {
				errorMessage = error instanceof Error ? error.message : 'UNABLE TO SUBMIT GUESS';
			}
		} finally {
			submitting = false;
		}
	}

	function tileClass(hint: Hint): string {
		if (hint === 'Correct') return 'bg-green-400';
		if (hint === 'Present') return 'bg-yellow-400';
		return 'bg-gray-400';
	}
</script>

<div class="pointer-events-none fixed inset-0 flex flex-col items-center justify-end gap-6 pb-24">
	{#if errorMessage}<div class="pointer-events-auto border-2 border-red-600 bg-red-100 px-4 py-2 text-red-700" role="alert">{errorMessage}</div>{/if}
	<div class="flex flex-col gap-4" aria-label="Wordle guesses">
		{#each visibleGuesses as guess, guessIndex (level + ':' + (visibleStart + guessIndex))}
			<div
				class={`flex gap-2 ${effectiveSelectedGuessIndex === visibleStart + guessIndex ? 'ring-4 ring-black ring-offset-4 ring-offset-white' : ''}`}
				aria-current={effectiveSelectedGuessIndex === visibleStart + guessIndex ? 'true' : undefined}
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
