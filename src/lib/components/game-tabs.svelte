<script lang="ts">
	type TabMode = 'xp' | 'cross' | 'wordle' | 'craft' | 'coins';

	let { activeTab, onTabChange }: { activeTab: TabMode; onTabChange: (mode: TabMode) => void } =
		$props();

	const tabs: { label: string; mode: TabMode }[] = [
		{ label: 'XP LB', mode: 'xp' },
		{ label: 'CROSS', mode: 'cross' },
		{ label: 'WORDLE', mode: 'wordle' },
		{ label: 'CRAFT', mode: 'craft' },
		{ label: 'COIN LB', mode: 'coins' }
	];
</script>

<nav
	class="flex flex-wrap justify-center gap-1 md:gap-2"
	aria-label="Game and leaderboard selection"
>
	{#each tabs as tab (tab.mode)}
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === tab.mode}
			class={`w-16 cursor-pointer border-2 border-black px-1 py-2 text-sm font-medium uppercase transition-colors md:w-48 md:px-6 md:py-3 md:text-2xl ${
				activeTab === tab.mode
					? 'bg-black text-white hover:bg-white hover:text-black'
					: 'bg-white text-black hover:bg-black hover:text-white'
			}`}
			onclick={() => onTabChange(tab.mode)}
		>
			{tab.label}
		</button>
	{/each}
</nav>
