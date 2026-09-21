<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		checked = $bindable(false),
		id,
		disabled = false,
		class: className,
		'aria-label': ariaLabel
	}: {
		checked?: boolean;
		id?: string;
		disabled?: boolean;
		class?: string;
		'aria-label'?: string;
	} = $props();
</script>

<SwitchPrimitive.Root
	bind:checked
	{id}
	{disabled}
	aria-label={ariaLabel}
	class={cn(
		'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-line bg-paper transition-colors',
		'data-[state=checked]:border-ink data-[state=checked]:bg-ink',
		'disabled:cursor-not-allowed disabled:opacity-40',
		className
	)}
>
	<SwitchPrimitive.Thumb
		class={cn(
			'pointer-events-none block size-4.5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform',
			'data-[state=checked]:translate-x-[1.15rem] data-[state=checked]:bg-paper'
		)}
	/>
</SwitchPrimitive.Root>
