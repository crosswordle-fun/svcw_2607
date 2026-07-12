<script lang="ts">
	type GameMode = 'cross' | 'wordle' | 'craft';

	let { gameMode, onModeChange }: { gameMode: GameMode; onModeChange: (mode: GameMode) => void } =
		$props();

	const tabs: { label: string; mode: GameMode }[] = [
		{ label: 'CROSS', mode: 'cross' },
		{ label: 'WORDLE', mode: 'wordle' },
		{ label: 'CRAFT', mode: 'craft' }
	];
</script>

<nav class="flex justify-center gap-2" aria-label="Game selection">
	{#each tabs as tab (tab.mode)}
		<button
			type="button"
			role="tab"
			aria-selected={gameMode === tab.mode}
			class={`w-48 cursor-pointer border-2 border-black px-6 py-3 text-lg font-medium uppercase transition-colors ${
				gameMode === tab.mode
					? 'bg-black text-white hover:bg-white hover:text-black'
					: 'bg-white text-black hover:bg-black hover:text-white'
			}`}
			onclick={() => onModeChange(tab.mode)}
		>
			{tab.label}
		</button>
	{/each}
</nav>
