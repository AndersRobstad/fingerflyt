import type { LayoutId } from '../types';
import {
	DEFAULT_SETTINGS,
	emptyStoreData,
	type CharStat,
	type SessionRecord,
	type Settings,
	type StoreData
} from './types';

const VALID_LAYOUTS: LayoutId[] = ['no-pc', 'no-mac', 'us-qwerty', 'us-mac'];

const CURRENT_VERSION = 1;

function isFiniteNumber(v: unknown): v is number {
	return typeof v === 'number' && Number.isFinite(v);
}

function sanitizeCharStat(v: unknown): CharStat | null {
	if (typeof v !== 'object' || v === null) return null;
	const r = v as Record<string, unknown>;
	if (!isFiniteNumber(r.attempts) || !isFiniteNumber(r.misses) || !isFiniteNumber(r.latencyMs))
		return null;
	return {
		attempts: Math.max(0, r.attempts),
		misses: Math.max(0, r.misses),
		latencyMs: Math.max(0, r.latencyMs)
	};
}

function sanitizeChars(v: unknown): StoreData['chars'] {
	const out: StoreData['chars'] = {};
	if (typeof v !== 'object' || v === null) return out;
	for (const [char, stat] of Object.entries(v as Record<string, unknown>)) {
		const sanitized = sanitizeCharStat(stat);
		if (sanitized) out[char] = sanitized;
	}
	return out;
}

function sanitizeSession(v: unknown): SessionRecord | null {
	if (typeof v !== 'object' || v === null) return null;
	const r = v as Record<string, unknown>;
	if (
		typeof r.id !== 'string' ||
		!isFiniteNumber(r.startedAt) ||
		!isFiniteNumber(r.durationMs) ||
		typeof r.mode !== 'string' ||
		!isFiniteNumber(r.wpm) ||
		!isFiniteNumber(r.accuracy) ||
		!isFiniteNumber(r.keystrokes) ||
		!Array.isArray(r.topMisses)
	) {
		return null;
	}
	const topMisses = r.topMisses
		.filter(
			(m): m is { char: string; count: number } =>
				typeof m === 'object' &&
				m !== null &&
				typeof (m as Record<string, unknown>).char === 'string' &&
				isFiniteNumber((m as Record<string, unknown>).count)
		)
		.map((m) => ({ char: m.char, count: m.count }));

	return {
		id: r.id,
		startedAt: r.startedAt,
		durationMs: Math.max(0, r.durationMs),
		mode: r.mode as SessionRecord['mode'],
		wpm: Math.max(0, r.wpm),
		accuracy: Math.min(100, Math.max(0, r.accuracy)),
		keystrokes: Math.max(0, r.keystrokes),
		topMisses
	};
}

function sanitizeSessions(v: unknown): SessionRecord[] {
	if (!Array.isArray(v)) return [];
	const out: SessionRecord[] = [];
	for (const entry of v) {
		const sanitized = sanitizeSession(entry);
		if (sanitized) out.push(sanitized);
	}
	return out;
}

function sanitizeSettings(v: unknown): Settings {
	if (typeof v !== 'object' || v === null) return { ...DEFAULT_SETTINGS };
	const r = v as Record<string, unknown>;
	return {
		showKeyboard:
			typeof r.showKeyboard === 'boolean' ? r.showKeyboard : DEFAULT_SETTINGS.showKeyboard,
		showHands: typeof r.showHands === 'boolean' ? r.showHands : DEFAULT_SETTINGS.showHands,
		strictMode: typeof r.strictMode === 'boolean' ? r.strictMode : DEFAULT_SETTINGS.strictMode,
		layout: VALID_LAYOUTS.includes(r.layout as LayoutId)
			? (r.layout as LayoutId)
			: DEFAULT_SETTINGS.layout,
		theme:
			r.theme === 'light' || r.theme === 'dark' || r.theme === 'system'
				? r.theme
				: DEFAULT_SETTINGS.theme
	};
}

/**
 * Per-version migration steps. Each function takes the raw parsed JSON at
 * that version and returns raw data shaped for `version + 1`. When a v2
 * lands, add a `1: (data) => ({...})` entry here rather than rewriting
 * `migrate` below.
 */
const STEPS: Record<number, (data: Record<string, unknown>) => Record<string, unknown>> = {};

/**
 * Turns whatever was read from storage (possibly missing, corrupt, or from
 * an older version) into a valid current-version `StoreData`. Never throws:
 * unrecognisable input becomes a fresh, empty store rather than crashing the
 * app.
 */
export function migrate(raw: unknown): StoreData {
	if (typeof raw !== 'object' || raw === null) return emptyStoreData();

	let data = raw as Record<string, unknown>;
	let version = isFiniteNumber(data.version) ? data.version : 0;

	// Unknown/missing version with no recognisable shape: start fresh rather
	// than guessing.
	if (version === 0 && !('chars' in data) && !('sessions' in data)) return emptyStoreData();
	if (version === 0) version = 1;

	while (version < CURRENT_VERSION) {
		const step = STEPS[version];
		if (!step) return emptyStoreData();
		data = step(data);
		version += 1;
	}

	if (version !== CURRENT_VERSION) return emptyStoreData();

	return {
		version: 1,
		chars: sanitizeChars(data.chars),
		sessions: sanitizeSessions(data.sessions),
		settings: sanitizeSettings(data.settings)
	};
}
