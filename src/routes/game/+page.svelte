<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import CraftModeView from '$lib/components/craft-mode-view.svelte';
	import FragRuneDisplay from '$lib/components/frag-rune-display.svelte';
	import CrossModeView from '$lib/components/cross-mode-view.svelte';
	import GameTabs from '$lib/components/game-tabs.svelte';
	import PlayerInfo from '$lib/components/player-info.svelte';
	import WordleModeView from '$lib/components/wordle-mode-view.svelte';
	import { createGameState, type GameState } from '$lib/GameCore';
	import { getGameState, isAuthenticated } from '$lib/gameApi';

	type GameMode = 'cross' | 'wordle' | 'craft';

	let gameState = $state<GameState>(createGameState());
	let displayedLevel = $state(1);
	let resourceMode: 'fragments' | 'runes' = $state('fragments');
	let gameMode: GameMode = $state('wordle');
	const leftLetters = 'ABCDEFGHIJKLM'.split('');
	const rightLetters = 'MNOPQRSTUVWXYZ'.split('');

	function changeGameMode(mode: GameMode) {
		// Browsing previous Wordle levels is temporary; other modes always show the latest level.
		displayedLevel = gameState.wordle.level;
		gameMode = mode;
	}

	onMount(() => {
		if (!isAuthenticated()) {
			goto(resolve('/'));
			return;
		}
		getGameState()
			.then((nextState) => {
				gameState = nextState;
				displayedLevel = nextState.wordle.level;
			})
			.catch((error) => console.error('Unable to connect to the game server', error));

		// Temporary multiplayer synchronization until a WebSocket channel is added.
		const syncTimer = window.setInterval(() => {
			getGameState().then((nextState) => (gameState = nextState)).catch(() => undefined);
		}, 2000);

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Tab') {
				event.preventDefault();
				resourceMode = resourceMode === 'fragments' ? 'runes' : 'fragments';
				return;
			}
			if (event.key === '1') changeGameMode('cross');
			if (event.key === '2') changeGameMode('wordle');
			if (event.key === '3') changeGameMode('craft');
			if (event.key === 'Escape') goto(resolve('/'));
		}

		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			window.clearInterval(syncTimer);
		};
	});
</script>

<main class="flex min-h-screen flex-col items-center gap-8 pt-8">
	<GameTabs {gameMode} onModeChange={changeGameMode} />
	<div class="-mt-4">
		<PlayerInfo
			level={displayedLevel}
			experience={gameState.wordle.experience}
			coin={gameState.wordle.coin}
			fragmentCounts={gameState.wordle.fragmentCounts}
			runeCounts={gameState.wordle.runeCounts}
		/>
	</div>
	<div class="pointer-events-none fixed inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
		<FragRuneDisplay
			letters={leftLetters}
			counts={resourceMode === 'fragments'
				? gameState.wordle.fragmentCounts
				: gameState.wordle.runeCounts}
			kind={resourceMode}
		/>
		<FragRuneDisplay
			letters={rightLetters}
			counts={resourceMode === 'fragments'
				? gameState.wordle.fragmentCounts
				: gameState.wordle.runeCounts}
			kind={resourceMode}
		/>
	</div>
	{#if gameMode === 'wordle'}
		<WordleModeView
			{gameState}
			onStateChange={(nextState) => (gameState = nextState)}
			onWordChange={(level) => (displayedLevel = level)}
		/>
	{:else if gameMode === 'cross'}
		<CrossModeView
			{gameState}
			{resourceMode}
			viewportRows={5}
			viewportColumns={9}
			onStateChange={(nextState) => (gameState = nextState)}
		/>
	{:else}
		<CraftModeView {gameState} onStateChange={(nextState) => (gameState = nextState)} />
	{/if}
</main>
