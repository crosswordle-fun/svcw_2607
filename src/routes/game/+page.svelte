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
	import { gameSession, type GameMode } from '$lib/gameState.svelte';
	import { getGameState, incrementDebugResources, isAuthenticated } from '$lib/gameApi';
	const leftLetters = 'ABCDEFGHIJKLM'.split('');
	const rightLetters = 'MNOPQRSTUVWXYZ'.split('');

	function changeGameMode(mode: GameMode) {
		// Browsing previous Wordle levels is temporary; other modes always show the latest level.
		gameSession.displayedLevel = gameSession.gameState.wordle.level;
		gameSession.gameMode = mode;
	}

	onMount(() => {
		if (!isAuthenticated()) {
			goto(resolve('/'));
			return;
		}
		getGameState()
			.then((nextState) => {
				gameSession.gameState = nextState;
				gameSession.displayedLevel = nextState.wordle.level;
			})
			.catch((error) => console.error('Unable to connect to the game server', error));

		// Temporary multiplayer synchronization until a WebSocket channel is added.
		const syncTimer = window.setInterval(() => {
			getGameState()
				.then((nextState) => (gameSession.gameState = nextState))
				.catch(() => undefined);
		}, 2000);

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Tab') {
				event.preventDefault();
				gameSession.resourceMode = gameSession.resourceMode === 'fragments' ? 'runes' : 'fragments';
				return;
			}
			if (event.key === '0') {
				incrementDebugResources()
					.then((nextState) => (gameSession.gameState = nextState))
					.catch((error) => console.error('Unable to increment debug resources', error));
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
	<GameTabs gameMode={gameSession.gameMode} onModeChange={changeGameMode} />
	<div class="-mt-4">
		<PlayerInfo
			level={gameSession.displayedLevel}
			experience={gameSession.gameState.wordle.experience}
			coin={gameSession.gameState.wordle.coin}
			fragmentCounts={gameSession.gameState.wordle.fragmentCounts}
			runeCounts={gameSession.gameState.wordle.runeCounts}
		/>
	</div>
	<div class="pointer-events-none fixed inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
		<FragRuneDisplay
			letters={leftLetters}
			counts={gameSession.resourceMode === 'fragments'
				? gameSession.gameState.wordle.fragmentCounts
				: gameSession.gameState.wordle.runeCounts}
			kind={gameSession.resourceMode}
		/>
		<FragRuneDisplay
			letters={rightLetters}
			counts={gameSession.resourceMode === 'fragments'
				? gameSession.gameState.wordle.fragmentCounts
				: gameSession.gameState.wordle.runeCounts}
			kind={gameSession.resourceMode}
		/>
	</div>
	{#if gameSession.gameMode === 'wordle'}
		<WordleModeView
			gameState={gameSession.gameState}
			onStateChange={(nextState) => (gameSession.gameState = nextState)}
			onWordChange={(level) => (gameSession.displayedLevel = level)}
		/>
	{:else if gameSession.gameMode === 'cross'}
		<CrossModeView
			gameState={gameSession.gameState}
			resourceMode={gameSession.resourceMode}
			viewportRows={5}
			viewportColumns={9}
			onStateChange={(nextState) => (gameSession.gameState = nextState)}
		/>
	{:else}
		<CraftModeView
			gameState={gameSession.gameState}
			onStateChange={(nextState) => (gameSession.gameState = nextState)}
		/>
	{/if}
</main>
