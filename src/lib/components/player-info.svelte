<script lang="ts">
	import type { LetterCounts } from '$lib/GameCore';

	let {
		level,
		experience,
		coin,
		fragmentCounts,
		runeCounts
	}: {
		level: number;
		experience: number;
		coin: number;
		fragmentCounts: LetterCounts;
		runeCounts: LetterCounts;
	} = $props();

	let totalFragments = $derived(
		Object.values(fragmentCounts).reduce((total, count) => total + count, 0)
	);
	let totalRunes = $derived(Object.values(runeCounts).reduce((total, count) => total + count, 0));
</script>

<div
	class="flex items-center gap-2 text-base font-medium whitespace-nowrap text-black uppercase"
	aria-label="Player info"
>
	<div class="flex h-7 w-48 items-center justify-center gap-4 border-2 border-black bg-white px-3">
		<span>EXP {experience}</span>
		<span>COIN {coin}</span>
	</div>
	<div class="flex h-7 w-48 items-center justify-center border-2 border-black bg-white px-3">
		LEVEL {level}
	</div>
	<div class="flex h-7 w-48 items-center justify-center gap-6 border-2 border-black bg-white px-3">
		<span>FRAG {totalFragments}</span>
		<span>RUNE {totalRunes}</span>
	</div>
</div>
