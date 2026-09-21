<script lang="ts">
	import StatTile from '../components/StatTile.svelte';
	import { progressStore } from '../storage/store.svelte';

	const last = $derived(progressStore.lastSession);
</script>

<div
	class="mb-6 grid grid-cols-2 gap-5 rounded-panel border-[1.5px] border-line bg-surface px-5 py-4 sm:grid-cols-4"
>
	<StatTile value={String(progressStore.todayKeystrokes)} label="Tastetrykk i dag" />
	<StatTile value={last ? String(last.wpm) : '–'} label="Siste økt: WPM" />
	<StatTile value={last ? `${last.accuracy}%` : '–'} label="Siste økt: nøyaktighet" />
	<StatTile value={String(progressStore.streak.current)} label="Dager på rad" />
</div>
