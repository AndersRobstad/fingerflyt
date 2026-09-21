<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { highlightFingers } from '$lib/fingers';
	import { progressStore } from '$lib/storage/store.svelte';
	import type { PracticeMode } from '$lib/types';
	import FocusOverlay from '$lib/trainer/FocusOverlay.svelte';
	import Hands from '$lib/trainer/Hands.svelte';
	import Hint from '$lib/trainer/Hint.svelte';
	import HomeSummary from '$lib/trainer/HomeSummary.svelte';
	import Keyboard from '$lib/trainer/Keyboard.svelte';
	import StatsRow from '$lib/trainer/StatsRow.svelte';
	import TextLine from '$lib/trainer/TextLine.svelte';
	import TouchNotice from '$lib/trainer/TouchNotice.svelte';
	import { TrainerEngine } from '$lib/trainer/trainer-engine.svelte';

	const engine = new TrainerEngine();

	onMount(() => {
		engine.loadNextLine();
		return engine.attach();
	});

	// Switching keyboard layout also switches practice-content language, so
	// the in-progress line (possibly containing characters the new layout
	// can't produce) must be replaced rather than left stranded. This must
	// only fire on a genuine layout change, not merely whenever
	// `progressStore.data` is reassigned for some unrelated reason (loading
	// persisted settings on mount, toggling any other setting, ...) — that
	// would race with the onMount load above and briefly render two lines in
	// quick succession. Comparing against the previous value (rather than a
	// "have we mounted yet" boolean) survives every reassignment safely.
	let previousLayout: string | undefined;
	$effect(() => {
		const layout = progressStore.data.settings.layout;
		if (previousLayout !== undefined && previousLayout !== layout) engine.loadNextLine();
		previousLayout = layout;
	});

	const targetKeyId = $derived(engine.plan?.keyId ?? null);
	const holdKeyId = $derived(engine.plan?.holdKeyId ?? null);
	const activeFingers = $derived(engine.plan ? highlightFingers(engine.plan.finger) : []);
	const holdFingers = $derived(engine.plan?.holdFinger ? [engine.plan.holdFinger] : []);

	const MODES = $derived([
		{ value: 'tekst', label: 'Tekst' },
		{ value: 'kode', label: 'Kode' },
		{
			value: 'svake',
			label: 'Svake taster',
			disabled: !progressStore.adaptiveModeUnlocked
		}
	]);
</script>

<svelte:head>
	<title>Trening – Fingerflyt</title>
</svelte:head>

<TouchNotice />

<HomeSummary />

<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
	<div>
		<h1 class="text-2xl font-bold tracking-tight text-ink">Trening</h1>
		<p class="mt-1 text-muted">Skriv teksten under. Fingeren som lyser opp er den du skal bruke.</p>
	</div>
	<div>
		<SegmentedControl
			options={MODES}
			ariaLabel="Øvingsmodus"
			bind:value={() => progressStore.currentMode, (v) => engine.switchMode(v as PracticeMode)}
		/>
		{#if !progressStore.adaptiveModeUnlocked}
			<p class="mt-2 max-w-[26rem] text-right text-sm text-muted">
				Svake taster låses opp etter 300 tastetrykk ({progressStore.keystrokesUntilAdaptive} igjen). Den
				øver på ordene som treffer nøyaktig de tastene du bommer mest på eller er tregest på.
			</p>
		{/if}
	</div>
</div>

<Panel class="relative" padding="lg" elevated>
	<TextLine text={engine.text} pos={engine.pos} badNow={engine.badNow} plan={engine.plan} />
	<Hint plan={engine.plan} hint={engine.hint} />
	<FocusOverlay />
</Panel>

{#if progressStore.data.settings.showKeyboard || progressStore.data.settings.showHands}
	<Panel class="mt-5" padding="lg">
		{#if progressStore.data.settings.showKeyboard}
			<Keyboard
				layout={progressStore.layoutIndex.layout}
				{targetKeyId}
				{holdKeyId}
				wrongKeyId={engine.wrongKeyId}
				pressedKeyId={engine.pressedKeyId}
			/>
		{/if}
		{#if progressStore.data.settings.showHands}
			<div class={progressStore.data.settings.showKeyboard ? 'mt-6' : ''}>
				<Hands active={activeFingers} hold={holdFingers} />
			</div>
		{/if}
	</Panel>
{/if}

<div class="mt-5 px-1">
	<StatsRow />
</div>

<div class="mt-4 flex justify-end">
	<Button
		variant="secondary"
		onclick={(e) => {
			engine.loadNextLine();
			e.currentTarget.blur();
		}}
	>
		Ny tekst
	</Button>
</div>
