import { browser } from '$app/environment';
import { buildLayoutIndex, type LayoutIndex } from '../engine/char-map';
import { getLayout } from '../layouts';
import {
	calcAccuracy,
	calcWpm,
	computeFingerStats,
	computeHandBalance,
	computeKeyStats,
	computeStreak,
	computeTopMisses,
	keystrokesToday,
	lastSession as pickLastSession,
	recordAttempt
} from '../stats/aggregate';
import { MIN_KEYSTROKES_FOR_ADAPTIVE, totalKeystrokes } from '../stats/weak-keys';
import type { PracticeMode } from '../types';
import { dayKey } from '../utils/date';
import { LocalStorageAdapter } from './local-storage-adapter';
import { migrate } from './migrations';
import {
	DEFAULT_SETTINGS,
	emptyStoreData,
	type ProgressStore,
	type Settings,
	type StoreData
} from './types';

const IDLE_TIMEOUT_MS = 30_000;
const SAVE_DEBOUNCE_MS = 500;
const SESSION_HISTORY_LIMIT = 1000;

export interface ImportResult {
	ok: boolean;
	error?: string;
}

/**
 * Central reactive store: holds persisted progress data plus the
 * in-progress session draft, and derives every stat the UI needs. A single
 * instance is created in {@link progressStore} below.
 */
export class ProgressStoreState {
	data = $state<StoreData>(emptyStoreData());
	loaded = $state(false);
	currentMode = $state<PracticeMode>('tekst');
	windowFocused = $state(true);

	/** Live counters for the session currently in progress (reset on
	 * finalize). Reactive so the trainer UI can show live WPM/accuracy. */
	private sessionStart = $state<number | null>(null);
	private sessionMode = $state<PracticeMode | null>(null);
	private sessionKeystrokes = $state(0);
	private sessionCorrect = $state(0);
	private sessionWrong = $state(0);
	private sessionMisses: Record<string, number> = {};
	private now = $state(Date.now());

	private lastKeystrokeAt: number | null = null;
	private idleTimer: ReturnType<typeof setTimeout> | null = null;
	private tickInterval: ReturnType<typeof setInterval> | null = null;
	private saveTimer: ReturnType<typeof setTimeout> | null = null;
	private adapter: ProgressStore;

	constructor(adapter: ProgressStore) {
		this.adapter = adapter;
	}

	async init(): Promise<void> {
		if (!browser) return;
		this.data = await this.adapter.load();
		this.loaded = true;

		document.addEventListener('visibilitychange', () => {
			this.windowFocused = document.visibilityState === 'visible';
			if (document.hidden) this.endSession();
		});
		window.addEventListener('pagehide', () => {
			this.endSession();
			this.flush();
		});
		window.addEventListener('blur', () => (this.windowFocused = false));
		window.addEventListener('focus', () => (this.windowFocused = true));
	}

	// ---- derived read models -------------------------------------------------

	get layoutIndex(): LayoutIndex {
		return buildLayoutIndex(getLayout(this.data.settings.layout));
	}

	get fingerStats() {
		return computeFingerStats(this.data.chars, this.layoutIndex);
	}

	get keyStats() {
		return computeKeyStats(this.data.chars, this.layoutIndex);
	}

	get handBalance() {
		return computeHandBalance(this.data.chars, this.layoutIndex);
	}

	get streak() {
		return computeStreak(this.data.sessions);
	}

	/** Today's keystrokes, including whatever the in-progress session has
	 * recorded so far — this must stay live while typing, not just update
	 * once a session finalizes. */
	get todayKeystrokes(): number {
		const liveToday =
			this.sessionStart !== null && dayKey(this.sessionStart) === dayKey(this.now)
				? this.sessionKeystrokes
				: 0;
		return keystrokesToday(this.data.sessions) + liveToday;
	}

	get lastSession() {
		return pickLastSession(this.data.sessions);
	}

	get totalKeystrokesRecorded(): number {
		return totalKeystrokes(this.data.chars);
	}

	get adaptiveModeUnlocked(): boolean {
		return this.totalKeystrokesRecorded >= MIN_KEYSTROKES_FOR_ADAPTIVE;
	}

	get keystrokesUntilAdaptive(): number {
		return Math.max(0, MIN_KEYSTROKES_FOR_ADAPTIVE - this.totalKeystrokesRecorded);
	}

	get sessionActive(): boolean {
		return this.sessionStart !== null;
	}

	get liveKeystrokes(): number {
		return this.sessionKeystrokes;
	}

	get liveWpm(): number {
		if (this.sessionStart === null) return 0;
		return calcWpm(this.sessionCorrect, this.now - this.sessionStart);
	}

	get liveAccuracy(): number {
		return calcAccuracy(this.sessionCorrect, this.sessionWrong);
	}

	get liveTopMisses() {
		return computeTopMisses(this.sessionMisses, 5);
	}

	// ---- settings --------------------------------------------------------

