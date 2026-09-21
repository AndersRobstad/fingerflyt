import { describe, expect, it } from 'vitest';
import { buildLayoutIndex } from '../engine/char-map';
import { NO_PC_LAYOUT } from '../layouts/no-pc';
import type { SessionRecord } from '../storage/types';
import {
	calcAccuracy,
	calcWpm,
	computeFingerStats,
	computeHandBalance,
	computeKeyStats,
	computeStreak,
	computeTopMisses,
	keystrokesToday,
	lastSession,
	recordAttempt,
	summarizeChar
} from './aggregate';

const index = buildLayoutIndex(NO_PC_LAYOUT);
const DAY = 86_400_000;

describe('recordAttempt', () => {
	it('creates a fresh entry for a new character', () => {
		const result = recordAttempt({}, 'k', true, 200);
		expect(result.k).toEqual({ attempts: 1, misses: 0, latencyMs: 200 });
	});

	it('accumulates onto an existing entry without mutating the input', () => {
		const before = { k: { attempts: 1, misses: 0, latencyMs: 200 } };
		const after = recordAttempt(before, 'k', false, 300);
		expect(after.k).toEqual({ attempts: 2, misses: 1, latencyMs: 500 });
		expect(before.k).toEqual({ attempts: 1, misses: 0, latencyMs: 200 });
	});
});

describe('summarizeChar', () => {
	it('computes miss rate and average latency', () => {
		expect(summarizeChar({ attempts: 4, misses: 1, latencyMs: 800 })).toEqual({
			attempts: 4,
			misses: 1,
			missRate: 0.25,
			avgLatencyMs: 200
		});
	});

	it('handles an unrecorded character', () => {
		expect(summarizeChar(undefined)).toEqual({
			attempts: 0,
			misses: 0,
			missRate: 0,
			avgLatencyMs: 0
		});
	});
});

describe('computeFingerStats', () => {
	it('rolls character totals up to the finger that types them', () => {
		const chars = {
			k: { attempts: 10, misses: 2, latencyMs: 2000 }, // R3
			i: { attempts: 5, misses: 1, latencyMs: 1000 } // R3
		};
		const result = computeFingerStats(chars, index);
		expect(result.R3).toEqual({ attempts: 15, misses: 3, missRate: 0.2, avgLatencyMs: 200 });
		expect(result.L5.attempts).toBe(0);
	});

	it('skips characters the layout cannot produce', () => {
		const chars = { '¨': { attempts: 3, misses: 0, latencyMs: 100 } };
		const result = computeFingerStats(chars, index);
		expect(Object.values(result).every((f) => f.attempts === 0)).toBe(true);
	});
});

describe('computeKeyStats', () => {
	it('combines characters that share a physical key', () => {
		const chars = {
			'8': { attempts: 10, misses: 2, latencyMs: 2000 }, // key "8"
			'(': { attempts: 5, misses: 1, latencyMs: 1000 } // Shift+8, same key
		};
		const result = computeKeyStats(chars, index);
		expect(result['8']).toEqual({ attempts: 15, misses: 3, missRate: 0.2, avgLatencyMs: 200 });
	});

	it('omits keys with no recorded attempts', () => {
		const result = computeKeyStats({ k: { attempts: 4, misses: 0, latencyMs: 400 } }, index);
		expect(result.q).toBeUndefined();
	});
});

describe('computeHandBalance', () => {
	it('splits attempts between hands and excludes space', () => {
		const chars = {
			q: { attempts: 10, misses: 0, latencyMs: 0 }, // left
			j: { attempts: 30, misses: 0, latencyMs: 0 }, // right
			' ': { attempts: 100, misses: 0, latencyMs: 0 } // excluded
		};
		const result = computeHandBalance(chars, index);
		expect(result.totalAttempts).toBe(40);
		expect(result.leftPct).toBe(25);
		expect(result.rightPct).toBe(75);
	});

	it('defaults to an even split with no data', () => {
		expect(computeHandBalance({}, index)).toEqual({ leftPct: 50, rightPct: 50, totalAttempts: 0 });
	});
});

