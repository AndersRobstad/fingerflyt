<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		children: Snippet;
	}

	let { text, children }: Props = $props();
</script>

<TooltipPrimitive.Provider delayDuration={300}>
	<TooltipPrimitive.Root>
		<TooltipPrimitive.Trigger>
			{@render children()}
		</TooltipPrimitive.Trigger>
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				sideOffset={8}
				class="z-50 max-w-64 rounded-lg border-[1.5px] border-line bg-ink px-3 py-1.5 text-sm text-paper shadow-lg"
			>
				{text}
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	</TooltipPrimitive.Root>
</TooltipPrimitive.Provider>
