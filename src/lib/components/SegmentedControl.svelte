<script lang="ts">
	import { ToggleGroup } from 'bits-ui';
	import { cn } from '../utils/cn';

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
