<script lang="ts">
	import LeaderboardDisplay from '$lib/components/leaderboard-display.svelte';
	import { leaderboardState } from '$lib/gameState.svelte';
</script>

<LeaderboardDisplay
	title="XP Leaderboard"
	valueLabel="XP"
	entries={leaderboardState.xp}
	loading={leaderboardState.loading}
	error={leaderboardState.error}
/>
