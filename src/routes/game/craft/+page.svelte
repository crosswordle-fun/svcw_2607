<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { gameSession } from '$lib/gameState.svelte';

	onMount(() => {
		gameSession.gameMode = 'craft';
		gameSession.craftComplete = null;
	});
</script>

<div class="flex min-h-[60vh] items-center justify-center">
	<div class="flex flex-col items-center gap-8 text-center uppercase">
		<h1 class="text-4xl">CRAFT RUNES</h1>
		<div class="flex gap-6">
			<button
				class="flex w-72 flex-col gap-3 border-2 border-black bg-white p-6 text-left hover:bg-black hover:text-white"
				onclick={() => goto(resolve('/game/craft/select'))}
			>
				<span class="text-2xl">SELECT RUNE</span>
				<span class="text-base">Spend 3 fragments of one letter to craft that rune.</span>
			</button>
			<button
				class="flex w-72 flex-col gap-3 border-2 border-black bg-white p-6 text-left hover:bg-black hover:text-white"
				onclick={() => goto(resolve('/game/craft/random'))}
			>
				<span class="text-2xl">RANDOM RUNE</span>
				<span class="text-base">Spend 5 fragments to craft a random rune.</span>
			</button>
		</div>
	</div>
</div>
