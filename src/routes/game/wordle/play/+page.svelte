<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import WordleModeView from '$lib/components/wordle-mode-view.svelte';
	import { gameSession } from '$lib/gameState.svelte';
	import { getGameState } from '$lib/gameApi';

	let loading = $state(true);
	let errorMessage = $state('');

	onMount(() => {
		let cancelled = false;

		async function loadGameState() {
			try {
				const nextState = await getGameState();
				if (cancelled) return;

				gameSession.gameState = nextState;
				gameSession.displayedLevel = nextState.wordle.level;
				loading = false;

				if (!nextState.wordle.levelStarted) {
					void goto(resolve('/game/wordle/current'));
				}
			} catch (error) {
				if (cancelled) return;
				errorMessage = error instanceof Error ? error.message : 'UNABLE TO LOAD GAME';
				loading = false;
			}
		}

		void loadGameState();
		return () => {
			cancelled = true;
		};
	});
</script>


{#if loading}
	<p class="px-4 text-center text-black uppercase">LOADING GAME...</p>
{:else if errorMessage}
	<p class="border-2 border-red-600 bg-red-100 px-4 py-3 text-center text-red-700" role="alert">
		{errorMessage}
	</p>
{:else if gameSession.gameState.wordle.levelStarted}
	<WordleModeView gameState={gameSession.gameState} level="current" />
{/if}
