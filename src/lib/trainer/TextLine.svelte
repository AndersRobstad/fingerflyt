<script lang="ts">
	import type { CharPlan } from '../layouts/types';
	import { fingerColorVar } from '../fingers';

	let {
		text,
		pos,
		badNow,
		plan
	}: { text: string; pos: number; badNow: boolean; plan: CharPlan | null } = $props();
</script>

<div
	class="min-h-[3.4em] font-mono text-[clamp(1.15rem,3vw,1.75rem)] leading-[1.7] break-words whitespace-pre-wrap"
>
	{#each [...text] as ch, i (i)}
		{#if i < pos}
			<span class="text-muted/60">{ch}</span>
		{:else if i === pos}
			<span
				class="rounded"
				style={plan
					? `--f:${fingerColorVar(plan.finger)}; background-color:color-mix(in srgb, var(--f) ${badNow ? '30%' : '26%'}, transparent); box-shadow:inset 0 -3px 0 ${badNow ? 'var(--color-err)' : 'var(--f)'};`
					: ''}>{ch === ' ' ? ' ' : ch}</span
			>
		{:else}
			<span>{ch}</span>
		{/if}
	{/each}
</div>
