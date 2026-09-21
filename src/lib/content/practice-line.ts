import type { LayoutIndex } from '../engine/char-map';
import { layoutLanguage } from '../layouts';
import type { PracticeMode } from '../types';
import type { CharStat, SessionRecord } from '../storage/types';
import { topWeakChars } from '../stats/weak-keys';
import { CODE_LINES } from './code';
import { TEXTS } from './texts';
import { TEXTS_EN } from './texts.en';
import { wordBankState } from './word-bank.svelte';
import { WORD_BANK } from './words';
import { WORD_BANK_EN } from './words.en';
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

function pickGeneratedLine(
	wordBank: readonly string[],
	targetChars: readonly string[],
	prev: string | null,
	rng: Rng
): string {
	let attempts = 0;
	let line: string;
	do {
		const wordCount = 8 + Math.floor(rng() * 3); // 8-10 words
		line = buildPracticeLine(wordBank, targetChars, wordCount, rng);
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
 * previous line. "Tekst" and "Svake taster" draw from whichever language
 * the active layout implies (see {@link layoutLanguage}), upgrading from
 * the small bundled word seed to the larger fetched word bank once it has
 * loaded. "Svake taster" weights word selection towards the user's own
 * scored weak characters; with no scored characters yet it degenerates to
 * an unweighted pick (callers should gate the mode itself behind
 * {@link MIN_KEYSTROKES_FOR_ADAPTIVE}). */
export function pickLine(
	mode: PracticeMode,
	prev: string | null,
	ctx: PracticeContext,
	rng: Rng = Math.random
): string {
	const lang = layoutLanguage(ctx.layoutIndex.layout.id);

	switch (mode) {
		case 'tekst':
			return pickFromList(lang === 'en' ? TEXTS_EN : TEXTS, prev, rng);
		case 'kode':
			return pickFromList(CODE_LINES, prev, rng);
		case 'svake': {
			wordBankState.ensure(lang);
			const seed = lang === 'en' ? WORD_BANK_EN : WORD_BANK;
			const wordBank = wordBankState.get(lang) ?? seed;
			const weak = topWeakChars(ctx.chars, ctx.sessions, ctx.layoutIndex, 8);
			return pickGeneratedLine(wordBank, weak, prev, rng);
		}
	}
}
