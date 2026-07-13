<script lang="ts">
	import { onMount } from 'svelte';
	import { placeFragment, placeRune, type GameState } from '$lib/GameCore';

	let { gameState, resourceMode }: { gameState: GameState; resourceMode: 'fragments' | 'runes' } =
		$props();
	let selectedX = $state(4);
	let selectedY = $state(4);
	let pendingLetter = $state('');

	function tileColorClass(
		tile: (typeof gameState.crossword.tiles)[number][number],
		selected: boolean
	): string {
		const hasFragment = tile.fragment.letter !== null;
		const hasRune = tile.rune.letter !== null;

		if (hasFragment && hasRune) return 'border-black bg-blue-400 text-black';
		if (hasFragment) return 'border-black bg-blue-400 text-black';
		if (hasRune) return 'border-black bg-purple-400 text-black';
		if (selected)
			return resourceMode === 'fragments'
				? 'border-black bg-blue-300 text-black'
				: 'border-black bg-purple-300 text-black';
		return 'border-black bg-white text-black';
	}

	onMount(() => {
		function handleKeydown(event: KeyboardEvent) {
			let nextX = selectedX;
			let nextY = selectedY;

			if (event.key === 'ArrowLeft') nextX -= 1;
			else if (event.key === 'ArrowRight') nextX += 1;
			else if (event.key === 'ArrowUp') nextY -= 1;
			else if (event.key === 'ArrowDown') nextY += 1;
			else if (/^[a-zA-Z]$/.test(event.key)) {
				event.preventDefault();
				pendingLetter = event.key.toLowerCase();
				return;
			} else if (event.key === 'Backspace') {
				event.preventDefault();
				pendingLetter = '';
				return;
			} else if (event.key === 'Enter') {
				event.preventDefault();
				if (!pendingLetter) return;

				const tile = gameState.crossword.tiles[selectedY]?.[selectedX];
				if (resourceMode === 'fragments') {
					placeFragment(gameState, pendingLetter, selectedX, selectedY);
					if (tile?.fragment.letter === pendingLetter) pendingLetter = '';
				} else {
					placeRune(gameState, pendingLetter, selectedX, selectedY);
					if (tile?.rune.letter === pendingLetter) pendingLetter = '';
				}
				return;
			} else return;

			event.preventDefault();
			selectedX = Math.max(0, Math.min(nextX, gameState.crossword.tiles[0].length - 1));
			selectedY = Math.max(0, Math.min(nextY, gameState.crossword.tiles.length - 1));
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="pointer-events-none fixed inset-0 grid place-items-center">
	<div class="grid grid-cols-9 gap-2" aria-label="Crossword grid">
		{#each gameState.crossword.tiles as row, y (y)}
			{#each row as tile, x (x)}
				<div
					class={`relative flex size-18 items-center justify-center border-2 text-center text-2xl font-medium uppercase outline-none ${tileColorClass(tile, selectedX === x && selectedY === y)}`}
					aria-label={`Square ${x},${y}, ${tile.fragment.letter ?? tile.rune.letter ?? 'empty'}`}
				>
					{#if tile.fragment.letter !== null && tile.rune.letter !== null}
						<span class="absolute inset-1 bg-purple-400" aria-hidden="true"></span>
					{/if}
					<span class="absolute top-0.5 left-1 z-10 text-xs font-normal"
						>{selectedX === x && selectedY === y ? '★' : `${x},${y}`}</span
					>
					<span class="relative z-10">{tile.fragment.letter ?? tile.rune.letter ?? ''}</span>
					<span class="absolute right-1 bottom-0.5 z-10 text-sm font-normal"
						>{selectedX === x && selectedY === y ? pendingLetter.toUpperCase() : ''}</span
					>
				</div>
			{/each}
		{/each}
	</div>
</div>
