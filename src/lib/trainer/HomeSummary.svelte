<script lang="ts">
	import StatTile from '../components/StatTile.svelte';
	import { progressStore } from '../storage/store.svelte';

	const last = $derived(progressStore.lastSession);

	// While a session is in progress, show its live numbers instead of the
	// last completed session's — otherwise the header looks frozen while
	// the user is actively typing.
	const active = $derived(progressStore.sessionActive);
	const wpm = $derived(active ? progressStore.liveWpm : last?.wpm);
	const accuracy = $derived(active ? progressStore.liveAccuracy : last?.accuracy);
	const wpmLabel = $derived(active ? 'Denne økten: WPM' : 'Siste økt: WPM');
	const accuracyLabel = $derived(active ? 'Denne økten: nøyaktighet' : 'Siste økt: nøyaktighet');
</script>

<div
	class="mb-6 grid grid-cols-2 gap-5 rounded-panel border-[1.5px] border-line bg-surface px-5 py-4 sm:grid-cols-4"
>
	<StatTile
		value={String(progressStore.todayKeystrokes)}
		label="Tastetrykk i dag"
		loading={!progressStore.loaded}
	/>
	<StatTile
		value={wpm !== undefined ? String(wpm) : '–'}
		label={wpmLabel}
		loading={!progressStore.loaded}
	/>
	<StatTile
		value={accuracy !== undefined ? `${accuracy}%` : '–'}
		label={accuracyLabel}
		loading={!progressStore.loaded}
	/>
	<StatTile
		value={String(progressStore.streak.current)}
		label="Dager på rad"
		loading={!progressStore.loaded}
	/>
</div>
