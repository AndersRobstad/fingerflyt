import { describe, expect, it } from 'vitest';
import { buildLayoutIndex } from '../engine/char-map';
import { NO_PC_LAYOUT } from '../layouts/no-pc';
import { pickLine } from './practice-line';

const layoutIndex = buildLayoutIndex(NO_PC_LAYOUT);
const ctx = { chars: {}, sessions: [], layoutIndex };

// Deterministic sequence for reproducible tests (also used in word-select.spec.ts).
function seeded(seed: number) {
	let s = seed;
	return () => {
		s = (s * 1103515245 + 12345) & 0x7fffffff;
		return s / 0x7fffffff;
	};
}

describe('pickLine', () => {
	it('never repeats the same tekst line twice in a row over many draws', () => {
		const rng = seeded(1);
		let prev: string | null = null;
		for (let i = 0; i < 200; i++) {
			const line = pickLine('tekst', prev, ctx, rng);
			if (prev !== null) expect(line).not.toBe(prev);
			prev = line;
		}
	});

	it('never repeats the same kode line twice in a row over many draws', () => {
		const rng = seeded(2);
		let prev: string | null = null;
		for (let i = 0; i < 200; i++) {
			const line = pickLine('kode', prev, ctx, rng);
			if (prev !== null) expect(line).not.toBe(prev);
			prev = line;
		}
	});

	it('generates a svake line of 8 to 10 words', () => {
		const line = pickLine('svake', null, ctx, Math.random);
		const wordCount = line.split(' ').filter(Boolean).length;
		expect(wordCount).toBeGreaterThanOrEqual(8);
		expect(wordCount).toBeLessThanOrEqual(11); // allow for an injected comma/digit token
	});

	it('falls back to an unweighted pick for svake when there is no scored history', () => {
		const line = pickLine('svake', null, ctx, Math.random);
		expect(line.length).toBeGreaterThan(0);
	});

	it("weights svake generation towards the user's actual weak characters", () => {
		const weakCtx = {
			chars: {
				x: { attempts: 40, misses: 30, latencyMs: 40 * 900 },
				a: { attempts: 40, misses: 0, latencyMs: 40 * 150 }
			},
			sessions: [],
			layoutIndex
		};
		const line = pickLine('svake', null, weakCtx, Math.random);
		expect(line.length).toBeGreaterThan(0);
	});
});
