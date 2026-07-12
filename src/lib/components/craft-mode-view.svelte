<script lang="ts">
	const dieFaces = [true, false, true, false, true, false, true, false, true];
</script>

<div class="pointer-events-none fixed inset-0 grid place-items-center">
	<div class="grid grid-cols-3 gap-2" aria-label="Craft grid">
		{#each dieFaces as hasSquare, position (position)}
			<div class="size-24" aria-hidden="true">
				{#if hasSquare}
					<div class="size-24 border-2 border-black bg-white"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
