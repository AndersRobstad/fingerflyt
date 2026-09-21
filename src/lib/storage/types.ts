import type { LayoutId, PracticeMode } from '../types';

/** Aggregated outcomes for a single character, across all sessions. */
export interface CharStat {
	attempts: number;
	misses: number;
	/** Sum of per-keystroke latency in ms (time since the previous keystroke
	 * event), so the average is `latencyMs / attempts`. */
	latencyMs: number;
}

export interface MissCount {
	char: string;
	count: number;
}

export interface SessionRecord {
	id: string;
	/** Epoch ms when the session's first keystroke happened. */
	startedAt: number;
	durationMs: number;
	mode: PracticeMode;
	wpm: number;
	/** 0-100. */
	accuracy: number;
	keystrokes: number;
	topMisses: MissCount[];
}

export interface Settings {
	showKeyboard: boolean;
	showHands: boolean;
	/** Wrong characters must be corrected before the line advances. */
	strictMode: boolean;
	layout: LayoutId;
	theme: 'system' | 'light' | 'dark';
}

export const DEFAULT_SETTINGS: Settings = {
	showKeyboard: true,
	showHands: true,
	strictMode: true,
	layout: 'no-pc',
	theme: 'system'
};

/** The full shape of persisted app data, current version. */
export interface StoreData {
	version: 1;
	chars: Record<string, CharStat>;
	sessions: SessionRecord[];
	settings: Settings;
}

export function emptyStoreData(): StoreData {
	return { version: 1, chars: {}, sessions: [], settings: { ...DEFAULT_SETTINGS } };
}

/**
 * Storage abstraction so a future backend (Supabase, Vercel Postgres, ...)
 * can replace localStorage without touching the rest of the app. All
 * methods are async even though the current implementation is synchronous
 * under the hood.
 */
export interface ProgressStore {
	load(): Promise<StoreData>;
	save(data: StoreData): Promise<void>;
	clear(): Promise<void>;
}
