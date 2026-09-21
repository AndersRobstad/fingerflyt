<script lang="ts">
	import DownloadIcon from '@lucide/svelte/icons/download';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import FingerTable from '$lib/charts/FingerTable.svelte';
	import HandBalance from '$lib/charts/HandBalance.svelte';
	import Heatmap from '$lib/charts/Heatmap.svelte';
	import LineChart from '$lib/charts/LineChart.svelte';
	import { Button, ConfirmDialog, Panel, SegmentedControl } from '$lib/components';
	import { progressStore } from '$lib/storage/store.svelte';

	let heatmapMetric = $state<'miss' | 'latency'>('miss');
	let resetOpen = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	let importMessage = $state<{ ok: boolean; text: string } | null>(null);

	const HEATMAP_OPTIONS = [
		{ value: 'miss', label: 'Bomrate' },
		{ value: 'latency', label: 'Responstid' }
	];

	let sortedSessions = $derived(
		[...progressStore.data.sessions].sort((a, b) => a.startedAt - b.startedAt).slice(-40)
	);
	let wpmPoints = $derived(sortedSessions.map((s, i) => ({ x: i, y: s.wpm })));
	let accuracyPoints = $derived(sortedSessions.map((s, i) => ({ x: i, y: s.accuracy })));

	function handleExport() {
		const json = progressStore.exportJson();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `fingerflyt-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function handleImportFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		const text = await file.text();
		const result = progressStore.importJson(text);
		importMessage = result.ok
			? { ok: true, text: 'Data importert.' }
			: { ok: false, text: result.error ?? 'Import feilet.' };
	}

	function handleReset() {
		void progressStore.resetAll();
		resetOpen = false;
	}
</script>

<svelte:head>
	<title>Fremgang – Fingerflyt</title>
</svelte:head>

<div class="mb-6">
	<h1 class="text-2xl font-bold tracking-tight text-ink">Fremgang</h1>
	<p class="mt-1 text-muted">Statistikken oppdateres etter hver økt du fullfører.</p>
</div>

<div class="grid gap-5 sm:grid-cols-2">
	<Panel>
		<h2 class="mb-4 text-sm font-semibold text-muted">Ord per minutt</h2>
		<LineChart
			points={wpmPoints}
			color="var(--finger-ring)"
			formatY={(v) => String(Math.round(v))}
			emptyMessage="Fullfør en økt for å se WPM over tid."
		/>
	</Panel>
	<Panel>
		<h2 class="mb-4 text-sm font-semibold text-muted">Nøyaktighet</h2>
		<LineChart
			points={accuracyPoints}
			color="var(--color-ok)"
			formatY={(v) => `${Math.round(v)}%`}
			emptyMessage="Fullfør en økt for å se nøyaktighet over tid."
		/>
	</Panel>
</div>

<Panel class="mt-5">
	<h2 class="mb-1 text-sm font-semibold text-muted">Håndbalanse</h2>
	<p class="mb-4 text-sm text-muted">Andel tastetrykk fordelt på venstre og høyre hånd.</p>
	<HandBalance
		leftPct={progressStore.handBalance.leftPct}
		rightPct={progressStore.handBalance.rightPct}
		totalAttempts={progressStore.handBalance.totalAttempts}
	/>
</Panel>

<Panel class="mt-5">
	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<h2 class="text-sm font-semibold text-muted">Tastaturheatmap</h2>
		<SegmentedControl
			value={heatmapMetric}
			options={HEATMAP_OPTIONS}
			ariaLabel="Heatmap-mål"
			onValueChange={(v) => (heatmapMetric = v as 'miss' | 'latency')}
		/>
	</div>
	<Heatmap
		layout={progressStore.layoutIndex.layout}
		keyStats={progressStore.keyStats}
		metric={heatmapMetric}
	/>
</Panel>

<Panel class="mt-5">
	<h2 class="mb-4 text-sm font-semibold text-muted">Per finger</h2>
	<FingerTable stats={progressStore.fingerStats} />
</Panel>

<Panel class="mt-5">
	<h2 class="mb-1 text-sm font-semibold text-muted">Dine data</h2>
	<p class="mb-4 text-sm text-muted">Alt lagres kun lokalt i denne nettleseren.</p>
	<div class="flex flex-wrap gap-2.5">
		<Button variant="secondary" onclick={handleExport}>
			<DownloadIcon class="size-4" /> Eksporter
		</Button>
		<Button variant="secondary" onclick={() => fileInput?.click()}>
			<UploadIcon class="size-4" /> Importer
		</Button>
		<Button variant="danger" onclick={() => (resetOpen = true)}>
			<TrashIcon class="size-4" /> Nullstill alt
		</Button>
	</div>
	<input
		bind:this={fileInput}
		type="file"
		accept="application/json"
		class="hidden"
		onchange={handleImportFile}
	/>
	{#if importMessage}
		<p class="mt-3 text-sm" class:text-err={!importMessage.ok} class:text-ok={importMessage.ok}>
			{importMessage.text}
		</p>
	{/if}
</Panel>

<ConfirmDialog
	open={resetOpen}
	onOpenChange={(v) => (resetOpen = v)}
	title="Nullstille alle data?"
	description="Dette sletter all fremgang, alle økter og innstillinger permanent. Dette kan ikke angres."
	confirmLabel="Nullstill"
	danger
	onConfirm={handleReset}
/>
