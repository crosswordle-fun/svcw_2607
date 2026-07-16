<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { submitRandomRune } from '$lib/gameApi';
	import { gameSession } from '$lib/gameState.svelte';
	import WordleInput from '$lib/components/wordle-input.svelte';
	import { onMount } from 'svelte';

	let errorMessage = $state('');
	let isSubmitting = $state(false);

	onMount(() => (gameSession.gameMode = 'craft'));

	function fragmentCost(word: string): Record<string, number> {
		const cost: Record<string, number> = {};
		for (const letter of word) cost[letter] = (cost[letter] ?? 0) + 1;
		return cost;
	}

	async function craft(word: string) {
		errorMessage = '';
		if (new Set(word).size === 1) {
			errorMessage = 'USE MIXED FRAGMENTS FOR A RANDOM RUNE';
			return;
		}

		const required = fragmentCost(word);
		const unavailable = Object.entries(required).find(
			([letter, amount]) => gameSession.gameState.wordle.fragmentCounts[letter] < amount
		);
		if (unavailable) {
			errorMessage = `NOT ENOUGH ${unavailable[0].toUpperCase()} FRAGMENTS`;
			return;
		}

		isSubmitting = true;
		try {
			const previousRunes = { ...gameSession.gameState.wordle.runeCounts };
			const nextState = await submitRandomRune(word);
			const craftedRune = Object.keys(nextState.wordle.runeCounts).find(
				(letter) => nextState.wordle.runeCounts[letter] > (previousRunes[letter] ?? 0)
			);
			gameSession.gameState = nextState;
			gameSession.craftComplete = {
				kind: 'random',
				rune: craftedRune?.toUpperCase() ?? 'RUNE',
				recipe: word.toUpperCase()
			};
			goto(resolve('/game/craft/result'));
		} catch (error) {
			errorMessage = 'UNABLE TO CRAFT RUNE';
			console.error('Unable to craft random rune', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex min-h-[60vh] items-center justify-center">
	<div class="flex flex-col items-center gap-6 text-center uppercase">
		<h1 class="text-3xl">RANDOM RUNE</h1>
		<p>Enter 5 fragments to use in the craft.</p>
		<WordleInput onSubmit={craft} />
		<p class="h-6 text-red-600" aria-live="assertive">
			{isSubmitting ? 'CRAFTING...' : errorMessage}
		</p>
		<button class="border-2 border-black px-5 py-2" onclick={() => goto(resolve('/game/craft'))}
			>BACK</button
		>
	</div>
</div>
