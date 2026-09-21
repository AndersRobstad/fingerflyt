<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '../utils/cn';

	let {
		open = $bindable(false),
		title,
		description,
		children,
		footer,
		class: className
	}: {
		open?: boolean;
		title: string;
		description?: string;
		children?: Snippet;
		footer?: Snippet;
		class?: string;
	} = $props();
</script>

<DialogPrimitive.Root bind:open>
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay
			class="fixed inset-0 z-40 bg-ink/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 data-[state=open]:opacity-100"
		/>
		<DialogPrimitive.Content
			class={cn(
				'fixed top-1/2 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-[45%] rounded-panel border border-line bg-surface p-6 opacity-0 shadow-xl transition-all duration-150 outline-none data-[state=open]:-translate-y-1/2 data-[state=open]:opacity-100',
				className
			)}
		>
			<DialogPrimitive.Title class="text-lg font-bold text-ink">{title}</DialogPrimitive.Title>
			{#if description}
				<DialogPrimitive.Description class="mt-1.5 text-sm text-muted">
					{description}
				</DialogPrimitive.Description>
			{/if}
			{#if children}
				<div class="mt-4">{@render children()}</div>
			{/if}
			{#if footer}
				<div class="mt-6 flex justify-end gap-2">{@render footer()}</div>
			{/if}
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>
