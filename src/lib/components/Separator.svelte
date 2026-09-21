<script lang="ts">
	import { Separator as SeparatorPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		orientation = 'horizontal',
		class: className
	}: { orientation?: 'horizontal' | 'vertical'; class?: string } = $props();
</script>

<SeparatorPrimitive.Root
	{orientation}
	class={cn(orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', 'bg-line', className)}
/>
