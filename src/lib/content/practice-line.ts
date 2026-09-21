import type { LayoutIndex } from '../engine/char-map';
import type { PracticeMode } from '../types';
import type { CharStat, SessionRecord } from '../storage/types';
import { topWeakChars } from '../stats/weak-keys';
import { CODE_LINES } from './code';
import { TEXTS } from './texts';
import { WORD_BANK } from './words';
import { buildPracticeLine, type Rng } from './word-select';

function pickFromList(list: readonly string[], prev: string | null, rng: Rng): string {
	if (list.length === 0) return '';
	let pick = list[Math.floor(rng() * list.length)];
	let attempts = 0;
	while (list.length > 1 && pick === prev && attempts < 10) {
		pick = list[Math.floor(rng() * list.length)];
		attempts += 1;
	}
	return pick;
}

function pickGeneratedLine(targetChars: readonly string[], prev: string | null, rng: Rng): string {
	let attempts = 0;
	let line: string;
	do {
		const wordCount = 8 + Math.floor(rng() * 3); // 8-10 words
		line = buildPracticeLine(WORD_BANK, targetChars, wordCount, rng);
		attempts += 1;
	} while (line === prev && attempts < 5);
	return line;
}

export interface PracticeContext {
	chars: Record<string, CharStat>;
	sessions: SessionRecord[];
	layoutIndex: LayoutIndex;
}

/** Picks the next practice line for a mode, never repeating the immediately
 * previous line. "Svake taster" weights word selection towards the user's
 * own scored weak characters; with no scored characters yet it degenerates
 * to an unweighted pick from the word bank (callers should gate the mode
 * itself behind {@link MIN_KEYSTROKES_FOR_ADAPTIVE}). */
export function pickLine(
	mode: PracticeMode,
	prev: string | null,
	ctx: PracticeContext,
	rng: Rng = Math.random
): string {
	switch (mode) {
		case 'tekst':
			return pickFromList(TEXTS, prev, rng);
		case 'kode':
			return pickFromList(CODE_LINES, prev, rng);
		case 'svake': {
			const weak = topWeakChars(ctx.chars, ctx.sessions, ctx.layoutIndex, 8);
			return pickGeneratedLine(weak, prev, rng);
		}
	}
}
