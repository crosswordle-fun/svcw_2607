<script lang="ts">
	let {
		letter = '',
		size = 'size-12',
		fontSize = 'text-base'
	}: { letter?: string; size?: string; fontSize?: string } = $props();
</script>

<div
	class={`${size} ${fontSize} grid place-items-center border-2 border-black`}
	aria-label={letter}
	role="img"
>
	{letter}
</div>
