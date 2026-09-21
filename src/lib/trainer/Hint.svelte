<script lang="ts">
	import type { Hint } from '../engine/hint';
	import { fingerColorVar } from '../fingers';
	import type { CharPlan } from '../layouts/types';

	let { plan, hint }: { plan: CharPlan | null; hint: Hint | null } = $props();
</script>

<div class="flex items-center gap-4 border-t border-dashed border-line pt-4 sm:gap-5">
	{#if plan && hint}
		{@const f = fingerColorVar(plan.finger)}
		<div
			class="grid size-15 flex-none place-items-center rounded-key border-2 font-mono text-[1.7rem] font-semibold"
			style={`border-color:${f}; background-color:color-mix(in srgb, ${f} 20%, var(--color-key));`}
		>
			{plan.char === ' ' ? '␣' : plan.char}
		</div>
		<div class="min-w-0">
			<div
				class="text-xl font-bold sm:text-[1.4rem]"
				style={`color:color-mix(in srgb, ${f} 68%, var(--color-ink));`}
			>
				{hint.fingerLabel}
			</div>
			<div class="mt-0.5 text-muted">{hint.instruction}</div>
		</div>
	{:else}
		<div class="text-muted">Skriv linjen over for å komme i gang.</div>
	{/if}
</div>
