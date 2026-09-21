import type { LayoutIndex } from '../engine/char-map';
import { planChar } from '../engine/plan';
import type { CharStat, SessionRecord } from '../storage/types';

/** "Svake taster" only unlocks once this many keystrokes have been
 * recorded — before that there isn't enough signal to say which keys are
 * genuinely weak. */
export const MIN_KEYSTROKES_FOR_ADAPTIVE = 300;

export function totalKeystrokes(chars: Record<string, CharStat>): number {
	return Object.values(chars).reduce((sum, c) => sum + c.attempts, 0);
}

/** How many of the most recent sessions to look at for the recency boost,
 * and how quickly older sessions in that window lose influence. */
const RECENCY_WINDOW = 20;
const RECENCY_DECAY = 0.85;

const WEIGHT_MISS_RATE = 0.45;
const WEIGHT_LATENCY = 0.35;
const WEIGHT_RECENCY = 0.2;

function normalize(values: Map<string, number>): Map<string, number> {
	const nums = [...values.values()];
	const min = Math.min(...nums);
	const max = Math.max(...nums);
	const range = max - min;
	if (!Number.isFinite(range) || range === 0) return new Map([...values.keys()].map((k) => [k, 0]));
	return new Map([...values].map(([k, v]) => [k, (v - min) / range]));
}

/**
 * Scores every character that has been attempted at least once. A higher
 * score means the character deserves more practice: it combines historical
 * miss rate, average latency, and how often it has shown up in a recent
 * session's top misses (weighted so the most recent sessions count more).
 */
export function computeKeyScores(
	chars: Record<string, CharStat>,
	sessions: SessionRecord[],
	index: LayoutIndex
): Map<string, number> {
	const candidates = Object.entries(chars).filter(
		([char, stat]) => stat.attempts > 0 && planChar(char, index) !== null && char !== ' '
	);
	if (candidates.length === 0) return new Map();

	const missRate = new Map(candidates.map(([char, stat]) => [char, stat.misses / stat.attempts]));
	const avgLatency = new Map(
		candidates.map(([char, stat]) => [char, stat.latencyMs / stat.attempts])
	);

	const recency = new Map(candidates.map(([char]) => [char, 0]));
	const recentSessions = [...sessions]
		.sort((a, b) => b.startedAt - a.startedAt)
		.slice(0, RECENCY_WINDOW);
	recentSessions.forEach((session, i) => {
		const weight = RECENCY_DECAY ** i;
		for (const miss of session.topMisses) {
			if (recency.has(miss.char))
				recency.set(miss.char, (recency.get(miss.char) ?? 0) + miss.count * weight);
		}
	});

	const missRateNorm = normalize(missRate);
	const latencyNorm = normalize(avgLatency);
	const recencyNorm = normalize(recency);

	const scores = new Map<string, number>();
	for (const [char] of candidates) {
		const score =
			WEIGHT_MISS_RATE * (missRateNorm.get(char) ?? 0) +
			WEIGHT_LATENCY * (latencyNorm.get(char) ?? 0) +
			WEIGHT_RECENCY * (recencyNorm.get(char) ?? 0);
		scores.set(char, score);
	}
	return scores;
}

/** The `n` characters most worth drilling, highest score first. */
export function topWeakChars(
	chars: Record<string, CharStat>,
	sessions: SessionRecord[],
	index: LayoutIndex,
	n = 8
): string[] {
	const scores = computeKeyScores(chars, sessions, index);
	return [...scores.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, n)
		.map(([char]) => char);
}
