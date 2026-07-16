<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Tile from '$lib/components/tile.svelte';
	import { gameSession } from '$lib/gameState.svelte';

	let completion = $derived(gameSession.levelComplete);

	onMount(() => {
		if (!gameSession.levelComplete) {
			goto(resolve('/game/wordle/current'));
			return;
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Enter') continueToNextLevel();
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	function continueToNextLevel() {
		gameSession.levelComplete = null;
		goto(resolve('/game/wordle/current'));
	}
</script>

{#if completion}
	<div class="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-black uppercase">
		<div class="text-4xl">LEVEL {completion.level} COMPLETE</div>
		<div class="flex flex-col items-center gap-3">
			<div class="text-xl">CORRECT WORD</div>
			<div class="flex gap-2" aria-label={completion.word}>
				{#each completion.word.toUpperCase() as letter, index (index)}
					<Tile {letter} size="size-28 bg-green-400" fontSize="text-6xl" />
				{/each}
			</div>
		</div>
		<div class="flex items-center gap-10">
			<div class="flex flex-col items-center gap-3">
				<div class="text-xl">FRAGMENT REWARDED</div>
				<Tile
					letter={completion.fragment.toUpperCase()}
					size="size-28 bg-blue-400"
					fontSize="text-6xl"
				/>
			</div>
			<div class="flex flex-col items-center gap-3">
				<div class="text-xl">EXP REWARDED</div>
				<div
					class="flex size-28 items-center justify-center border-2 border-black bg-yellow-300 text-4xl"
				>
					+{completion.experience}
				</div>
			</div>
		</div>
		<button
			class="border-2 border-black bg-black px-8 py-3 text-xl text-white uppercase hover:bg-white hover:text-black"
			onclick={continueToNextLevel}
		>
			NEXT LEVEL
		</button>
	</div>
{/if}