	updateSettings(patch: Partial<Settings>): void {
		this.data.settings = { ...this.data.settings, ...patch };
		this.scheduleSave();
	}

	// ---- session lifecycle -------------------------------------------------

	switchMode(mode: PracticeMode): void {
		if (this.currentMode === mode) return;
		if (this.sessionMode !== null && this.sessionMode !== mode) this.finalizeSession();
		this.currentMode = mode;
	}

	recordKeystroke(targetChar: string, correct: boolean): void {
		const now = Date.now();
		const isNewSession =
			this.sessionStart === null ||
			(this.lastKeystrokeAt !== null && now - this.lastKeystrokeAt > IDLE_TIMEOUT_MS);

		if (isNewSession) {
			this.finalizeSession();
			this.sessionStart = now;
			this.sessionMode = this.currentMode;
			this.sessionKeystrokes = 0;
			this.sessionCorrect = 0;
			this.sessionWrong = 0;
			this.sessionMisses = {};
			this.startTicking();
		}

		const latency = this.lastKeystrokeAt === null || isNewSession ? 0 : now - this.lastKeystrokeAt;
		this.lastKeystrokeAt = now;
		this.now = now;

		this.data.chars = recordAttempt(this.data.chars, targetChar, correct, latency);
		this.sessionKeystrokes += 1;
		if (correct) {
			this.sessionCorrect += 1;
		} else {
			this.sessionWrong += 1;
			this.sessionMisses[targetChar] = (this.sessionMisses[targetChar] ?? 0) + 1;
		}

		this.resetIdleTimer();
		this.scheduleSave();
	}

	/** Ends the in-progress session immediately (inactivity, hidden tab, or
	 * mode switch). Safe to call when no session is active. */
	endSession(): void {
		this.finalizeSession();
	}

	private finalizeSession(): void {
		this.stopTicking();
		if (this.idleTimer) {
			clearTimeout(this.idleTimer);
			this.idleTimer = null;
		}
		if (this.sessionStart === null || this.sessionKeystrokes === 0 || this.sessionMode === null) {
			this.sessionStart = null;
			this.sessionMode = null;
			return;
		}

		const endedAt = this.lastKeystrokeAt ?? this.sessionStart;
		const durationMs = Math.max(1, endedAt - this.sessionStart);
		this.data.sessions = [
			...this.data.sessions,
			{
				id: crypto.randomUUID(),
				startedAt: this.sessionStart,
				durationMs,
				mode: this.sessionMode,
				wpm: calcWpm(this.sessionCorrect, durationMs),
				accuracy: calcAccuracy(this.sessionCorrect, this.sessionWrong),
				keystrokes: this.sessionKeystrokes,
				topMisses: computeTopMisses(this.sessionMisses, 5)
			}
		].slice(-SESSION_HISTORY_LIMIT);

		this.sessionStart = null;
		this.sessionMode = null;
		this.sessionKeystrokes = 0;
		this.sessionCorrect = 0;
		this.sessionWrong = 0;
		this.sessionMisses = {};
		this.scheduleSave(true);
	}

	private resetIdleTimer(): void {
		if (this.idleTimer) clearTimeout(this.idleTimer);
		this.idleTimer = setTimeout(() => this.endSession(), IDLE_TIMEOUT_MS);
	}

	private startTicking(): void {
		if (this.tickInterval) return;
		this.tickInterval = setInterval(() => (this.now = Date.now()), 1000);
	}

	private stopTicking(): void {
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = null;
		}
	}

	// ---- persistence & data management -------------------------------------

	private scheduleSave(immediate = false): void {
		if (immediate) {
			if (this.saveTimer) clearTimeout(this.saveTimer);
			this.saveTimer = null;
			void this.persist();
			return;
		}
		if (this.saveTimer) clearTimeout(this.saveTimer);
		this.saveTimer = setTimeout(() => void this.persist(), SAVE_DEBOUNCE_MS);
	}

	private async persist(): Promise<void> {
		await this.adapter.save($state.snapshot(this.data));
	}

	/** Flushes any pending debounced save immediately (used on pagehide). */
	flush(): void {
		if (this.saveTimer) clearTimeout(this.saveTimer);
		this.saveTimer = null;
		void this.persist();
	}

	exportJson(): string {
		return JSON.stringify($state.snapshot(this.data), null, 2);
	}

	importJson(json: string): ImportResult {
		try {
			const parsed: unknown = JSON.parse(json);
			this.data = migrate(parsed);
			this.scheduleSave(true);
			return { ok: true };
		} catch {
			return {
				ok: false,
				error: 'Filen kunne ikke leses. Sjekk at det er en eksportert JSON-fil.'
			};
		}
	}

	async resetAll(): Promise<void> {
		this.endSession();
		this.data = { ...emptyStoreData(), settings: { ...DEFAULT_SETTINGS } };
		await this.adapter.clear();
	}
}

export const progressStore = new ProgressStoreState(new LocalStorageAdapter());
