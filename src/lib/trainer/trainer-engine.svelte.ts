import { browser } from '$app/environment';
import type { CharPlan } from '../layouts/types';
import { planChar } from '../engine/plan';
import { buildHint, type Hint } from '../engine/hint';
import { pickLine } from '../content/practice-line';
import type { PracticeMode } from '../types';
import { progressStore } from '../storage/store.svelte';

const LINE_ADVANCE_DELAY_MS = 260;

/**
 * Drives one practice line: current text, cursor position, the "wrong key"
 * flash state, and the keydown handling rules from the spec (ignore
 * metaKey, ignore ctrl-without-alt so AltGr keeps working, ignore Dead and
 * multi-char keys, preventDefault on everything handled).
 */
export class TrainerEngine {
	text = $state('');
	pos = $state(0);
	badNow = $state(false);
	/** Key id of whatever was just physically pressed, correct or not — a
	 * brief tactile "key pressed" flash on the on-screen keyboard. */
	pressedKeyId = $state<string | null>(null);
	/** Key id to flash red: the key that was actually (wrongly) pressed, not
	 * necessarily the target key. */
	wrongKeyId = $state<string | null>(null);
	private lastLine: string | null = null;
	private advanceTimer: ReturnType<typeof setTimeout> | null = null;
	private pressedTimer: ReturnType<typeof setTimeout> | null = null;
	private wrongTimer: ReturnType<typeof setTimeout> | null = null;

	get currentChar(): string | undefined {
		return this.text[this.pos];
	}

	get plan(): CharPlan | null {
		const char = this.currentChar;
		if (char === undefined) return null;
		return planChar(char, progressStore.layoutIndex);
	}

	get hint(): Hint | null {
		const plan = this.plan;
		if (!plan) return null;
		return buildHint(progressStore.layoutIndex, plan);
	}

	loadNextLine(): void {
		if (this.advanceTimer) {
			clearTimeout(this.advanceTimer);
			this.advanceTimer = null;
		}
		this.text = pickLine(progressStore.currentMode, this.lastLine, {
			chars: progressStore.data.chars,
			sessions: progressStore.data.sessions,
			layoutIndex: progressStore.layoutIndex
		});
		this.lastLine = this.text;
		this.pos = 0;
		this.badNow = false;
	}

	switchMode(mode: PracticeMode): void {
		if (mode === 'svake' && !progressStore.adaptiveModeUnlocked) return;
		if (progressStore.currentMode === mode) return;
		progressStore.switchMode(mode);
		this.lastLine = null;
		this.loadNextLine();
	}

	handleKeydown = (event: KeyboardEvent): void => {
		if (event.metaKey) return;
		if (event.ctrlKey && !event.altKey) return; // AltGr reports as Ctrl+Alt on Windows
		if (event.key === 'Dead') {
			event.preventDefault();
			return;
		}
		if (!event.key || event.key.length !== 1) return;

		// Defensive self-heal: there should always be a line loaded once the
		// engine has started, but typing must never go permanently inert if
		// that invariant is ever violated (e.g. by a bug elsewhere) — load a
		// fresh line rather than silently dropping every future keystroke.
		if (this.text.length === 0) this.loadNextLine();
		if (this.pos >= this.text.length) return;

		event.preventDefault();

		const target = this.text[this.pos];
		const correct = event.key === target;
		progressStore.recordKeystroke(target, correct);

		const pressedKeyId = this.keyIdForChar(event.key);
		if (pressedKeyId) {
			this.pressedKeyId = pressedKeyId;
			if (this.pressedTimer) clearTimeout(this.pressedTimer);
			this.pressedTimer = setTimeout(() => (this.pressedKeyId = null), 120);
			if (!correct) {
				this.wrongKeyId = pressedKeyId;
				if (this.wrongTimer) clearTimeout(this.wrongTimer);
				this.wrongTimer = setTimeout(() => (this.wrongKeyId = null), 320);
			}
		}

		if (correct) {
			this.pos += 1;
			this.badNow = false;
			if (this.pos >= this.text.length) {
				this.advanceTimer = setTimeout(() => this.loadNextLine(), LINE_ADVANCE_DELAY_MS);
			}
			return;
		}

		this.badNow = true;
		if (!progressStore.data.settings.strictMode) {
			this.pos += 1;
			if (this.pos >= this.text.length) {
				this.advanceTimer = setTimeout(() => this.loadNextLine(), LINE_ADVANCE_DELAY_MS);
			}
		}
	};

	private keyIdForChar(char: string): string | null {
		if (char === ' ') return 'space';
		return progressStore.layoutIndex.charMap.get(char)?.keyId ?? null;
	}

	/** Attaches the global keydown listener. Call from a component `$effect`
	 * and let the returned cleanup run on teardown. */
	attach(): () => void {
		if (!browser) return () => {};
		window.addEventListener('keydown', this.handleKeydown);
		return () => window.removeEventListener('keydown', this.handleKeydown);
	}
}
