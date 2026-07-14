<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameState, Hint } from '$lib/GameCore';
	import { submitWordleGuess } from '$lib/gameApi';
	import WordleInput from '$lib/components/wordle-input.svelte';

	let {
		gameState,
		onStateChange,
		onWordChange
	}: {
		gameState: GameState;
		onStateChange?: (gameState: GameState) => void;
		onWordChange?: (level: number) => void;
	} = $props();
	let selectedGuessIndex = $state(-1);
	let selectedWordIndex = $state(0);
	let visibleEnd = $state(0);
	let visibleStart = $derived(Math.max(0, visibleEnd - 5));
	let displayedWord = $derived(
		selectedWordIndex === gameState.wordle.previousWords.length
			? gameState.wordle.currentWord
			: gameState.wordle.previousWords[selectedWordIndex]
	);
	let visibleGuesses = $derived(displayedWord?.guesses.slice(visibleStart, visibleEnd) ?? []);

	function showLatestWord() {
		selectedWordIndex = gameState.wordle.previousWords.length;
		const guesses = gameState.wordle.currentWord.guesses;
		visibleEnd = guesses.length;
		selectedGuessIndex = guesses.length - 1;
		onWordChange?.(gameState.wordle.level);
	}

	async function submitGuess(word: string) {
		showLatestWord();
		try {
			const nextState = await submitWordleGuess(word);
			gameState = nextState;
			onStateChange?.(nextState);
			showLatestWord();
		} catch (error) {
			console.error('Unable to submit Wordle guess', error);
		}
	}

	function selectWord(index: number) {
		const latestIndex = gameState.wordle.previousWords.length;
		selectedWordIndex = Math.max(0, Math.min(index, latestIndex));
		onWordChange?.(
			selectedWordIndex === latestIndex ? gameState.wordle.level : selectedWordIndex + 1
		);
		const guesses =
			selectedWordIndex === latestIndex
				? gameState.wordle.currentWord.guesses
				: gameState.wordle.previousWords[selectedWordIndex].guesses;
		visibleEnd = guesses.length;
		selectedGuessIndex = guesses.length - 1;
	}

	function handleGuessNavigation(event: KeyboardEvent) {
		if (/^[a-zA-Z]$/.test(event.key)) {
			showLatestWord();
			return;
		}

		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			selectWord(selectedWordIndex + (event.key === 'ArrowLeft' ? -1 : 1));
			return;
		}

		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

		const guesses = displayedWord?.guesses ?? [];
		if (guesses.length === 0) return;

		event.preventDefault();
		const direction = event.key === 'ArrowUp' ? -1 : 1;
		selectedGuessIndex = Math.max(0, Math.min(selectedGuessIndex + direction, guesses.length - 1));

		// Move the five-guess viewport when navigation reaches either edge.
		if (selectedGuessIndex < visibleStart) visibleEnd = selectedGuessIndex + 5;
		if (selectedGuessIndex >= visibleEnd) visibleEnd = selectedGuessIndex + 1;
	}

	onMount(() => {
		showLatestWord();
		window.addEventListener('keydown', handleGuessNavigation);
		return () => window.removeEventListener('keydown', handleGuessNavigation);
	});

	function tileClass(hint: Hint): string {
		if (hint === 'Correct') return 'bg-green-400';
		if (hint === 'Present') return 'bg-yellow-400';
		return 'bg-gray-400';
	}
</script>

<div class="pointer-events-none fixed inset-0 flex flex-col items-center justify-end gap-6 pb-24">
	<div class="flex flex-col gap-4" aria-label="Wordle guesses">
		{#each visibleGuesses as guess, guessIndex (selectedWordIndex + ':' + (visibleStart + guessIndex))}
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
	<div class="pointer-events-auto">
		<WordleInput onSubmit={submitGuess} />
	</div>
</div>
