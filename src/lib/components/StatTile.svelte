<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		label: string;
		accent?: string;
		children?: Snippet;
	}

	let { value, label, accent, children }: Props = $props();
</script>

<div>
	<b
		class="block font-mono text-[1.7rem] leading-none tabular-nums"
		style={accent ? `color: ${accent}` : undefined}
	>
		{value}
	</b>
	<small class="mt-1.5 block text-sm text-muted">{label}</small>
	{@render children?.()}
</div>
