<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Tile from '$lib/components/tile.svelte';
	import { gameSession } from '$lib/gameState.svelte';

	let result = $derived(gameSession.craftComplete);

	onMount(() => {
		gameSession.gameMode = 'craft';
		if (!gameSession.craftComplete) {
			goto(resolve('/game/craft'));
			return;
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Enter') goto(resolve('/game/craft'));
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	function craftAgain() {
		gameSession.craftComplete = null;
		goto(resolve('/game/craft'));
	}
</script>

{#if result}
	<div class="flex min-h-[60vh] items-center justify-center">
		<div class="flex flex-col items-center gap-6 text-center uppercase">
			<h1 class="text-4xl">RUNE CRAFTED</h1>
			<p>{result.kind === 'select' ? 'SELECTED RUNE' : 'RANDOM RUNE'}</p>
			<Tile letter={result.rune} size="size-28 bg-purple-400" fontSize="text-6xl" />
			<p>FRAGMENTS USED: {result.recipe}</p>
			<button class="border-2 border-black bg-black px-6 py-3 text-white" onclick={craftAgain}>
				CRAFT AGAIN
			</button>
		</div>
	</div>
{/if}
