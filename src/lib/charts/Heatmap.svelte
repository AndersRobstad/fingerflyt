<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { mainLabel } from '../layouts/key-label';
	import type { KeyDef, KeyboardLayout } from '../layouts/types';
	import type { CharSummary } from '../stats/aggregate';

	interface Props {
		layout: KeyboardLayout;
		keyStats: Record<string, CharSummary>;
		metric: 'miss' | 'latency';
	}

	let { layout, keyStats, metric }: Props = $props();

	const maxLatency = $derived(Math.max(1, ...Object.values(keyStats).map((s) => s.avgLatencyMs)));

	const scale = $derived(
		metric === 'miss' ? scaleLinear([0, 1], [0, 1]) : scaleLinear([0, maxLatency], [0, 1])
	);

	function intensity(key: KeyDef): number {
		if (key.kind !== 'char' && key.kind !== 'space') return 0;
		const stat = keyStats[key.id];
		if (!stat || stat.attempts === 0) return -1; // no data yet
		const value = metric === 'miss' ? stat.missRate : stat.avgLatencyMs;
		return Math.max(0, Math.min(1, scale(value)));
	}

	function tooltip(key: KeyDef): string {
		const stat = keyStats[key.id];
		if (!stat || stat.attempts === 0) return `${key.id}: ingen data`;
		const pct = Math.round(stat.missRate * 100);
		return `${mainLabel(key) || key.id}: ${stat.attempts} tastetrykk, ${pct}% bom, ${Math.round(stat.avgLatencyMs)} ms`;
	}
</script>

<div class="mx-auto flex max-w-[920px] flex-col gap-[6px]">
	{#each layout.rows as row, ri (ri)}
		<div class="flex gap-[6px]">
			{#each row as key (key.id)}
				{@const value = intensity(key)}
				<div
					class="key"
					class:muted={key.kind === 'modifier' || key.kind === 'dead'}
					class:empty={value < 0}
					style={`flex:${key.width} 1 0; --p:${Math.max(0, value)};`}
					title={tooltip(key)}
				>
					{mainLabel(key)}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.key {
		position: relative;
		min-width: 0;
		height: 2.6rem;
		display: grid;
		place-items: center;
		border-radius: var(--radius-key);
		border: 1.5px solid var(--color-line);
		background: color-mix(in srgb, var(--color-err) calc(var(--p) * 85%), var(--color-key));
		color: var(--color-ink);
		font-family: var(--font-mono);
		font-size: 0.82rem;
	}
	.key.empty {
		background: var(--color-key);
		opacity: 0.5;
	}
	.key.muted {
		background: transparent;
		border-color: transparent;
		color: var(--color-muted);
		font-size: 0.6rem;
	}
	@media (max-width: 720px) {
		.key {
			height: 2rem;
			font-size: 0.68rem;
		}
	}
</style>
