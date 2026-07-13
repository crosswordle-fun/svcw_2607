<script lang="ts">
	import { guessWordle, type GameState, type Hint } from '$lib/GameCore';
	import WordleInput from '$lib/components/wordle-input.svelte';

	let { gameState }: { gameState: GameState } = $props();

	function submitGuess(word: string) {
		guessWordle(gameState, word);
	}

	function tileClass(hint: Hint): string {
		if (hint === 'Correct') return 'bg-green-400';
		if (hint === 'Present') return 'bg-yellow-400';
		return 'bg-gray-400';
	}
</script>

<div class="pointer-events-none fixed inset-0 flex flex-col items-center justify-end gap-6 pb-24">
	<div class="flex flex-col gap-2" aria-label="Wordle guesses">
		{#each gameState.wordle.currentWord.guesses as guess, guessIndex (guessIndex)}
			<div class="flex gap-2">
				{#each guess.hints as hint, index (index)}
					<div
						class={`flex size-24 items-center justify-center border-2 border-black text-4xl font-medium text-black uppercase ${tileClass(hint)}`}
						aria-label={`${guess.word[index]}, ${hint}`}
					>
						{guess.word[index]}
					</div>
				{/each}
			</div>
		{/each}
	</div>
	<div class="pointer-events-auto">
		<WordleInput onSubmit={submitGuess} />
	</div>
</div>
