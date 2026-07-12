<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TiledTitle from '$lib/components/tiled-title.svelte';

	const title = 'CROSSWORDLE';
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
