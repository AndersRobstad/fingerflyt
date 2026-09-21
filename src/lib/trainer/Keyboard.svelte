<script lang="ts">
	import { isLetterKey } from '../engine/char-map';
	import { fingerColorVar } from '../fingers';
	import { mainLabel } from '../layouts/key-label';
	import type { KeyboardLayout } from '../layouts/types';
	import { cn } from '../utils/cn';

	let {
		layout,
		targetKeyId,
		holdKeyId,
		wrongKeyId,
		pressedKeyId
	}: {
		layout: KeyboardLayout;
		targetKeyId: string | null;
		holdKeyId: string | null;
		wrongKeyId: string | null;
		pressedKeyId: string | null;
	} = $props();
</script>

<div
	class="mx-auto flex max-w-[920px] flex-col gap-1.5"
	role="img"
	aria-label="Norsk tastatur (PC)"
>
	{#each layout.rows as row, ri (ri)}
		<div class="flex gap-1.5">
			{#each row as key (key.id)}
				{@const isTarget = key.id === targetKeyId}
				{@const isHold = key.id === holdKeyId}
				{@const isWrong = key.id === wrongKeyId}
				{@const isPressed = key.id === pressedKeyId}
				{@const showShiftCorner = key.kind === 'char' && !isLetterKey(key) && key.shift}
				{@const showAltgrCorner = key.kind === 'char' && key.altgr}
				<div
					class={cn(
						'relative grid h-10 min-w-0 place-items-center rounded-key border text-[0.78rem] font-medium transition-transform duration-100 select-none sm:h-12',
						key.kind !== 'char' && key.kind !== 'space' && 'text-muted',
						isPressed && 'translate-y-px',
						isWrong && 'outline-2 outline-offset-1 outline-err outline-solid'
					)}
					style={`flex:${key.width} 1 0; --f:${fingerColorVar(key.finger)}; ${
						isTarget
							? 'background-color:var(--f); border-color:var(--f); color:#fff; box-shadow:0 2px 0 color-mix(in srgb, var(--f) 55%, black); transform:translateY(-1px);'
							: isHold
								? 'background-color:color-mix(in srgb, var(--f) 45%, var(--color-key)); border-color:var(--f); border-style:dashed;'
								: `background-color:color-mix(in srgb, var(--f) 13%, var(--color-key)); border-color:color-mix(in srgb, var(--f) 30%, var(--color-line));`
					}`}
				>
					{#if showShiftCorner}
						<span
							class="pointer-events-none absolute top-1 left-1.5 text-[0.55rem] opacity-70"
							aria-hidden="true">{key.shift}</span
						>
					{/if}
					{#if showAltgrCorner}
						<span
							class="pointer-events-none absolute right-1.5 bottom-1 text-[0.55rem] opacity-70"
							aria-hidden="true">{key.altgr}</span
						>
					{/if}
					<span class="font-mono">{mainLabel(key)}</span>
				</div>
			{/each}
		</div>
	{/each}
</div>
