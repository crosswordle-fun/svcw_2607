<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TiledTitle from '$lib/components/tiled-title.svelte';

	const title = 'CROSSWORDLE';

	onMount(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Enter') {
				event.preventDefault();
				goto(resolve('/game'));
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<main class="flex min-h-screen items-center justify-center">
	<div class="flex flex-col items-center gap-6">
		<TiledTitle {title} />
		<button
			type="button"
			class="w-48 cursor-pointer border-2 border-black bg-white px-6 py-4 text-lg font-medium text-black uppercase transition-colors hover:bg-black hover:text-white"
			onclick={() => goto(resolve('/game'))}
		>
			PLAY
		</button>
	</div>
</main>
