<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import favicon from '$lib/assets/favicon.svg';
	import { progressStore } from '$lib/storage/store.svelte';
	import SettingsDialog from '$lib/settings/SettingsDialog.svelte';

	let { children } = $props();

	let settingsOpen = $state(false);

	const NAV = [
		{ href: '/', label: 'Trening' },
		{ href: '/fremgang', label: 'Fremgang' },
		{ href: '/om', label: 'Om' }
	] as const;

	onMount(() => {
		void progressStore.init();
	});

	$effect(() => {
		const theme = progressStore.data.settings.theme;
		if (theme === 'system') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = theme;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Fingerflyt – norsk fingersetting</title>
	<meta
		name="description"
		content="Øv på riktig fingersetting på norsk tastatur, med sanntidsveiledning for hver tast."
	/>
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<header class="border-b-[1.5px] border-line">
		<div class="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-5 py-4">
			<a href={resolve('/')} class="text-[1.15rem] leading-none font-bold tracking-tight text-ink">
				Fingerflyt
			</a>
			<nav class="flex items-center gap-1" aria-label="Hovedmeny">
				{#each NAV as item (item.href)}
					<a
						href={resolve(item.href)}
						class="rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
						class:bg-ink={page.url.pathname === item.href}
						class:text-paper={page.url.pathname === item.href}
						class:text-muted={page.url.pathname !== item.href}
						class:hover:text-ink={page.url.pathname !== item.href}
						aria-current={page.url.pathname === item.href ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
				<button
					type="button"
					class="ml-1 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
					aria-label="Innstillinger"
					onclick={() => (settingsOpen = true)}
				>
					<SettingsIcon size={19} />
				</button>
			</nav>
		</div>
	</header>

	<main class="mx-auto w-full max-w-[1000px] flex-1 px-5 py-8">
		{@render children()}
	</main>

	<footer class="border-t-[1.5px] border-line px-5 py-6 text-center text-sm text-muted">
		Fingerflyt lagrer all fremgang lokalt i nettleseren din. Ingen konto, ingen sky.
	</footer>
</div>

<SettingsDialog bind:open={settingsOpen} />
