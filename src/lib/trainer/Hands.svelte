<script lang="ts">
	import { FINGER_CLASS_LABEL, FINGER_CLASS_ORDER, fingerColorVar } from '../fingers';
	import type { FingerId } from '../types';
	import { capitalize } from '../utils/text';

	let { active, hold }: { active: FingerId[]; hold: FingerId[] } = $props();

	const SHAPES = [
		{ n: 5, x: 20, y: 50, w: 26, h: 72, rotate: null },
		{ n: 4, x: 50, y: 24, w: 26, h: 98, rotate: null },
		{ n: 3, x: 80, y: 10, w: 26, h: 112, rotate: null },
		{ n: 2, x: 110, y: 28, w: 26, h: 94, rotate: null },
		{ n: 1, x: 134, y: 86, w: 26, h: 66, rotate: 'rotate(50 147 150)' }
	] as const;

	const SIDES = ['L', 'R'] as const;

	function idFor(side: 'L' | 'R', n: number): FingerId {
		return `${side}${n}` as FingerId;
	}

	function fingerStyle(id: FingerId, isActive: boolean, isHold: boolean): string {
		const f = fingerColorVar(id);
		if (isActive) {
			return `fill:${f}; stroke:color-mix(in srgb, ${f} 70%, black); stroke-width:2.5;`;
		}
		if (isHold) {
			return `fill:color-mix(in srgb, ${f} 55%, var(--color-surface)); stroke:${f}; stroke-width:2; stroke-dasharray:5 4;`;
		}
		return `fill:color-mix(in srgb, ${f} 20%, var(--color-surface)); stroke:color-mix(in srgb, ${f} 45%, var(--color-line)); stroke-width:1.5;`;
	}
</script>

<div class="mx-auto max-w-[440px]">
	<svg viewBox="0 0 420 175" class="w-full" aria-hidden="true">
		{#each SIDES as side (side)}
			<g transform={side === 'L' ? 'translate(12,4)' : 'translate(408,4) scale(-1,1)'}>
				{#each SHAPES as s (s.n)}
					{@const fid = idFor(side, s.n)}
					{@const isActive = active.includes(fid)}
					{@const isHold = hold.includes(fid)}
					<rect
						x={s.x}
						y={s.y}
						width={s.w}
						height={s.h}
						rx="13"
						transform={s.rotate}
						class="transition-[fill] duration-100"
						style={fingerStyle(fid, isActive, isHold)}
					/>
				{/each}
				<rect
					x="16"
					y="92"
					width="126"
					height="74"
					rx="28"
					style="fill:color-mix(in srgb, var(--color-ink) 6%, var(--color-surface)); stroke:var(--color-line); stroke-width:1.5;"
				/>
			</g>
		{/each}
	</svg>
	<div class="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-muted">
		{#each FINGER_CLASS_ORDER as cls (cls)}
			<span class="inline-flex items-center gap-1.5">
				<span
					class="size-2.5 rounded-full"
					style={`background:var(--finger-${cls})`}
					aria-hidden="true"
				></span>
				{capitalize(FINGER_CLASS_LABEL[cls])}
			</span>
		{/each}
	</div>
</div>
