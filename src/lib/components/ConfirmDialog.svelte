<script lang="ts">
	import { AlertDialog } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		title: string;
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		danger?: boolean;
		onConfirm: () => void;
		children?: Snippet;
	}

	let {
		open,
		onOpenChange,
		title,
		description,
		confirmLabel = 'Bekreft',
		cancelLabel = 'Avbryt',
		danger = false,
		onConfirm,
		children
	}: Props = $props();
</script>

<AlertDialog.Root {open} {onOpenChange}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay
			class="data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
		/>
		<AlertDialog.Content
			class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-panel border-[1.5px] border-line bg-surface p-6 shadow-xl outline-none"
		>
			<AlertDialog.Title class="text-lg font-semibold text-ink">{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description class="mt-2 text-sm leading-relaxed text-muted">
					{description}
				</AlertDialog.Description>
			{/if}
			{@render children?.()}
			<div class="mt-6 flex justify-end gap-2.5">
				<AlertDialog.Cancel>
					{#snippet child({ props })}
						<Button {...props} variant="ghost">{cancelLabel}</Button>
					{/snippet}
				</AlertDialog.Cancel>
				<AlertDialog.Action onclick={onConfirm}>
					{#snippet child({ props })}
						<Button {...props} variant={danger ? 'danger' : 'primary'}>{confirmLabel}</Button>
					{/snippet}
				</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
