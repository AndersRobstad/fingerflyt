import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { watchChange } from './watch-change.svelte';

/** Runs `fn` inside a real Svelte effect root so `$effect` (used inside
 * `watchChange`) has somewhere to attach. Returns the root's cleanup
 * function. Call `flushSync()` after any state write to force pending
 * effects to run synchronously before asserting. */
function withRoot(fn: () => void): () => void {
	return $effect.root(fn) as () => void;
}

/** Mirrors the exact shape that matters in the real bug this guards
 * against: a leaf value (`layout`) reached through a parent object
 * (`data`, a Svelte class field — reassignable and reactively tracked as
 * a whole) that gets reassigned wholesale for reasons unrelated to that
 * specific leaf. This is precisely `progressStore.data.settings.layout`:
 * `progressStore.init()` reassigns `data` on every page load (loading
 * persisted state), and `updateSettings()` reassigns `data.settings` on
 * every settings change, regardless of which setting changed. */
class Store {
	data = $state({ settings: { layout: 'no-pc' } });
}

describe('watchChange', () => {
	it('does not fire on the first run', () => {
		const state = $state({ value: 'a' });
		const calls: string[] = [];
		const stop = withRoot(() => {
			watchChange(
				() => state.value,
				(v) => calls.push(v)
			);
		});
		flushSync();
		expect(calls).toEqual([]);
		stop();
	});

	it('fires exactly once on a genuine change', () => {
		const state = $state({ value: 'a' });
		const calls: string[] = [];
		const stop = withRoot(() => {
			watchChange(
				() => state.value,
				(v) => calls.push(v)
			);
		});
		flushSync();

		state.value = 'b';
		flushSync();

		expect(calls).toEqual(['b']);
		stop();
	});

	it('does NOT fire when a re-run is caused by reassigning a parent object without the tracked leaf actually changing', () => {
		const store = new Store();
		const calls: string[] = [];
		const stop = withRoot(() => {
			watchChange(
				() => store.data.settings.layout,
				(v) => calls.push(v)
			);
		});
		flushSync();

		// Simulates progressStore.init() resolving with the same layout as
		// the pre-load default — the whole `data` object is reassigned, but
		// the leaf value this effect cares about hasn't actually changed.
		store.data = { settings: { layout: 'no-pc' } };
		flushSync();

		expect(calls).toEqual([]);
		stop();
	});

	it('fires when a parent-object reassignment also changes the leaf value', () => {
		const store = new Store();
		const calls: string[] = [];
		const stop = withRoot(() => {
			watchChange(
				() => store.data.settings.layout,
				(v) => calls.push(v)
			);
		});
		flushSync();

		// Simulates progressStore.init() resolving with a layout the user
		// had actually persisted, different from the pre-load default.
		store.data = { settings: { layout: 'us-qwerty' } };
		flushSync();

		expect(calls).toEqual(['us-qwerty']);
		stop();
	});

	it('fires once per distinct change across a longer sequence, never duplicating a no-op reassignment', () => {
		const store = new Store();
		const calls: string[] = [];
		const stop = withRoot(() => {
			watchChange(
				() => store.data.settings.layout,
				(v) => calls.push(v)
			);
		});
		flushSync();

		// Reassign with the SAME value repeatedly (simulates unrelated
		// settings changes, e.g. toggling "Vis hender" repeatedly, each of
		// which reassigns the whole `data` object) — none of these should
		// fire onChange.
		for (let i = 0; i < 5; i++) {
			store.data = { settings: { layout: 'no-pc' } };
			flushSync();
		}
		expect(calls).toEqual([]);

		// A genuine change fires exactly once.
		store.data = { settings: { layout: 'us-qwerty' } };
		flushSync();
		expect(calls).toEqual(['us-qwerty']);

		// Switching back is also a genuine change.
		store.data = { settings: { layout: 'no-pc' } };
		flushSync();
		expect(calls).toEqual(['us-qwerty', 'no-pc']);

		stop();
	});
});
