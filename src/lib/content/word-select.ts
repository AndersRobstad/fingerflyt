export type Rng = () => number;

function scoreWord(word: string, targetChars: Set<string>): number {
	let score = 0;
	for (const c of word) if (targetChars.has(c)) score += 1;
	return score;
}

/**
 * Weighted sample of `count` distinct words from `pool`, favouring words
 * that contain more of `targetChars`. Uses the Efraimidis–Spirakis
 * algorithm (each word gets a random key raised to 1/weight; the highest
 * keys win), which samples without replacement in one pass and needs no
 * pre-built repeated pool.
 */
export function pickWeightedWords(
	pool: readonly string[],
	targetChars: readonly string[],
	count: number,
	rng: Rng = Math.random
): string[] {
	if (pool.length === 0 || count <= 0) return [];
	const targets = new Set(targetChars);
	const keyed = pool.map((word) => {
		const weight = scoreWord(word, targets) * 3 + 1;
		const u = Math.max(rng(), Number.EPSILON);
		return { word, key: u ** (1 / weight) };
	});
	keyed.sort((a, b) => b.key - a.key);
	return keyed.slice(0, Math.min(count, keyed.length)).map((k) => k.word);
}

/** Joins words into a practice line. When the comma key is one of the
 * targets, occasionally inserts a comma to drill it too — commas can't
 * naturally occur inside a single word. Likewise for a bare digit. */
export function buildPracticeLine(
	words: readonly string[],
	targetChars: readonly string[],
	count: number,
	rng: Rng = Math.random
): string {
	const chosen = pickWeightedWords(words, targetChars, count, rng);
	const targets = new Set(targetChars);

	if (targets.has(',') && chosen.length > 2) {
		const i = 1 + Math.floor(rng() * (chosen.length - 2));
		chosen[i] = `${chosen[i]},`;
	}
	for (const digit of targetChars) {
		if (/^[0-9]$/.test(digit) && rng() < 0.35) {
			const i = Math.floor(rng() * (chosen.length + 1));
			chosen.splice(i, 0, digit);
			break;
		}
	}

	return chosen.join(' ');
}
