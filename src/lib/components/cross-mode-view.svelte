<script lang="ts">
	import type { GameState } from '$lib/GameCore';

	let { gameState }: { gameState: GameState } = $props();
</script>

<div class="pointer-events-none fixed inset-0 grid place-items-center">
	<div class="grid grid-cols-9 gap-2" aria-label="Crossword grid">
		{#each gameState.crossword.tiles as row, y (y)}
			{#each row as tile, x (x)}
				<div
					class="size-18 border-2 border-black bg-white text-center text-2xl font-medium text-black uppercase outline-none"
					aria-label={`Square ${y * row.length + x + 1}`}
				>
					{tile.fragment.letter ?? tile.rune.letter ?? ''}
				</div>
			{/each}
		{/each}
	</div>
</div>
