<script lang="ts">
	const squares = Array.from({ length: 81 }, (_, index) => index);
</script>

<div class="pointer-events-none fixed inset-0 grid place-items-center">
	<div class="grid grid-cols-9 gap-2" aria-label="Crossword grid">
		{#each squares as square (square)}
			<div
				class="size-18 border-2 border-black bg-white text-center text-2xl font-medium text-black uppercase outline-none"
				aria-label={`Square ${square + 1}`}
			></div>
		{/each}
	</div>
</div>
