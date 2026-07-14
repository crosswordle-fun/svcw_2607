<script lang="ts">
	import type { Tile, TilePiece } from '$lib/GameCore';

	let { tile, x, y }: { tile: Tile | undefined; x: number; y: number } = $props();

	function playerLabel(piece: TilePiece): string {
		return piece.playerId === null ? '—' : `Player ${piece.playerId}`;
	}

	let pieces: { kind: string; piece: TilePiece }[] = $derived(
		tile
			? [
					{ kind: 'Fragment', piece: tile.fragment },
					{ kind: 'Rune', piece: tile.rune }
				]
			: []
	);
</script>

<section class="w-full text-black" aria-label={`Tile information for square ${x},${y}`}>
	{#if tile}
		<div class="grid min-w-[38rem] grid-cols-9 gap-2 text-center uppercase">
			{#each pieces as { kind, piece }}
				<div
					class={`row-start-1 min-w-0 border-2 border-black bg-white px-2 py-2 ${kind === 'Fragment' ? 'col-start-1 col-span-4' : 'col-start-6 col-span-4'}`}
					aria-label={`${kind} details`}
				>
					<div class="grid grid-cols-3 items-center">
						<div class="min-w-0">
							<strong class="block truncate text-xs">{kind}</strong>
							<b class="block truncate">{piece.letter ?? '—'}</b>
						</div>
						<div class="min-w-0">
							<span class="block truncate text-xs">Placed by</span>
							<b class="block truncate normal-case">{playerLabel(piece)}</b>
						</div>
						<div class="min-w-0">
							<span class="block text-xs">XP</span>
							<b class="block">{piece.experienceReward}</b>
						</div>
					</div>
				</div>
			{/each}

			<div
				class="col-start-5 col-span-1 row-start-1 min-w-0 border-2 border-black bg-white px-2 py-2"
			>
				<strong class="block text-xs">Tile</strong>
				<b class="block truncate text-base">{x},{y}</b>
			</div>
		</div>
	{:else}
		<div class="border-2 border-black bg-white px-3 py-2 text-center text-sm uppercase">
			No tile selected.
		</div>
	{/if}
</section>
