<script lang="ts">
	import { onMount } from 'svelte';
	import CrossModeView from '$lib/components/cross-mode-view.svelte';
	import { gameSession } from '$lib/gameState.svelte';

	onMount(() => (gameSession.gameMode = 'cross'));
</script>

<CrossModeView
	gameState={gameSession.gameState}
	resourceMode={gameSession.resourceMode}
	viewportRows={5}
	viewportColumns={9}
	onStateChange={(nextState) => (gameSession.gameState = nextState)}
/>
