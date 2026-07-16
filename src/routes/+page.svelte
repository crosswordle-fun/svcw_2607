<script lang="ts">
	import { resolve } from '$app/paths';
	import TiledTitle from '$lib/components/tiled-title.svelte';
</script>

<main class="flex min-h-screen items-center justify-center p-6">
	<div class="flex w-full max-w-xs flex-col items-center gap-8">
		<TiledTitle title="CROSSWORDLE" />
		<div class="flex w-full flex-col gap-3">
			<a
				href={resolve('/login')}
				class="border-2 border-black bg-white px-6 py-3 text-center text-xl text-black uppercase hover:bg-black hover:text-white"
			>
				LOG IN
			</a>
			<a
				href={resolve('/signup')}
				class="border-2 border-black bg-white px-6 py-3 text-center text-xl text-black uppercase hover:bg-black hover:text-white"
			>
				SIGN UP
			</a>
		</div>
	</div>
</main>
