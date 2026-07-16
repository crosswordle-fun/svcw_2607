<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { submitSelectedRune } from '$lib/gameApi';
	import WordleInput from '$lib/components/wordle-input.svelte';
	import { gameSession } from '$lib/gameState.svelte';

	let letter = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	let selectedButton = $state(1);
	let buttons: HTMLButtonElement[] = [];
	let count = $derived(
		letter ? (gameSession.gameState.wordle.fragmentCounts[letter.toLowerCase()] ?? 0) : 0
	);
	let canCraft = $derived(letter.length === 1 && count >= 3 && !isSubmitting);

	onMount(() => {
		gameSession.gameMode = 'craft';

		function handleButtonNavigation(event: KeyboardEvent) {
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
				event.preventDefault();
				selectedButton = event.key === 'ArrowUp' ? 0 : 1;
				buttons[selectedButton]?.focus();
			}
		}

		window.addEventListener('keydown', handleButtonNavigation);
		return () => window.removeEventListener('keydown', handleButtonNavigation);
	});

	function goBack() {
		goto(resolve('/game/craft'));
	}

	async function craft(inputLetter = letter) {
		const selectedLetter = inputLetter.toUpperCase();
		letter = selectedLetter;
		if (!selectedLetter) {
			errorMessage = 'ENTER A LETTER';
			return;
		}
		const selectedCount =
			gameSession.gameState.wordle.fragmentCounts[selectedLetter.toLowerCase()] ?? 0;
		if (selectedCount < 3) {
			errorMessage = 'YOU NEED 3 OF THAT FRAGMENT';
			return;
		}

		isSubmitting = true;
		errorMessage = '';
		try {
			const nextState = await submitSelectedRune(selectedLetter.toLowerCase());
			gameSession.gameState = nextState;
			gameSession.craftComplete = {
				kind: 'select',
				rune: selectedLetter,
				recipe: `3 ${selectedLetter}`
			};
			goto(resolve('/game/craft/result'));
		} catch (error) {
			errorMessage = 'UNABLE TO CRAFT RUNE';
			console.error('Unable to craft selected rune', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex min-h-[60vh] items-center justify-center">
	<div class="flex flex-col items-center gap-6 text-center uppercase">
		<h1 class="text-3xl">SELECT RUNE</h1>
		<p>Enter the fragment letter you want to convert.</p>
		<div class="flex flex-col items-center gap-3">
			<WordleInput
				length={1}
				onSubmit={craft}
				onChange={(value) => (letter = value.toUpperCase())}
			/>
			<span class="text-sm">AVAILABLE: {count} &nbsp; COST: 3</span>
		</div>
		<p class="h-6 text-red-600" aria-live="assertive">{errorMessage}</p>
		<div class="flex w-48 flex-col gap-3">
			<button
				bind:this={buttons[0]}
				class={`w-full border-2 border-black px-5 py-2 ${selectedButton === 0 ? 'bg-black text-white' : 'bg-white text-black'}`}
				aria-current={selectedButton === 0 ? 'true' : undefined}
				onfocus={() => (selectedButton = 0)}
				onclick={goBack}>BACK</button
			>
			<button
				bind:this={buttons[1]}
				class={`w-full border-2 border-black px-5 py-2 disabled:opacity-40 ${selectedButton === 1 ? 'bg-black text-white' : 'bg-white text-black'}`}
				aria-current={selectedButton === 1 ? 'true' : undefined}
				onfocus={() => (selectedButton = 1)}
				disabled={!canCraft}
				onclick={() => craft()}
			>
				{isSubmitting ? 'CRAFTING...' : 'CRAFT RUNE'}
			</button>
		</div>
	</div>
</div>
