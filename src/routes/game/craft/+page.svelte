<script lang="ts">
	import { onMount } from 'svelte';
	import CraftModeView from '$lib/components/craft-mode-view.svelte';
	import { gameSession } from '$lib/gameState.svelte';

	onMount(() => (gameSession.gameMode = 'craft'));
</script>

<CraftModeView
	gameState={gameSession.gameState}
	onStateChange={(nextState) => (gameSession.gameState = nextState)}
/>
