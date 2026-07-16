<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { gameSession } from '$lib/gameState.svelte';

	let selectedCard = $state(0);
	let cards: HTMLButtonElement[] = [];

	onMount(() => {
		gameSession.gameMode = 'craft';
		gameSession.craftComplete = null;
		cards[0]?.focus();

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
				event.preventDefault();
				selectedCard = event.key === 'ArrowLeft' ? 0 : 1;
				cards[selectedCard]?.focus();
			} else if (event.key === 'Enter') {
				event.preventDefault();
				openCard(selectedCard);
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	function openCard(card: number) {
		selectedCard = card;
		goto(resolve(card === 0 ? '/game/craft/select' : '/game/craft/random'));
	}
</script>

<div class="flex min-h-[60vh] items-center justify-center">
	<div class="flex flex-col items-center gap-8 text-center uppercase">
		<h1 class="text-4xl">CRAFT RUNES</h1>
		<div class="flex gap-4">
			<button
				bind:this={cards[0]}
				class={`flex w-80 flex-col gap-3 border-2 border-black p-6 text-left ${selectedCard === 0 ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
				aria-label="Select rune: spend 3 fragments of one letter"
				aria-current={selectedCard === 0 ? 'true' : undefined}
				onfocus={() => (selectedCard = 0)}
				onclick={() => openCard(0)}
			>
				<span class="text-2xl">SELECT RUNE</span>
				<span class="text-base">Spend 3 fragments of one letter to craft that rune.</span>
			</button>
			<button
				bind:this={cards[1]}
				class={`flex w-80 flex-col gap-3 border-2 border-black p-6 text-left ${selectedCard === 1 ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
				aria-label="Random rune: spend 5 fragments"
				aria-current={selectedCard === 1 ? 'true' : undefined}
				onfocus={() => (selectedCard = 1)}
				onclick={() => openCard(1)}
			>
				<span class="text-2xl">RANDOM RUNE</span>
				<span class="text-base">Spend 5 fragments to craft a random rune.</span>
			</button>
		</div>
		<p class="text-sm">USE LEFT / RIGHT, THEN ENTER</p>
	</div>
</div>
