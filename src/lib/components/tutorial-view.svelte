<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TiledTitle from '$lib/components/tiled-title.svelte';

	const steps = [
		{
			title: 'GAME MODES',
			body: 'Switch between WORDLE, CROSSWORD, and CRAFT with the top tabs.',
			control: '1 = CROSSWORD   2 = WORDLE   3 = CRAFT'
		},
		{
			title: 'WORDLE',
			body: 'Guess the five-letter word. Correct letters are green, present letters are yellow, and absent letters are gray.',
			control: 'ARROW LEFT / RIGHT = PREVIOUS OR CURRENT LEVEL'
		},
		{
			title: 'CROSSWORD',
			body: 'Place fragments and runes into the crossword grid. Use the selected resource type to fill open tiles and collect coin rewards.',
			control: 'TAB = SWITCH BETWEEN FRAGMENTS AND RUNES'
		},
		{
			title: 'CRAFT',
			body: 'Use fragments to craft runes. Select a letter for a specific rune or craft a random rune from available resources.',
			control: 'TAB = SWITCH BETWEEN FRAGMENTS AND RUNES'
		},
		{
			title: 'RESOURCES AND EXIT',
			body: 'Your level, experience, coins, fragments, and runes are always shown around the game. Your progress syncs automatically.',
			control: 'ESC = HOMEPAGE   0 = DEBUG RESOURCES'
		}
	] as const;

	let { step }: { step?: number } = $props();
	let selectedStep = $derived(step ?? 0);
	let current = $derived(step === undefined ? undefined : steps[selectedStep]);
	let backHomeButton: HTMLButtonElement;

	onMount(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				backHomeButton.focus();
				return;
			}
			if (event.key === 'Escape') {
				goto(resolve('/'));
				return;
			}
			if (event.key === 'ArrowRight' && selectedStep < steps.length - 1) {
				event.preventDefault();
				goto(resolve(`/tutorial/controls/${selectedStep + 2}`));
			}
			if (event.key === 'ArrowLeft' && selectedStep > 0) {
				event.preventDefault();
				goto(resolve(`/tutorial/controls/${selectedStep}`));
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<main class="flex min-h-screen items-center justify-center p-6 uppercase">
	<div class="flex w-full max-w-[1192px] flex-col items-center gap-6 text-center">
		<TiledTitle title="CROSSWORDLE" />
		{#if current}
			<p class="text-sm uppercase">CONTROL {selectedStep + 1} / {steps.length}</p>
			<div class="flex w-full items-center gap-3">
				{#if selectedStep > 0}
					<a
						aria-label="Previous tutorial"
						class="flex size-12 shrink-0 items-center justify-center border-2 border-black bg-white text-3xl text-black outline-none focus:bg-black focus:text-white hover:bg-black hover:text-white"
						href={resolve(`/tutorial/controls/${selectedStep}`)}>&lt;</a
					>
				{:else}<span class="size-12 shrink-0"></span>{/if}
				<section class="flex min-w-0 flex-1 flex-col gap-5 border-2 border-black p-6">
					<h1 class="text-3xl uppercase">{current.title}</h1>
					<p class="text-lg">{current.body}</p>
					<p class="border-2 border-black bg-black p-3 text-lg text-white uppercase">
						{current.control}
					</p>
				</section>
				{#if selectedStep < steps.length - 1}
					<a
						aria-label="Next tutorial"
						class="flex size-12 shrink-0 items-center justify-center border-2 border-black bg-white text-3xl text-black outline-none focus:bg-black focus:text-white hover:bg-black hover:text-white"
						href={resolve(`/tutorial/controls/${selectedStep + 2}`)}>&gt;</a
					>
				{:else}<span class="size-12 shrink-0"></span>{/if}
			</div>
		{:else}
			<h1 class="text-3xl uppercase">CONTROLS</h1>
			<p class="text-lg uppercase">Learn every game mode and keyboard control.</p>
			<a
				class="w-full border-2 border-black bg-black px-6 py-3 text-xl text-white uppercase hover:bg-white hover:text-black"
				href={resolve('/tutorial/controls/1')}>START TUTORIAL</a
			>
		{/if}
		<button
			bind:this={backHomeButton}
			class="w-full border-2 border-black bg-white px-6 py-3 text-xl text-black outline-none focus:bg-black focus:text-white hover:bg-black hover:text-white"
			type="button"
			onclick={() => goto(resolve('/'))}
		>
			BACK TO HOME
		</button>
	</div>
</main>
