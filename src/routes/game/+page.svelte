<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import CrossModeView from '$lib/components/cross-mode-view.svelte';
	import GameTabs from '$lib/components/game-tabs.svelte';
	import LevelDisplay from '$lib/components/level-display.svelte';
	import WordleModeView from '$lib/components/wordle-mode-view.svelte';

	type GameMode = 'cross' | 'wordle' | 'craft';

	let gameMode: GameMode = $state('wordle');

	onMount(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === '1') gameMode = 'cross';
			if (event.key === '2') gameMode = 'wordle';
			if (event.key === '3') gameMode = 'craft';
			if (event.key === 'Escape') goto(resolve('/'));
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<main class="flex min-h-screen flex-col items-center gap-8 pt-8">
	<GameTabs {gameMode} onModeChange={(mode) => (gameMode = mode)} />
	{#if gameMode === 'wordle'}
		<LevelDisplay />
		<WordleModeView />
	{:else if gameMode === 'cross'}
		<CrossModeView />
	{:else}
		<h1 class="text-2xl font-bold uppercase">{gameMode}</h1>
	{/if}
</main>
