<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { area, curveMonotoneX, line } from 'd3-shape';

	export interface ChartPoint {
		x: number;
		y: number;
	}

	interface Props {
		points: ChartPoint[];
		color: string;
		height?: number;
		formatY?: (value: number) => string;
		emptyMessage?: string;
	}

	let { points, color, height = 180, formatY = (v) => String(v), emptyMessage }: Props = $props();

	const WIDTH = 640;
	const PAD_X = 8;
	const PAD_TOP = 16;
	const PAD_BOTTOM = 24;

	const xDomain = $derived.by((): [number, number] => {
		if (points.length === 0) return [0, 1];
		const xs = points.map((p) => p.x);
		const min = Math.min(...xs);
		const max = Math.max(...xs);
		return min === max ? [min - 1, max + 1] : [min, max];
	});

	const yDomain = $derived.by((): [number, number] => {
		if (points.length === 0) return [0, 1];
		const ys = points.map((p) => p.y);
		const min = Math.min(0, ...ys);
		const max = Math.max(...ys);
		const padded = max === min ? max + 1 : max + (max - min) * 0.15;
		return [min, padded];
	});

	const xScale = $derived(
		scaleLinear()
			.domain(xDomain)
			.range([PAD_X, WIDTH - PAD_X])
	);
	const yScale = $derived(
		scaleLinear()
			.domain(yDomain)
			.range([height - PAD_BOTTOM, PAD_TOP])
	);

	const linePath = $derived.by(() => {
		const gen = line<ChartPoint>()
			.x((d) => xScale(d.x))
			.y((d) => yScale(d.y))
			.curve(curveMonotoneX);
		return gen(points) ?? '';
	});

	const areaPath = $derived.by(() => {
		const gen = area<ChartPoint>()
			.x((d) => xScale(d.x))
			.y0(height - PAD_BOTTOM)
			.y1((d) => yScale(d.y))
			.curve(curveMonotoneX);
		return gen(points) ?? '';
	});

	const gridLines = $derived.by(() => {
		const [min, max] = yDomain;
		const mid = (min + max) / 2;
		return [max, mid, min];
	});

	const last = $derived(points.at(-1));
</script>

{#if points.length === 0}
	<div class="grid h-[180px] place-items-center text-sm text-muted">
		{emptyMessage ?? 'Ingen data ennå.'}
	</div>
{:else}
	<svg
		viewBox={`0 0 ${WIDTH} ${height}`}
		class="w-full"
		style={`--c:${color}`}
		role="img"
		aria-label="Diagram"
	>
		{#each gridLines as gy (gy)}
			<line x1={PAD_X} x2={WIDTH - PAD_X} y1={yScale(gy)} y2={yScale(gy)} class="grid-line" />
			<text x={0} y={yScale(gy) - 4} class="axis-label">{formatY(gy)}</text>
		{/each}

		<path d={areaPath} class="area" />
		<path d={linePath} class="line-path" />

		{#if last}
			<circle cx={xScale(last.x)} cy={yScale(last.y)} r="4.5" class="dot" />
		{/if}
	</svg>
{/if}

<style>
	.grid-line {
		stroke: var(--color-line);
		stroke-width: 1;
	}
	.axis-label {
		font-family: var(--font-mono);
		font-size: 10px;
		fill: var(--color-muted);
	}
	.area {
		fill: color-mix(in srgb, var(--c) 16%, transparent);
	}
	.line-path {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 2000;
		stroke-dashoffset: 2000;
		animation: draw 900ms ease-out forwards;
	}
	.dot {
		fill: var(--c);
		stroke: var(--color-surface);
		stroke-width: 2;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.line-path {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
