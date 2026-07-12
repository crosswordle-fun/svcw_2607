<script lang="ts">
	let { letters }: { letters: string[] } = $props();
</script>

<div class="grid gap-2" aria-label="Frag rune display">
	{#each letters as letter (letter)}
		<div
			class="flex size-14 flex-col items-center justify-center border-2 border-black bg-white text-black uppercase"
			aria-label={`${letter}, count 95`}
		>
			<span class="text-lg font-medium">{letter}</span>
			<span class="text-sm">95</span>
		</div>
	{/each}
</div>
