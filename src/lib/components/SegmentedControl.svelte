<script lang="ts">
	import { ToggleGroup } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { watchChange } from '../utils/watch-change.svelte';

	export interface SegmentedOption {
		value: string;
		label: string;
		disabled?: boolean;
	}

	let {
		value = $bindable(),
		options,
		ariaLabel,
		onValueChange,
		class: className
	}: {
		value: string;
		options: SegmentedOption[];
		ariaLabel: string;
		onValueChange?: (value: string) => void;
		class?: string;
	} = $props();

	// Once a segment is picked (click OR keyboard), give focus back to the
	// page instead of leaving it on the toggle button — otherwise the next
	// keystrokes (space, in particular) get eaten by this control instead of
	// reaching the typing surface. See watch-change.svelte.ts for why this
	// only fires on a genuine value change.
	watchChange(
		() => value,
		() => {
			if (typeof document !== 'undefined') (document.activeElement as HTMLElement | null)?.blur();
		}
	);
</script>

<ToggleGroup.Root
	type="single"
	bind:value
	{onValueChange}
	aria-label={ariaLabel}
	class={cn(
		'inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1',
		className
	)}
>
	{#each options as option (option.value)}
		<ToggleGroup.Item
			value={option.value}
			disabled={option.disabled}
			class={cn(
				'rounded-full px-3.5 py-1.5 text-sm font-medium text-muted transition-colors',
				'hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted',
				'data-[state=on]:bg-ink data-[state=on]:text-paper data-[state=on]:shadow-sm'
			)}
		>
			{option.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
