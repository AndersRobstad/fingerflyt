import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { progressStore } from '../storage/store.svelte';
import { TrainerEngine } from './trainer-engine.svelte';

/** Dispatches a real keydown event at `window`, exactly like a physical
 * keystroke would — this is what `TrainerEngine.attach()` listens for. */
function pressKey(key: string): void {
	window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
	flushSync();
}

/** Types a whole line correctly, letting the 260ms auto-advance delay run
 * (via fake timers) whenever a line completes, so typing continues
 * seamlessly across a natural line transition — exactly what a user
 * finishing a sentence and starting the next one does. */
function typeLine(engine: TrainerEngine): void {
	while (engine.pos < engine.text.length) {
		pressKey(engine.text[engine.pos]);
	}
	vi.advanceTimersByTime(300);
	flushSync();
}

beforeEach(async () => {
	vi.useFakeTimers();
	localStorage.clear();
	await progressStore.resetAll();
	progressStore.updateSettings({ layout: 'no-pc', strictMode: true });
	flushSync();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('TrainerEngine keyboard handling', () => {
	it('registers a correct keystroke and advances the cursor', () => {
		const engine = new TrainerEngine();
		const detach = engine.attach();
		engine.loadNextLine();
		flushSync();

		const target = engine.text[0];
		const posBefore = engine.pos;
		pressKey(target);

		expect(engine.pos).toBe(posBefore + 1);
		detach();
	});

	it('keeps registering keystrokes across several full lines — never goes permanently inert', () => {
		const engine = new TrainerEngine();
		const detach = engine.attach();
		engine.loadNextLine();
		flushSync();

		const linesSeen = new Set<string>();
		for (let i = 0; i < 5; i++) {
			linesSeen.add(engine.text);
			typeLine(engine);
		}

		// Five real lines' worth of correct keystrokes, each one landing and
		// advancing the cursor, proves the listener never stops responding.
		expect(linesSeen.size).toBe(5);
		detach();
	});

	it('keeps responding to keystrokes after progressStore.data is reassigned mid-session (the exact shape of the corruption/freeze bug)', () => {
		const engine = new TrainerEngine();
		const detach = engine.attach();
		engine.loadNextLine();
		flushSync();

		// Type a couple of characters first.
		pressKey(engine.text[0]);
		pressKey(engine.text[1]);
		expect(engine.pos).toBe(2);

		// Simulate progressStore.init() resolving moments after mount and
		// reassigning the whole `data` object wholesale (this is exactly
		// what happens on every real page load, once persisted settings
		// finish loading from localStorage).
		progressStore.data = { ...progressStore.data, settings: { ...progressStore.data.settings } };
		flushSync();

		// Typing must still work after that reassignment.
		const posBefore = engine.pos;
		pressKey(engine.text[engine.pos]);
		expect(engine.pos).toBe(posBefore + 1);

		detach();
	});

	it('self-heals if the practice line is ever empty when a keystroke arrives', () => {
		const engine = new TrainerEngine();
		const detach = engine.attach();
		// Deliberately do NOT call loadNextLine() — engine.text starts as ''.
		expect(engine.text).toBe('');

		pressKey('a');

		// The keystroke should have triggered a self-heal (a fresh line
		// loaded) rather than being silently dropped forever.
		expect(engine.text.length).toBeGreaterThan(0);
		detach();
	});

	it('strict mode blocks advancing past a wrong character until it is corrected', () => {
		const engine = new TrainerEngine();
		const detach = engine.attach();
		engine.loadNextLine();
		flushSync();

		const target = engine.text[0];
		const wrong = target === 'x' ? 'y' : 'x';

		pressKey(wrong);
		expect(engine.pos).toBe(0);
		expect(engine.badNow).toBe(true);

		pressKey(target);
		expect(engine.pos).toBe(1);

		detach();
	});

	it('typing keeps working after switching keyboard layout mid-session', () => {
		const engine = new TrainerEngine();
		const detach = engine.attach();
		engine.loadNextLine();
		flushSync();

		pressKey(engine.text[0]);
		expect(engine.pos).toBe(1);

		progressStore.updateSettings({ layout: 'us-qwerty' });
		flushSync();

		// The line itself doesn't auto-reload from inside the store (that's
		// +page.svelte's job via watchChange), but the engine must still
		// accept keystrokes against whatever line is currently showing.
		const posBefore = engine.pos;
		if (engine.pos < engine.text.length) {
			pressKey(engine.text[engine.pos]);
			expect(engine.pos).toBe(posBefore + 1);
		}

		detach();
	});
});
