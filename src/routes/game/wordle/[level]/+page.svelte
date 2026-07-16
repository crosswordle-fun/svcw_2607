<script lang="ts">
	import WordleModeView from '$lib/components/wordle-mode-view.svelte';
	import { gameSession } from '$lib/gameState.svelte';

	let { data }: { data: { level: number } } = $props();
</script>

<WordleModeView gameState={gameSession.gameState} level={data.level} />
