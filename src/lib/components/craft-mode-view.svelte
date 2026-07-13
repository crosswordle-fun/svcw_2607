<script lang="ts">
	import { onMount } from 'svelte';
	import { craftRandomRune, craftSelectedRune, type GameState } from '$lib/GameCore';

	let { gameState }: { gameState: GameState } = $props();
	const dieFaces = [true, false, true, false, true, false, true, false, true];
	let letters = $state(Array(5).fill(''));
	let inputs: HTMLInputElement[] = [];
	let activeIndex = 0;
	let lastCraftedRune = $state('');
	let craftError = $state('');
	let enteredLetters = $derived(letters.filter(Boolean));
	let craftPrompt = $derived(
		enteredLetters.length === 3 && new Set(enteredLetters).size === 1
			? 'press enter to craft select rune'
			: enteredLetters.length === 5 && new Set(enteredLetters).size !== 1
				? 'press enter to craft random rune'
				: ''
	);

	function setLetter(index: number, letter: string) {
		letters[index] = letter;
		craftError = '';
		if (inputs[index]) inputs[index].value = letter;
	}

	function focusInput(index: number) {
		activeIndex = Math.max(0, Math.min(index, inputs.length - 1));
		inputs[activeIndex]?.focus();
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		if (event.target instanceof HTMLInputElement) return;

		if (/^[a-zA-Z]$/.test(event.key)) {
			event.preventDefault();
			setLetter(activeIndex, event.key.toUpperCase());
			if (activeIndex < inputs.length - 1) focusInput(activeIndex + 1);
		} else if (event.key === 'Backspace') {
			event.preventDefault();
			if (letters[activeIndex]) {
				setLetter(activeIndex, '');
			} else if (activeIndex > 0) {
				setLetter(activeIndex - 1, '');
				focusInput(activeIndex - 1);
			}
		}
	}

	onMount(() => {
		focusInput(0);
		window.addEventListener('keydown', handleGlobalKeydown);
		return () => window.removeEventListener('keydown', handleGlobalKeydown);
	});

	function clearLetters() {
		for (let index = 0; index < letters.length; index++) setLetter(index, '');
		focusInput(0);
	}

	function craft() {
		craftError = '';

		if (enteredLetters.length === 3 && new Set(enteredLetters).size === 1) {
			const letter = enteredLetters[0].toLowerCase();
			if (gameState.wordle.fragmentCounts[letter] < 3) {
				craftError = 'INSUFFICIENT FRAGMENTS';
				return;
			}

			const craftedRune = craftSelectedRune(gameState, letter);
			if (craftedRune) {
				lastCraftedRune = craftedRune;
				clearLetters();
			}
		} else if (enteredLetters.length === 5 && new Set(enteredLetters).size !== 1) {
			const word = enteredLetters.join('').toLowerCase();
			const required: Record<string, number> = {};
			for (const letter of word) required[letter] = (required[letter] ?? 0) + 1;

			if (
				Object.entries(required).some(
					([letter, count]) => gameState.wordle.fragmentCounts[letter] < count
				)
			) {
				craftError = 'INSUFFICIENT FRAGMENTS';
				return;
			}

			const craftedRune = craftRandomRune(gameState, word);
			if (craftedRune) {
				lastCraftedRune = craftedRune;
				clearLetters();
			}
		}
	}

	function handleInput(index: number, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const letter = input.value
			.replace(/[^a-zA-Z]/g, '')
			.slice(-1)
			.toUpperCase();
		setLetter(index, letter);
		if (letter && index < inputs.length - 1) focusInput(index + 1);
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			craft();
			return;
		}

		if (event.key.length === 1 && !/^[a-zA-Z]$/.test(event.key)) {
			event.preventDefault();
			return;
		}

		if (event.key === 'Backspace' && !letters[index] && index > 0) {
			event.preventDefault();
			setLetter(index - 1, '');
			focusInput(index - 1);
		}
	}
</script>

<div class="pointer-events-none fixed inset-0 grid place-items-center">
	<div class="pointer-events-auto flex flex-col items-center gap-2">
		<div class="grid grid-cols-3 gap-2" aria-label="Craft grid">
			{#each dieFaces as hasSquare, position (position)}
				<div class="size-24" aria-hidden={!hasSquare}>
					{#if hasSquare}
						{@const index = Math.floor(position / 2)}
						<input
							bind:this={inputs[index]}
							value={letters[index]}
							type="text"
							maxlength="1"
							pattern="[A-Za-z]"
							inputmode="text"
							autocomplete="off"
							aria-label={`Craft letter ${index + 1}`}
							onfocus={() => (activeIndex = index)}
							oninput={(event) => handleInput(index, event)}
							onkeydown={(event) => handleKeydown(index, event)}
							class="size-24 border-2 border-black bg-white text-center text-4xl font-medium text-black uppercase caret-transparent outline-none focus:bg-black focus:text-white"
						/>
					{/if}
				</div>
			{/each}
		</div>
		<div
			class={`flex size-24 items-center justify-center text-4xl font-medium text-black uppercase ${lastCraftedRune ? 'border-2 border-black bg-purple-400' : 'invisible'}`}
			aria-hidden={!lastCraftedRune}
			aria-label={lastCraftedRune ? `Last crafted rune: ${lastCraftedRune}` : undefined}
		>
			{lastCraftedRune}
		</div>
		<p class="h-6 text-center text-sm uppercase" aria-live="polite">{craftPrompt}</p>
		<p class="h-6 text-center text-sm text-red-600" aria-live="assertive">{craftError}</p>
	</div>
</div>
