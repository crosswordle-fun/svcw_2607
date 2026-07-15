<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TiledTitle from '$lib/components/tiled-title.svelte';
	import { login, signup } from '$lib/gameApi';

	let username = $state('');
	let password = $state('');
	let mode = $state<'login' | 'signup'>('login');
	let error = $state('');
	let busy = $state(false);

	async function submit() {
		error = '';
		busy = true;
		try {
			if (mode === 'login') await login(username, password);
			else await signup(username, password);
			goto(resolve('/game'));
		} catch (e) {
			error = e instanceof Error && e.message === 'INVALID_LOGIN' ? 'INVALID LOGIN' : 'UNABLE TO AUTHENTICATE';
		} finally { busy = false; }
	}
</script>

<main class="flex min-h-screen items-center justify-center">
	<div class="flex w-80 flex-col items-center gap-6">
		<TiledTitle title="CROSSWORDLE" />
		<form class="flex w-full flex-col gap-3" onsubmit={(event) => { event.preventDefault(); submit(); }}>
			<input bind:value={username} required minlength="2" autocomplete="username" placeholder="USERNAME" class="border-2 border-black bg-white p-3 text-black uppercase outline-none focus:bg-black focus:text-white" />
			<input bind:value={password} required minlength="1" type="password" autocomplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="PASSWORD" class="border-2 border-black bg-white p-3 text-black outline-none focus:bg-black focus:text-white" />
			<button disabled={busy} class="border-2 border-black bg-white px-6 py-3 text-xl text-black uppercase hover:bg-black hover:text-white">{busy ? '...' : mode}</button>
		</form>
		<p class="h-5 text-sm text-red-600">{error}</p>
		<button type="button" class="text-sm uppercase underline" onclick={() => { mode = mode === 'login' ? 'signup' : 'login'; error = ''; }}>
			{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
		</button>
	</div>
</main>
