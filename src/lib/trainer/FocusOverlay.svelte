<script lang="ts">
	import { progressStore } from '../storage/store.svelte';
</script>

{#if !progressStore.windowFocused}
	<button
		type="button"
		class="absolute inset-0 z-10 grid place-items-center rounded-panel bg-surface/90 p-6 text-center text-lg font-semibold text-ink backdrop-blur-[2px]"
		onclick={() => window.focus()}
	>
		Klikk her for å fortsette å skrive
	</button>
{/if}
