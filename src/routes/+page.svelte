<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import TiledTitle from '$lib/components/tiled-title.svelte';

	let loginLink: HTMLAnchorElement;
	let signupLink: HTMLAnchorElement;
	let controlsLink: HTMLAnchorElement;

	onMount(() => {
		loginLink.focus();

		function handleKeydown(event: KeyboardEvent) {
			if (
				event.key !== 'ArrowDown' &&
				event.key !== 'ArrowUp' &&
				event.key !== 'ArrowLeft' &&
				event.key !== 'ArrowRight'
			)
				return;
			event.preventDefault();
			const current = document.activeElement;
			if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
				if (current === loginLink) signupLink.focus();
				else if (current === signupLink) controlsLink.focus();
				else loginLink.focus();
			} else {
				if (current === controlsLink) signupLink.focus();
				else if (current === signupLink) loginLink.focus();
				else loginLink.focus();
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<main class="flex min-h-screen items-center justify-center p-6">
	<div class="flex w-full max-w-xs flex-col items-center gap-8">
		<TiledTitle title="CROSSWORDLE" />
		<nav class="flex w-full flex-col gap-3" aria-label="Account actions">
			<a
				bind:this={loginLink}
				href={resolve('/login')}
				class="border-2 border-black bg-white px-6 py-3 text-center text-xl text-black uppercase outline-none focus:bg-black focus:text-white hover:bg-black hover:text-white"
			>
				LOG IN
			</a>
			<a
				bind:this={signupLink}
				href={resolve('/signup')}
				class="border-2 border-black bg-white px-6 py-3 text-center text-xl text-black uppercase outline-none focus:bg-black focus:text-white hover:bg-black hover:text-white"
			>
				SIGN UP
			</a>
			<a
				bind:this={controlsLink}
				href={resolve('/tutorial/controls/1')}
				class="border-2 border-black bg-white px-6 py-3 text-center text-xl text-black uppercase outline-none focus:bg-black focus:text-white hover:bg-black hover:text-white"
			>
				TUTORIAL
			</a>
		</nav>
	</div>
</main>
