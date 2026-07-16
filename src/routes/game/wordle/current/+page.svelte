<script lang="ts">
	import WordleModeView from '$lib/components/wordle-mode-view.svelte';
	import { gameSession } from '$lib/gameState.svelte';
</script>

<WordleModeView gameState={gameSession.gameState} level="current" />
