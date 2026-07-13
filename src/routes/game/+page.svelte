<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import CraftModeView from '$lib/components/craft-mode-view.svelte';
	import FragRuneDisplay from '$lib/components/frag-rune-display.svelte';
	import CrossModeView from '$lib/components/cross-mode-view.svelte';
	import GameTabs from '$lib/components/game-tabs.svelte';
	import LevelDisplay from '$lib/components/level-display.svelte';
	import WordleModeView from '$lib/components/wordle-mode-view.svelte';
	import { createGameState, type GameState } from '$lib/GameCore';

	type GameMode = 'cross' | 'wordle' | 'craft';

	let gameState = $state<GameState>(createGameState());
	let gameMode: GameMode = $state('wordle');
	const leftLetters = 'ABCDEFGHIJKLM'.split('');
	const rightLetters = 'MNOPQRSTUVWXYZ'.split('');

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
	<div class="pointer-events-none fixed inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
		<FragRuneDisplay letters={leftLetters} />
		<FragRuneDisplay letters={rightLetters} />
	</div>
	{#if gameMode === 'wordle'}
		<LevelDisplay />
		<WordleModeView {gameState} />
	{:else if gameMode === 'cross'}
		<CrossModeView {gameState} />
	{:else}
		<CraftModeView />
	{/if}
</main>
