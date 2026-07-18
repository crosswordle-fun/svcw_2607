<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { gameSession, refreshLeaderboards, type GameMode } from '$lib/gameState.svelte';
	import FragRuneDisplay from '$lib/components/frag-rune-display.svelte';
	import GameTabs from '$lib/components/game-tabs.svelte';
	import PlayerInfo from '$lib/components/player-info.svelte';
	import { getGameState, incrementDebugResources, isAuthenticated } from '$lib/gameApi';

	let { children } = $props();
	const leftLetters = 'ABCDEFGHIJKLM'.split('');
	const rightLetters = 'MNOPQRSTUVWXYZ'.split('');
	let activeTab: 'xp' | 'cross' | 'wordle' | 'craft' | 'coins' = $derived(
		page.url.pathname === '/game/leaderboard/xp'
			? 'xp'
			: page.url.pathname === '/game/leaderboard/coins'
				? 'coins'
				: gameSession.gameMode
	);
	let leaderboardActive = $derived(activeTab === 'xp' || activeTab === 'coins');

	function changeGameMode(mode: GameMode) {
		gameSession.gameMode = mode;
		goto(resolve(`/game/${mode === 'wordle' ? 'wordle/current' : mode}`));
	}

	function changeTab(tab: 'xp' | 'cross' | 'wordle' | 'craft' | 'coins') {
		if (tab === 'xp' || tab === 'coins') goto(resolve(`/game/leaderboard/${tab}`));
		else changeGameMode(tab);
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
		refreshLeaderboards().catch((error) => console.error('Unable to load leaderboards', error));

		const syncTimer = window.setInterval(() => {
			getGameState()
				.then((nextState) => (gameSession.gameState = nextState))
				.catch(() => undefined);
			refreshLeaderboards().catch(() => undefined);
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
			if (event.key === '1') goto(resolve('/game/leaderboard/xp'));
			if (event.key === '2') changeGameMode('cross');
			if (event.key === '3') changeGameMode('wordle');
			if (event.key === '4') changeGameMode('craft');
			if (event.key === '5') goto(resolve('/game/leaderboard/coins'));
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
	<GameTabs {activeTab} onTabChange={changeTab} />
	{#if !leaderboardActive}
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
	{/if}
	{@render children()}
</main>
