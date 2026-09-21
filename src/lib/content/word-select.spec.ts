import { describe, expect, it } from 'vitest';
import { pickWeightedWords, buildPracticeLine } from './word-select';

// Deterministic sequence for reproducible tests.
function seeded(seed: number) {
	let s = seed;
	return () => {
		s = (s * 1103515245 + 12345) & 0x7fffffff;
		return s / 0x7fffffff;
	};
}

describe('pickWeightedWords', () => {
	it('returns the requested count of distinct words', () => {
		const pool = ['ikke', 'liker', 'hage', 'sol', 'blomst', 'kikk'];
		const result = pickWeightedWords(pool, ['i', 'k'], 4, seeded(1));
		expect(result).toHaveLength(4);
		expect(new Set(result).size).toBe(4);
		for (const w of result) expect(pool).toContain(w);
	});

	it('never returns more words than the pool has', () => {
		const result = pickWeightedWords(['a', 'b'], ['a'], 10, seeded(2));
		expect(result).toHaveLength(2);
	});

	it('favours words containing the target characters over many draws', () => {
		const pool = ['kikk', 'ikkje', 'kilo', 'sol', 'dag', 'hus', 'bok', 'tre'];
		let heavyCount = 0;
		for (let seed = 0; seed < 200; seed++) {
			const [first] = pickWeightedWords(pool, ['i', 'k'], 1, seeded(seed));
			if (first === 'kikk' || first === 'ikkje' || first === 'kilo') heavyCount++;
		}
		// Heavily-weighted words should dominate, though not exclusively.
		expect(heavyCount).toBeGreaterThan(120);
	});

	it('is empty for an empty pool', () => {
		expect(pickWeightedWords([], ['a'], 3, seeded(1))).toEqual([]);
	});
});

describe('buildPracticeLine', () => {
	const pool = ['ikke', 'liker', 'hage', 'sol', 'blomst', 'kikk', 'kilo', 'lokk'];

	it('joins the requested number of words with single spaces', () => {
		const line = buildPracticeLine(pool, ['i', 'k'], 5, seeded(3));
		expect(line.split(' ').length).toBeGreaterThanOrEqual(5);
	});

	it('only ever contains characters from the pool plus space, comma and digits', () => {
		const line = buildPracticeLine(pool, ['i', 'k', ',', '8'], 6, seeded(7));
		expect(line).toMatch(/^[a-zæøå ,0-9]+$/);
	});
});
