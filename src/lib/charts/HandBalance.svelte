<script lang="ts">
	let {
		leftPct,
		rightPct,
		totalAttempts
	}: { leftPct: number; rightPct: number; totalAttempts: number } = $props();
</script>

<div>
	{#if totalAttempts === 0}
		<p class="text-sm text-muted">Ingen data ennå.</p>
	{:else}
		<div class="relative h-3 overflow-hidden rounded-full bg-line/60">
			<div
				class="absolute inset-y-0 left-0 bg-muted transition-[width] duration-300"
				style={`width:${leftPct}%`}
			></div>
			<div
				class="absolute inset-y-0 right-0 bg-finger-index transition-[width] duration-300"
				style={`width:${rightPct}%`}
			></div>
			<div class="absolute inset-y-0 left-1/2 w-px bg-surface" aria-hidden="true"></div>
		</div>
		<div class="mt-2 flex justify-between text-sm">
			<span class="text-ink">Venstre hånd — {Math.round(leftPct)}%</span>
			<span class="font-medium text-finger-index">Høyre hånd — {Math.round(rightPct)}%</span>
		</div>
	{/if}
</div>
