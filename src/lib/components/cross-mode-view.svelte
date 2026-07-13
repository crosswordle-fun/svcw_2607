<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameState } from '$lib/GameCore';
	import { submitFragment, submitRune } from '$lib/gameApi';

	let {
		gameState,
		resourceMode,
		onStateChange
	}: {
		gameState: GameState;
		resourceMode: 'fragments' | 'runes';
		onStateChange?: (gameState: GameState) => void;
	} = $props();
	let selectedX = $state(4);
	let selectedY = $state(4);
	let pendingLetter = $state('');
	const VIEW_SIZE = 5;
	let gridWidth = $derived(gameState.crossword.tiles[0]?.length ?? 0);
	let gridHeight = $derived(gameState.crossword.tiles.length);

	function wrapIndex(index: number, length: number): number {
		return length > 0 ? ((index % length) + length) % length : 0;
	}

	// The viewport moves only when the selection would leave its inner 3x3 area.
	let visibleStartX = $state(2);
	let visibleStartY = $state(2);

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
			let deltaX = 0;
			let deltaY = 0;

			if (event.key === 'ArrowLeft') {
				nextX -= 1;
				deltaX = -1;
			} else if (event.key === 'ArrowRight') {
				nextX += 1;
				deltaX = 1;
			} else if (event.key === 'ArrowUp') {
				nextY -= 1;
				deltaY = -1;
			} else if (event.key === 'ArrowDown') {
				nextY += 1;
				deltaY = 1;
			} else if (/^[a-zA-Z]$/.test(event.key)) {
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

				if (resourceMode === 'fragments') {
					submitFragment(pendingLetter, selectedX, selectedY)
						.then((nextState) => {
							gameState = nextState;
							onStateChange?.(nextState);
							if (
								nextState.crossword.tiles[selectedY]?.[selectedX]?.fragment.letter === pendingLetter
							) {
								pendingLetter = '';
							}
						})
						.catch((error) => console.error('Unable to place fragment', error));
				} else {
					submitRune(pendingLetter, selectedX, selectedY)
						.then((nextState) => {
							gameState = nextState;
							onStateChange?.(nextState);
							if (
								nextState.crossword.tiles[selectedY]?.[selectedX]?.rune.letter === pendingLetter
							) {
								pendingLetter = '';
							}
						})
						.catch((error) => console.error('Unable to place rune', error));
				}
				return;
			} else return;

			event.preventDefault();
			nextX = wrapIndex(nextX, gridWidth);
			nextY = wrapIndex(nextY, gridHeight);

			const currentOffsetX = wrapIndex(selectedX - visibleStartX, gridWidth);
			const currentOffsetY = wrapIndex(selectedY - visibleStartY, gridHeight);

			// Shift only when leaving the inner 3x3, not merely because the
			// destination is no longer at the viewport's outer edge.
			if (deltaX < 0 && currentOffsetX === 1) {
				visibleStartX = wrapIndex(nextX - 1, gridWidth);
			} else if (deltaX > 0 && currentOffsetX === 3) {
				visibleStartX = wrapIndex(nextX - 3, gridWidth);
			}
			if (deltaY < 0 && currentOffsetY === 1) {
				visibleStartY = wrapIndex(nextY - 1, gridHeight);
			} else if (deltaY > 0 && currentOffsetY === 3) {
				visibleStartY = wrapIndex(nextY - 3, gridHeight);
			}

			selectedX = nextX;
			selectedY = nextY;
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="pointer-events-none fixed inset-0 grid place-items-center">
	<div class="grid grid-cols-5 gap-2" aria-label="Crossword grid viewport">
		{#each Array.from({ length: VIEW_SIZE }) as _, rowOffset (rowOffset)}
			{@const y = wrapIndex(visibleStartY + rowOffset, gridHeight)}
			{#each Array.from({ length: VIEW_SIZE }) as _, columnOffset (columnOffset)}
				{@const x = wrapIndex(visibleStartX + columnOffset, gridWidth)}
				{@const tile = gameState.crossword.tiles[y][x]}
				<div
					class={`relative flex size-28 items-center justify-center border-2 text-center text-4xl font-medium uppercase outline-none ${tileColorClass(tile, selectedX === x && selectedY === y)}`}
					aria-label={`Square ${x},${y}, ${tile.fragment.letter ?? tile.rune.letter ?? 'empty'}`}
				>
					{#if tile.fragment.letter !== null && tile.rune.letter !== null}
						<span class="absolute inset-1 bg-purple-400" aria-hidden="true"></span>
					{/if}
					<span class="absolute top-1 left-2 z-10 text-base font-normal"
						>{selectedX === x && selectedY === y ? '★' : `${x},${y}`}</span
					>
					<span class="relative z-10">{tile.fragment.letter ?? tile.rune.letter ?? ''}</span>
					<span class="absolute right-2 bottom-1 z-10 text-xl font-normal"
						>{selectedX === x && selectedY === y ? pendingLetter.toUpperCase() : ''}</span
					>
				</div>
			{/each}
		{/each}
	</div>
</div>
