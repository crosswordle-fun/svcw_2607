<script lang="ts">
	import Tile from '$lib/components/tile.svelte';

	let { title }: { title: string } = $props();
</script>

<div class="flex gap-2" aria-label={title}>
	{#each title as letter, index (index)}
		<Tile {letter} size="size-20" fontSize="text-2xl" />
	{/each}
</div>
