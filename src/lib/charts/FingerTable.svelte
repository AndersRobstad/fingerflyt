<script lang="ts">
	import { fingerColorVar, fingerLabel } from '../fingers';
	import type { FingerStats } from '../stats/aggregate';
	import type { FingerId } from '../types';

	interface Props {
		stats: FingerStats;
	}

	let { stats }: Props = $props();

	const ROWS: { id: FingerId; label: string }[] = [
		{ id: 'L5', label: fingerLabel('L5') },
		{ id: 'L4', label: fingerLabel('L4') },
		{ id: 'L3', label: fingerLabel('L3') },
		{ id: 'L2', label: fingerLabel('L2') },
		{ id: 'L1', label: fingerLabel('L1') },
		{ id: 'R1', label: fingerLabel('R1') },
		{ id: 'R2', label: fingerLabel('R2') },
		{ id: 'R3', label: fingerLabel('R3') },
		{ id: 'R4', label: fingerLabel('R4') },
		{ id: 'R5', label: fingerLabel('R5') },
		{ id: 'T', label: 'Mellomrom (begge tomler)' }
	];
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-[440px] border-collapse text-left text-sm">
		<thead>
			<tr class="border-b-[1.5px] border-line text-muted">
				<th class="py-2 pr-3 font-medium">Finger</th>
				<th class="py-2 pr-3 font-medium">Tastetrykk</th>
				<th class="py-2 pr-3 font-medium">Bomrate</th>
				<th class="py-2 font-medium">Snittlatens</th>
			</tr>
		</thead>
		<tbody>
			{#each ROWS as row (row.id)}
				{@const s = stats[row.id]}
				<tr class="border-b border-line/60">
					<td class="py-2 pr-3">
						<span class="inline-flex items-center gap-2">
							<span class="size-2.5 rounded-full" style={`background:${fingerColorVar(row.id)}`}
							></span>
							{row.label}
						</span>
					</td>
					<td class="py-2 pr-3 font-mono tabular-nums">{s.attempts}</td>
					<td class="py-2 pr-3 font-mono tabular-nums"
						>{s.attempts ? `${Math.round(s.missRate * 100)}%` : '–'}</td
					>
					<td class="py-2 font-mono tabular-nums"
						>{s.attempts ? `${Math.round(s.avgLatencyMs)} ms` : '–'}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
