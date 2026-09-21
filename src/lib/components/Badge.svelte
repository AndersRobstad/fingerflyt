<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '../utils/cn';

	let {
		accent,
		class: className,
		children
	}: { accent?: string; class?: string; children?: Snippet } = $props();
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink',
		className
	)}
>
	{#if accent}
		<span class="size-2 rounded-full" style={`background:${accent}`}></span>
	{/if}
	{@render children?.()}
</span>
