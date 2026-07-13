<script lang="ts">
	import type { LetterCounts } from '$lib/GameCore';

	let {
		letters,
		counts,
		kind
	}: { letters: string[]; counts: LetterCounts; kind: 'fragments' | 'runes' } = $props();
</script>

<div class="grid gap-2" aria-label={`${kind} display`}>
	{#each letters as letter (letter)}
		<div
			class={`flex size-14 flex-col items-center justify-center border-2 border-black text-black uppercase ${kind === 'fragments' ? 'bg-blue-400' : 'bg-purple-400'}`}
			aria-label={`${letter}, ${kind === 'fragments' ? 'fragment' : 'rune'} count ${counts[letter.toLowerCase()] ?? 0}`}
		>
			<span class="text-lg font-medium">{letter}</span>
			<span class="text-sm">{counts[letter.toLowerCase()] ?? 0}</span>
		</div>
	{/each}
</div>
