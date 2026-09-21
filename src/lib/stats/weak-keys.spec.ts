import { describe, expect, it } from 'vitest';
import { buildLayoutIndex } from '../engine/char-map';
import { NO_PC_LAYOUT } from '../layouts/no-pc';
import type { SessionRecord } from '../storage/types';
import {
	computeKeyScores,
	topWeakChars,
	totalKeystrokes,
	MIN_KEYSTROKES_FOR_ADAPTIVE
} from './weak-keys';

const index = buildLayoutIndex(NO_PC_LAYOUT);

describe('totalKeystrokes', () => {
	it('sums attempts across all characters', () => {
		expect(
			totalKeystrokes({
				a: { attempts: 3, misses: 0, latencyMs: 0 },
				b: { attempts: 7, misses: 0, latencyMs: 0 }
			})
		).toBe(10);
	});

	it('exposes the adaptive-mode threshold as a named constant', () => {
		expect(MIN_KEYSTROKES_FOR_ADAPTIVE).toBe(300);
	});
});

describe('computeKeyScores', () => {
	it('scores a frequently-missed, slow character higher than a clean, fast one', () => {
		const chars = {
			k: { attempts: 50, misses: 20, latencyMs: 50 * 600 }, // missed often, slow
			a: { attempts: 50, misses: 0, latencyMs: 50 * 150 } // clean, fast
		};
		const scores = computeKeyScores(chars, [], index);
		expect(scores.get('k')!).toBeGreaterThan(scores.get('a')!);
	});

	it('excludes space and characters the layout cannot type', () => {
		const chars = {
			' ': { attempts: 100, misses: 0, latencyMs: 0 },
			'¨': { attempts: 5, misses: 5, latencyMs: 5000 },
			k: { attempts: 10, misses: 1, latencyMs: 2000 }
		};
		const scores = computeKeyScores(chars, [], index);
		expect(scores.has(' ')).toBe(false);
		expect(scores.has('¨')).toBe(false);
		expect(scores.has('k')).toBe(true);
	});

	it('gives extra weight to characters that show up in recent sessions top misses', () => {
		const chars = {
			k: { attempts: 20, misses: 2, latencyMs: 20 * 300 },
			p: { attempts: 20, misses: 2, latencyMs: 20 * 300 }
		};
		const sessions: SessionRecord[] = [
			{
				id: '1',
				startedAt: Date.now(),
				durationMs: 60000,
				mode: 'tekst',
				wpm: 40,
				accuracy: 90,
				keystrokes: 100,
				topMisses: [{ char: 'k', count: 5 }]
			}
		];
		const scores = computeKeyScores(chars, sessions, index);
		expect(scores.get('k')!).toBeGreaterThan(scores.get('p')!);
	});

	it('returns an empty map with no recorded characters', () => {
		expect(computeKeyScores({}, [], index).size).toBe(0);
	});
});

describe('topWeakChars', () => {
	it('returns the highest-scoring characters first, limited to n', () => {
		const chars = {
			k: { attempts: 50, misses: 25, latencyMs: 50 * 700 },
			p: { attempts: 50, misses: 1, latencyMs: 50 * 150 },
			o: { attempts: 50, misses: 10, latencyMs: 50 * 400 }
		};
		const result = topWeakChars(chars, [], index, 2);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe('k');
	});
});
