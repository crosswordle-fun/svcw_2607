<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TiledTitle from '$lib/components/tiled-title.svelte';
	import { login, signup } from '$lib/gameApi';

	let { mode }: { mode: 'login' | 'signup' } = $props();
	let username = $state('');
	let password = $state('');
	let usernameInput: HTMLInputElement;
	let error = $state('');
	let busy = $state(false);

	async function submit() {
		error = '';
		busy = true;
		try {
			if (mode === 'login') await login(username, password);
			else await signup(username, password);
			await goto(resolve('/game'));
		} catch (e) {
			error =
				e instanceof Error && e.message === 'INVALID_LOGIN'
					? 'INVALID LOGIN'
					: 'UNABLE TO AUTHENTICATE';
		} finally {
			busy = false;
		}
	}

	onMount(() => {
		usernameInput?.focus();

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') goto(resolve('/'));
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<main class="flex min-h-screen items-center justify-center p-6">
	<div class="flex w-full max-w-xs flex-col items-center gap-6">
		<TiledTitle title="CROSSWORDLE" />
		<h1 class="text-2xl uppercase">{mode === 'login' ? 'LOG IN' : 'SIGN UP'}</h1>
		<form
			class="flex w-full flex-col gap-3"
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<input
				bind:this={usernameInput}
				bind:value={username}
				required
				minlength="2"
				autocomplete="username"
				placeholder="USERNAME"
				class="border-2 border-black bg-white p-3 text-black uppercase outline-none focus:bg-black focus:text-white"
			/>
			<input
				bind:value={password}
				required
				minlength="1"
				type="password"
				autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
				placeholder="PASSWORD"
				class="border-2 border-black bg-white p-3 text-black outline-none focus:bg-black focus:text-white"
			/>
			<button
				disabled={busy}
				class="border-2 border-black bg-white px-6 py-3 text-xl text-black uppercase hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-50"
			>
				{busy ? '...' : mode === 'login' ? 'LOG IN' : 'SIGN UP'}
			</button>
		</form>
		<p class="h-5 text-sm text-red-600">{error}</p>
		<a class="text-sm uppercase underline" href={resolve('/')}>BACK TO HOME</a>
	</div>
</main>
