import type { LayoutIndex } from '../engine/char-map';
import { planChar } from '../engine/plan';
import type { FingerId } from '../types';
import type { CharStat, MissCount, SessionRecord } from '../storage/types';
import { addDays, dayKey } from '../utils/date';

/** Records one keystroke attempt against a character, returning a new chars
 * record (does not mutate the input). */
export function recordAttempt(
	chars: Record<string, CharStat>,
	char: string,
	correct: boolean,
	latencyMs: number
): Record<string, CharStat> {
	const prev = chars[char] ?? { attempts: 0, misses: 0, latencyMs: 0 };
	const next: CharStat = {
		attempts: prev.attempts + 1,
		misses: prev.misses + (correct ? 0 : 1),
		latencyMs: prev.latencyMs + Math.max(0, latencyMs)
	};
	return { ...chars, [char]: next };
}

export interface CharSummary {
	attempts: number;
	misses: number;
	missRate: number;
	avgLatencyMs: number;
}

export function summarizeChar(stat: CharStat | undefined): CharSummary {
	if (!stat || stat.attempts === 0) return { attempts: 0, misses: 0, missRate: 0, avgLatencyMs: 0 };
	return {
		attempts: stat.attempts,
		misses: stat.misses,
		missRate: stat.misses / stat.attempts,
		avgLatencyMs: stat.latencyMs / stat.attempts
	};
}

export type FingerStats = Record<FingerId, CharSummary>;

const EMPTY_SUMMARY: CharSummary = { attempts: 0, misses: 0, missRate: 0, avgLatencyMs: 0 };

/** Rolls per-character totals up into per-finger totals, by looking up which
 * finger each recorded character belongs to in the given layout. Characters
 * the layout can no longer produce (e.g. after a layout change) are
 * skipped. */
export function computeFingerStats(
	chars: Record<string, CharStat>,
	index: LayoutIndex
): FingerStats {
	const totals = new Map<FingerId, { attempts: number; misses: number; latencyMs: number }>();

	for (const [char, stat] of Object.entries(chars)) {
		const plan = planChar(char, index);
		if (!plan) continue;
		const bucket = totals.get(plan.finger) ?? { attempts: 0, misses: 0, latencyMs: 0 };
		bucket.attempts += stat.attempts;
		bucket.misses += stat.misses;
		bucket.latencyMs += stat.latencyMs;
		totals.set(plan.finger, bucket);
	}

	const result = {} as FingerStats;
	const order: FingerId[] = ['L5', 'L4', 'L3', 'L2', 'L1', 'R1', 'R2', 'R3', 'R4', 'R5', 'T'];
	for (const finger of order) {
		const bucket = totals.get(finger);
		result[finger] = bucket
			? {
					attempts: bucket.attempts,
					misses: bucket.misses,
					missRate: bucket.attempts ? bucket.misses / bucket.attempts : 0,
					avgLatencyMs: bucket.attempts ? bucket.latencyMs / bucket.attempts : 0
				}
			: EMPTY_SUMMARY;
	}
	return result;
}

/** Rolls per-character totals up into per-key totals (keyed by physical key
 * id), for the keyboard heatmap — several characters can share one key
 * (e.g. "8" and "("), so their stats are combined. */
export function computeKeyStats(
	chars: Record<string, CharStat>,
	index: LayoutIndex
): Record<string, CharSummary> {
	const totals = new Map<string, { attempts: number; misses: number; latencyMs: number }>();

	for (const [char, stat] of Object.entries(chars)) {
		const plan = planChar(char, index);
		if (!plan) continue;
		const bucket = totals.get(plan.keyId) ?? { attempts: 0, misses: 0, latencyMs: 0 };
		bucket.attempts += stat.attempts;
		bucket.misses += stat.misses;
		bucket.latencyMs += stat.latencyMs;
		totals.set(plan.keyId, bucket);
	}

	const result: Record<string, CharSummary> = {};
	for (const [keyId, bucket] of totals) {
		result[keyId] = {
			attempts: bucket.attempts,
			misses: bucket.misses,
			missRate: bucket.attempts ? bucket.misses / bucket.attempts : 0,
			avgLatencyMs: bucket.attempts ? bucket.latencyMs / bucket.attempts : 0
		};
	}
	return result;
}

/** Share of typed characters (space excluded) that belong to the left vs.
 * right hand. */
export function computeHandBalance(
	chars: Record<string, CharStat>,
	index: LayoutIndex
): { leftPct: number; rightPct: number; totalAttempts: number } {
	let left = 0;
	let right = 0;
	for (const [char, stat] of Object.entries(chars)) {
		const plan = planChar(char, index);
		if (!plan || plan.finger === 'T') continue;
		if (plan.finger.startsWith('L')) left += stat.attempts;
		else right += stat.attempts;
	}
	const total = left + right;
	if (total === 0) return { leftPct: 50, rightPct: 50, totalAttempts: 0 };
	return { leftPct: (left / total) * 100, rightPct: (right / total) * 100, totalAttempts: total };
}

export function calcWpm(correctChars: number, durationMs: number): number {
	const minutes = durationMs / 60000;
	if (minutes <= 0) return 0;
	return Math.round(correctChars / 5 / minutes);
}

export function calcAccuracy(correct: number, wrong: number): number {
	const total = correct + wrong;
	if (total === 0) return 100;
	return Math.round((correct / total) * 1000) / 10;
}

export function computeTopMisses(missCounts: Record<string, number>, limit = 5): MissCount[] {
	return Object.entries(missCounts)
		.map(([char, count]) => ({ char, count }))
		.sort((a, b) => b.count - a.count || a.char.localeCompare(b.char))
		.slice(0, limit);
}

export interface Streak {
	current: number;
	longest: number;
}

/** Consecutive-day practice streak, computed from session start times. A
 * streak stays "current" through the day after the last practice (it isn't
 * broken until a full calendar day is skipped). */
export function computeStreak(sessions: SessionRecord[], now: number = Date.now()): Streak {
	const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
	if (days.size === 0) return { current: 0, longest: 0 };

	const today = dayKey(now);
	const yesterday = addDays(today, -1);

	let current = 0;
	let cursor: string | null = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
	while (cursor && days.has(cursor)) {
		current += 1;
		cursor = addDays(cursor, -1);
	}

	const sorted = [...days].sort();
	let longest = 0;
	let run = 0;
	let prev: string | null = null;
	for (const day of sorted) {
		run = prev !== null && addDays(prev, 1) === day ? run + 1 : 1;
		longest = Math.max(longest, run);
		prev = day;
	}

	return { current, longest };
}

export function keystrokesToday(sessions: SessionRecord[], now: number = Date.now()): number {
	const today = dayKey(now);
	return sessions
		.filter((s) => dayKey(s.startedAt) === today)
		.reduce((sum, s) => sum + s.keystrokes, 0);
}

export function lastSession(sessions: SessionRecord[]): SessionRecord | null {
	if (sessions.length === 0) return null;
	return sessions.reduce((latest, s) => (s.startedAt > latest.startedAt ? s : latest));
}
