<script lang="ts">
	import { onMount } from 'svelte';

	let { onSubmit }: { onSubmit: (word: string) => void } = $props();
	let letters = $state(Array(5).fill(''));
	let inputs: HTMLInputElement[] = [];
	let activeIndex = 0;

	function setLetter(index: number, letter: string) {
		letters[index] = letter;
		inputs[index].value = letter;
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

	function handleInput(index: number, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		setLetter(
			index,
			input.value
				.replace(/[^a-zA-Z]/g, '')
				.slice(-1)
				.toUpperCase()
		);

		if (letters[index] && index < inputs.length - 1) {
			focusInput(index + 1);
		}
	}

	function clearLetters() {
		for (let index = 0; index < letters.length; index++) setLetter(index, '');
		focusInput(0);
	}

	function submit() {
		if (letters.some((letter) => !letter)) return;

		onSubmit(letters.join('').toLowerCase());
		clearLetters();
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			submit();
			return;
		}

		if (event.key.length === 1 && !/^[a-zA-Z]$/.test(event.key)) {
			event.preventDefault();
			return;
		}

		if (event.key === 'Backspace' && !letters[index] && index > 0) {
			focusInput(index - 1);
		}
	}
</script>

<div class="flex gap-2" aria-label="Wordle guess">
	{#each letters as letter, index (index)}
		<input
			bind:this={inputs[index]}
			value={letter}
			type="text"
			maxlength="1"
			pattern="[A-Za-z]"
			inputmode="text"
			autocomplete="off"
			aria-label={`Letter ${index + 1}`}
			onfocus={() => (activeIndex = index)}
			class="size-24 border-2 border-black bg-white text-center text-4xl font-medium text-black uppercase outline-none focus:bg-black focus:text-white"
			oninput={(event) => handleInput(index, event)}
			onkeydown={(event) => handleKeydown(index, event)}
		/>
	{/each}
</div>
