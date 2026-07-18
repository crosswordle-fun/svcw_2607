<script lang="ts">
	import LeaderboardDisplay from '$lib/components/leaderboard-display.svelte';
	import { leaderboardState } from '$lib/gameState.svelte';
</script>

<LeaderboardDisplay
	title="Coins Leaderboard"
	valueLabel="Coins"
	entries={leaderboardState.coins}
	loading={leaderboardState.loading}
	error={leaderboardState.error}
/>
