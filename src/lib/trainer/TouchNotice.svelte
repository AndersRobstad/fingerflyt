<!--
	Shown only on touch-only devices (no hover, coarse pointer) — a physical
	keyboard is required for this app. Pure CSS media query so it works
	before hydration and never flashes on desktop.
-->
<p
	class="notice mb-4 rounded-panel border-[1.5px] border-line bg-surface px-4 py-3 text-sm text-muted"
>
	Denne øvelsen krever et fysisk tastatur.
</p>

<style>
	.notice {
		display: none;
	}
	@media (hover: none) and (pointer: coarse) {
		.notice {
			display: block;
		}
	}
</style>
