<script module lang="ts">
	import { tv, type VariantProps } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45',
		variants: {
			variant: {
				primary: 'bg-ink text-paper hover:bg-ink/85',
				secondary: 'border border-line bg-surface text-ink hover:border-muted/70 hover:bg-paper',
				ghost: 'text-muted hover:bg-surface hover:text-ink',
				danger: 'bg-err text-paper hover:bg-err/85'
			},
			size: {
				sm: 'h-8 px-3 text-sm',
				md: 'h-10 px-4 text-[0.95rem]',
				icon: 'h-9 w-9'
			},
			pressed: {
				true: 'bg-ink text-paper border-ink hover:bg-ink'
			}
		},
		defaultVariants: { variant: 'secondary', size: 'md' }
	});

	export type ButtonVariants = VariantProps<typeof buttonVariants>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	let {
		variant = 'secondary',
		size = 'md',
		pressed,
		class: className,
		children,
		...rest
	}: HTMLButtonAttributes & ButtonVariants & { children?: Snippet } = $props();
</script>

<button class={cn(buttonVariants({ variant, size, pressed }), className)} {...rest}>
	{@render children?.()}
</button>
