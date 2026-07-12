<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Crosswordle</title>
	<meta name="description" content="Crosswordle — a crossword-inspired word game." />
</svelte:head>
{@render children()}
