<script lang="ts">
	import Dialog from '../components/Dialog.svelte';
	import SegmentedControl from '../components/SegmentedControl.svelte';
	import SettingRow from '../components/SettingRow.svelte';
	import Switch from '../components/Switch.svelte';
	import { layoutLanguage, layoutPlatform, resolveLayoutId } from '../layouts';
	import { progressStore } from '../storage/store.svelte';
	import type { Settings } from '../storage/types';
	import type { Language } from '../types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const THEME_OPTIONS = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Lys' },
		{ value: 'dark', label: 'Mørk' }
	];

	const LANGUAGE_OPTIONS = [
		{ value: 'nb', label: 'Norsk' },
		{ value: 'en', label: 'US' }
	];
</script>

<Dialog
	bind:open
	title="Innstillinger"
	description="Endringene lagres automatisk på denne enheten."
>
	<div class="divide-y divide-line">
		<SettingRow label="Vis tastatur" description="Tastaturet under skrivefeltet.">
			<Switch
				bind:checked={
					() => progressStore.data.settings.showKeyboard,
					(v) => progressStore.updateSettings({ showKeyboard: v })
				}
				aria-label="Vis tastatur"
			/>
		</SettingRow>
		<SettingRow
			label="Vis hender"
			description="De to hendene som viser hvilken finger som skal brukes."
		>
			<Switch
				bind:checked={
					() => progressStore.data.settings.showHands,
					(v) => progressStore.updateSettings({ showHands: v })
				}
				aria-label="Vis hender"
			/>
		</SettingRow>
		<SettingRow label="Streng modus" description="Du må rette feil tegn før linjen går videre.">
			<Switch
				bind:checked={
					() => progressStore.data.settings.strictMode,
					(v) => progressStore.updateSettings({ strictMode: v })
				}
				aria-label="Streng modus"
			/>
		</SettingRow>
		<div class="py-3.5">
			<p class="text-[0.95rem] text-ink">Tastaturlayout</p>
			<p class="mt-1 mb-3 text-sm leading-snug text-muted">
				Bytter også språket i tekst- og ordøvelsene.
			</p>
			<SegmentedControl
				options={LANGUAGE_OPTIONS}
				ariaLabel="Språk"
				bind:value={
					() => layoutLanguage(progressStore.data.settings.layout),
					(v) =>
						progressStore.updateSettings({
							layout: resolveLayoutId(
								v as Language,
								layoutPlatform(progressStore.data.settings.layout)
							)
						})
				}
			/>
		</div>
		<SettingRow
			label="Mac-tastatur"
			description="Bytter Ctrl/Alt/Win-tastene til Control/Option/Cmd."
		>
			<Switch
				bind:checked={
					() => layoutPlatform(progressStore.data.settings.layout) === 'mac',
					(v) =>
						progressStore.updateSettings({
							layout: resolveLayoutId(
								layoutLanguage(progressStore.data.settings.layout),
								v ? 'mac' : 'pc'
							)
						})
				}
				aria-label="Mac-tastatur"
			/>
		</SettingRow>
		<div class="py-3.5">
			<p class="text-[0.95rem] text-ink">Fargetema</p>
			<p class="mt-1 mb-3 text-sm leading-snug text-muted">
				"System" følger enhetens innstilling automatisk.
			</p>
			<SegmentedControl
				options={THEME_OPTIONS}
				ariaLabel="Fargetema"
				bind:value={
					() => progressStore.data.settings.theme,
					(v) => progressStore.updateSettings({ theme: v as Settings['theme'] })
				}
			/>
		</div>
	</div>
</Dialog>
