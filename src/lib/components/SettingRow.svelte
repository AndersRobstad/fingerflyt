<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		description?: string;
		children?: Snippet;
	}

	let { label, description, children }: Props = $props();
</script>

<div class="flex items-center justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
	<div class="min-w-0">
		<p class="text-[0.95rem] leading-tight text-ink">{label}</p>
		{#if description}
			<p class="mt-1 text-sm leading-snug text-muted">{description}</p>
		{/if}
	</div>
	{@render children?.()}
</div>
