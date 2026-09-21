<script lang="ts">
	import { Badge, StatTile } from '../components';
	import { planChar } from '../engine/plan';
	import { fingerColorVar } from '../fingers';
	import { progressStore } from '../storage/store.svelte';
</script>

<div class="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
	<StatTile value={String(progressStore.liveWpm)} label="Ord per minutt" />
	<StatTile value={`${progressStore.liveAccuracy}%`} label="Nøyaktighet" />
	<StatTile value={String(progressStore.liveKeystrokes)} label="Tastetrykk denne økten" />
	<div class="col-span-2 sm:col-span-1">
		<div class="mb-2 text-sm text-muted">Taster du bommer mest på</div>
		<div class="flex flex-wrap gap-1.5">
			{#if progressStore.liveTopMisses.length === 0}
				<span class="text-sm text-muted">Ingen bom ennå.</span>
			{:else}
				{#each progressStore.liveTopMisses as miss (miss.char)}
					{@const plan = planChar(miss.char, progressStore.layoutIndex)}
					<Badge accent={plan ? fingerColorVar(plan.finger) : undefined}>
						{miss.char === ' ' ? '␣' : miss.char} · {miss.count}×
					</Badge>
				{/each}
			{/if}
		</div>
	</div>
</div>
