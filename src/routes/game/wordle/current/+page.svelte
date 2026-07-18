<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { gameSession } from '$lib/gameState.svelte';
	import { startWordleLevel, GameApiError } from '$lib/gameApi';

	let starting = $state(false);
	let errorMessage = $state('');
	let previousWords = $derived(gameSession.gameState.wordle.previousWords.slice(-5));

	function readableError(error: unknown): string {
		if (error instanceof GameApiError && (error.code === 'INSUFFICIENT_COINS' || error.status === 402)) {
			return 'INSUFFICIENT COINS';
		}
		return error instanceof Error ? error.message : 'UNABLE TO START LEVEL';
	}

	async function start() {
		if (starting || gameSession.gameState.wordle.levelStarted) return;
		starting = true;
		errorMessage = '';
		try {
			gameSession.gameState = await startWordleLevel();
			gameSession.displayedLevel = gameSession.gameState.wordle.level;
			await goto(resolve('/game/wordle/play'));
		} catch (error) {
			errorMessage = readableError(error);
		} finally {
			starting = false;
		}
	}
</script>

<section class="flex w-full max-w-3xl flex-col gap-4 px-4 text-black uppercase">
	{#if errorMessage}
		<p class="border-2 border-red-600 bg-red-100 px-4 py-3 text-center text-red-700" role="alert">
			{errorMessage}
		</p>
	{/if}
	<div class="flex flex-col gap-2" aria-label="Wordle level history">
		{#each previousWords as word, index (gameSession.gameState.wordle.level - previousWords.length + index)}
			{@const level = gameSession.gameState.wordle.level - previousWords.length + index}
			<a
				href={resolve(`/game/wordle/${level}`)}
				class="flex min-h-20 flex-wrap items-center gap-4 border-2 border-black bg-white px-4 py-3 hover:bg-gray-100"
			>
				<span class="w-20 text-sm">LEVEL {level}</span>
				<span class="flex gap-1" aria-label={`Completed word ${word.truth}`}>
					{#each word.truth.toUpperCase() as letter, letterIndex (letterIndex)}
						<span
							class:bg-blue-400={word.fragmentRewardIndex === letterIndex}
							class:bg-green-400={word.fragmentRewardIndex !== letterIndex}
							class="flex size-10 items-center justify-center border-2 border-black text-xl"
						>
							{letter}
						</span>
					{/each}
				</span>
				<span class="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
					<span>+{word.experienceReward} XP</span>
					<span>FRAGMENT {word.fragmentReward?.toUpperCase() ?? '—'}</span>
					<span>{word.guesses.length} GUESSES</span>
				</span>
			</a>
		{/each}
		<div class="flex min-h-20 items-center gap-4 border-2 border-black bg-yellow-300 px-4 py-3">
			<span class="w-20 text-sm">LEVEL {gameSession.gameState.wordle.level}</span>
			<span class="text-sm">{gameSession.gameState.wordle.levelStarted ? 'IN PROGRESS' : 'NOT STARTED'}</span>
			{#if gameSession.gameState.wordle.levelStarted}
				<a class="ml-auto border-2 border-black bg-black px-5 py-2 text-white hover:bg-white hover:text-black" href={resolve('/game/wordle/play')}>CONTINUE</a>
			{:else}
				<div class="ml-auto flex shrink-0 items-center gap-2">
					<span class="whitespace-nowrap text-xs sm:text-sm">-1 COIN</span>
					<button class="border-2 border-black bg-black px-5 py-2 text-white hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-50" onclick={start} disabled={starting}>
						{starting ? 'STARTING...' : 'START'}
					</button>
				</div>
			{/if}
		</div>
	</div>
</section>
