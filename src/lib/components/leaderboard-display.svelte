<script lang="ts">
	import type { LeaderboardEntry } from '$lib/gameApi';

	let {
		title,
		valueLabel,
		entries,
		loading,
		error
	}: {
		title: string;
		valueLabel: string;
		entries: LeaderboardEntry[];
		loading: boolean;
		error: string | null;
	} = $props();
</script>

<section
	class="w-full max-w-3xl border-2 border-black bg-white text-black"
	aria-labelledby="leaderboard-title"
>
	<h1
		id="leaderboard-title"
		class="border-b-2 border-black bg-black px-6 py-4 text-center text-3xl text-white uppercase"
	>
		{title}
	</h1>
	<div class="px-6 py-4">
		{#if loading && entries.length === 0}
			<p class="py-8 text-center text-xl uppercase">Loading...</p>
		{:else if error && entries.length === 0}
			<p class="py-8 text-center text-xl uppercase">Unable to load leaderboard</p>
		{:else if entries.length === 0}
			<p class="py-8 text-center text-xl uppercase">No scores yet</p>
		{:else}
			<div
				class="grid grid-cols-[4rem_1fr_8rem] border-b-2 border-black px-3 py-2 text-lg uppercase"
			>
				<span>Rank</span><span>Player</span><span class="text-right">{valueLabel}</span>
			</div>
			{#each entries as entry (entry.rank + entry.username)}
				<div
					class="grid grid-cols-[4rem_1fr_8rem] border-b border-black/30 px-3 py-3 text-xl last:border-b-0"
				>
					<span>{entry.rank}</span><span class="uppercase">{entry.username}</span><span class="text-right"
						>{entry.value}</span
					>
				</div>
			{/each}
		{/if}
	</div>
</section>
