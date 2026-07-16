<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { submitSelectedRune } from '$lib/gameApi';
	import { gameSession } from '$lib/gameState.svelte';

	let input: HTMLInputElement;
	let letter = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	let count = $derived(
		letter ? (gameSession.gameState.wordle.fragmentCounts[letter.toLowerCase()] ?? 0) : 0
	);
	let canCraft = $derived(letter.length === 1 && count >= 3 && !isSubmitting);

	onMount(() => {
		gameSession.gameMode = 'craft';
		input?.focus();
		input?.select();
	});

	function setLetter(nextLetter: string) {
		letter = nextLetter;
		if (input) input.value = nextLetter;
		input?.select();
		errorMessage = '';
	}

	function handleInput(event: Event) {
		setLetter(
			(event.currentTarget as HTMLInputElement).value
				.replace(/[^a-zA-Z]/g, '')
				.slice(-1)
				.toUpperCase()
		);
	}

	async function craft() {
		if (!letter) {
			errorMessage = 'ENTER A LETTER';
			return;
		}
		if (count < 3) {
			errorMessage = 'YOU NEED 3 OF THAT FRAGMENT';
			return;
		}

		isSubmitting = true;
		errorMessage = '';
		try {
			const nextState = await submitSelectedRune(letter.toLowerCase());
			gameSession.gameState = nextState;
			gameSession.craftComplete = { kind: 'select', rune: letter, recipe: `3 ${letter}` };
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
			<input
				bind:this={input}
				value={letter}
				type="text"
				maxlength="1"
				inputmode="text"
				autocomplete="off"
				aria-label="Fragment letter"
				oninput={handleInput}
				onkeydown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						craft();
					} else if (/^[a-zA-Z]$/.test(event.key)) {
						event.preventDefault();
						setLetter(event.key.toUpperCase());
					}
				}}
				class="size-28 border-2 border-black bg-white text-center text-6xl uppercase caret-transparent outline-none focus:bg-black focus:text-white"
			/>
			<span class="text-sm">AVAILABLE: {count} &nbsp; COST: 3</span>
		</div>
		<p class="h-6 text-red-600" aria-live="assertive">{errorMessage}</p>
		<div class="flex w-48 flex-col gap-3">
			<button
				class="w-full border-2 border-black px-5 py-2"
				onclick={() => goto(resolve('/game/craft'))}>BACK</button
			>
			<button
				class="w-full border-2 border-black bg-black px-5 py-2 text-white disabled:opacity-40"
				disabled={!canCraft}
				onclick={craft}
			>
				{isSubmitting ? 'CRAFTING...' : 'CRAFT RUNE'}
			</button>
		</div>
	</div>
</div>
