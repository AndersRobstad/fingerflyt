<script module lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	export const panelVariants = tv({
		base: 'rounded-panel border border-line bg-surface',
		variants: {
			padding: {
				none: '',
				sm: 'p-4',
				md: 'p-5 sm:p-6',
				lg: 'p-6 sm:p-8'
			},
			elevated: {
				true: 'shadow-[0_10px_30px_-18px_rgba(15,25,35,0.35)]'
			}
		},
		defaultVariants: { padding: 'md' }
	});

	export type PanelVariants = VariantProps<typeof panelVariants>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	let {
		padding = 'md',
		elevated,
		class: className,
		children,
		...rest
	}: PanelVariants & HTMLAttributes<HTMLElement> & { children?: Snippet } = $props();
</script>

<section class={cn(panelVariants({ padding, elevated }), className)} {...rest}>
	{@render children?.()}
</section>
