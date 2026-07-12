<script lang="ts">
	const tabs = ['CROSS', 'WORDLE', 'CRAFT'];
</script>

<nav class="flex justify-center gap-2" aria-label="Game selection">
	{#each tabs as tab}
		<button
			type="button"
			role="tab"
			class="w-48 cursor-pointer border-2 border-black bg-white px-6 py-3 text-lg font-medium text-black uppercase transition-colors hover:bg-black hover:text-white"
		>
			{tab}
		</button>
	{/each}
</nav>
