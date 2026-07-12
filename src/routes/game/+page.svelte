<script lang="ts">
	import GameTabs from '$lib/components/game-tabs.svelte';

	type GameMode = 'cross' | 'wordle' | 'craft';

	let gameMode: GameMode = $state('wordle');
</script>

<main class="flex min-h-screen flex-col items-center gap-8 pt-8">
	<GameTabs {gameMode} onModeChange={(mode) => (gameMode = mode)} />
	<h1 class="text-2xl font-bold uppercase">{gameMode}</h1>
</main>
