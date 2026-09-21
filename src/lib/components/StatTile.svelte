<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		label: string;
		accent?: string;
		loading?: boolean;
		children?: Snippet;
	}

	let { value, label, accent, loading = false, children }: Props = $props();
</script>

<div>
	{#if loading}
		<div class="h-[1.7rem] w-12 animate-pulse rounded bg-line/70" aria-hidden="true"></div>
	{:else}
		<b
			class="block font-mono text-[1.7rem] leading-none tabular-nums"
			style={accent ? `color: ${accent}` : undefined}
		>
			{value}
		</b>
	{/if}
	<small class="mt-1.5 block text-sm text-muted">{label}</small>
	{@render children?.()}
</div>