describe('calcWpm', () => {
	it('matches the spec formula: correct chars / 5 / minutes', () => {
		expect(calcWpm(250, 60000)).toBe(50); // 250/5 = 50 words in 1 minute
		expect(calcWpm(0, 60000)).toBe(0);
	});

	it('returns 0 for zero or negative duration instead of dividing by zero', () => {
		expect(calcWpm(100, 0)).toBe(0);
	});
});

describe('calcAccuracy', () => {
	it('computes a percentage with one decimal', () => {
		expect(calcAccuracy(9, 1)).toBe(90);
		expect(calcAccuracy(2, 1)).toBe(66.7);
	});

	it('defaults to 100% with no keystrokes yet', () => {
		expect(calcAccuracy(0, 0)).toBe(100);
	});
});

describe('computeTopMisses', () => {
	it('sorts by count descending, breaking ties alphabetically', () => {
		const result = computeTopMisses({ k: 3, i: 5, o: 3, p: 1 }, 5);
		expect(result).toEqual([
			{ char: 'i', count: 5 },
			{ char: 'k', count: 3 },
			{ char: 'o', count: 3 },
			{ char: 'p', count: 1 }
		]);
	});

	it('respects the limit', () => {
		expect(computeTopMisses({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }, 5)).toHaveLength(5);
	});
});

function session(startedAt: number, overrides: Partial<SessionRecord> = {}): SessionRecord {
	return {
		id: `${startedAt}`,
		startedAt,
		durationMs: 60000,
		mode: 'tekst',
		wpm: 40,
		accuracy: 95,
		keystrokes: 100,
		topMisses: [],
		...overrides
	};
}

describe('computeStreak', () => {
	it('is zero with no sessions', () => {
		expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
	});

	it('counts a streak that includes today', () => {
		const now = Date.UTC(2026, 0, 10, 12, 0, 0);
		const sessions = [session(now), session(now - DAY), session(now - 2 * DAY)];
		expect(computeStreak(sessions, now)).toEqual({ current: 3, longest: 3 });
	});

	it('keeps the streak alive through the day after practice, before breaking it', () => {
		const now = Date.UTC(2026, 0, 10, 12, 0, 0);
		const sessions = [session(now - DAY), session(now - 2 * DAY)];
		expect(computeStreak(sessions, now).current).toBe(2);
	});

	it('breaks the streak once a full day is skipped', () => {
		const now = Date.UTC(2026, 0, 10, 12, 0, 0);
		const sessions = [session(now - 2 * DAY), session(now - 3 * DAY)];
		expect(computeStreak(sessions, now).current).toBe(0);
	});

	it('tracks the longest streak separately from the current one', () => {
		const now = Date.UTC(2026, 0, 20, 12, 0, 0);
		const sessions = [
			session(now), // today: current streak of 1
			session(now - 10 * DAY),
			session(now - 11 * DAY),
			session(now - 12 * DAY),
			session(now - 13 * DAY) // an old 4-day streak, longer than today's 1
		];
		const result = computeStreak(sessions, now);
		expect(result.current).toBe(1);
		expect(result.longest).toBe(4);
	});
});

describe('keystrokesToday / lastSession', () => {
	it('sums only sessions from today', () => {
		const now = Date.UTC(2026, 0, 10, 12, 0, 0);
		const sessions = [
			session(now, { keystrokes: 50 }),
			session(now - 3600_000, { keystrokes: 25 }),
			session(now - 2 * DAY, { keystrokes: 999 })
		];
		expect(keystrokesToday(sessions, now)).toBe(75);
	});

	it('picks the most recently started session', () => {
		const sessions = [session(1000, { id: 'first' }), session(3000, { id: 'second' })];
		expect(lastSession(sessions)?.id).toBe('second');
	});

	it('returns null for an empty session list', () => {
		expect(lastSession([])).toBeNull();
	});
});
