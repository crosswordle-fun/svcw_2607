<script lang="ts">
	import TutorialView from '$lib/components/tutorial-view.svelte';

	let { data }: { data: { step: number } } = $props();
</script>

<TutorialView step={data.step - 1} />
