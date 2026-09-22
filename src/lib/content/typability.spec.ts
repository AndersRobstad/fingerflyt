import { describe, expect, it } from 'vitest';
import { buildLayoutIndex, isTypable, type LayoutIndex } from '../engine/char-map';
import { NO_MAC_LAYOUT } from '../layouts/no-mac';
import { NO_PC_LAYOUT } from '../layouts/no-pc';
import { US_MAC_LAYOUT } from '../layouts/us-mac';
import { US_QWERTY_LAYOUT } from '../layouts/us-qwerty';
import { CODE_LINES } from './code';
import { TEXTS } from './texts';
import { TEXTS_EN } from './texts.en';
import { WORD_BANK } from './words';
import { WORD_BANK_EN } from './words.en';

const noIndex = buildLayoutIndex(NO_PC_LAYOUT);
const usIndex = buildLayoutIndex(US_QWERTY_LAYOUT);
const noMacIndex = buildLayoutIndex(NO_MAC_LAYOUT);
const usMacIndex = buildLayoutIndex(US_MAC_LAYOUT);

/** Every character in every line must be producible by the layout — an
 * untypable character (a dead-key accent, or a character from the wrong
 * language) would silently strand the user on that line forever. */
function untypableChars(index: LayoutIndex, lines: readonly string[]): string[] {
	const bad = new Set<string>();
	for (const line of lines) {
		for (const char of line) {
			if (!isTypable(index, char)) bad.add(char);
		}
	}
	return [...bad];
}

describe('practice content is fully typable on its layout', () => {
	it('Norwegian texts and word bank are typable on no-pc', () => {
		expect(untypableChars(noIndex, TEXTS)).toEqual([]);
		expect(untypableChars(noIndex, WORD_BANK)).toEqual([]);
	});

	it('English texts and word bank are typable on us-qwerty', () => {
		expect(untypableChars(usIndex, TEXTS_EN)).toEqual([]);
		expect(untypableChars(usIndex, WORD_BANK_EN)).toEqual([]);
	});

	it('shared code snippets are typable on all four layouts', () => {
		expect(untypableChars(noIndex, CODE_LINES)).toEqual([]);
		expect(untypableChars(usIndex, CODE_LINES)).toEqual([]);
		expect(untypableChars(noMacIndex, CODE_LINES)).toEqual([]);
		expect(untypableChars(usMacIndex, CODE_LINES)).toEqual([]);
	});

	it('Norwegian content is typable on no-mac too', () => {
		expect(untypableChars(noMacIndex, TEXTS)).toEqual([]);
		expect(untypableChars(noMacIndex, WORD_BANK)).toEqual([]);
	});

	it('English content is typable on us-mac too', () => {
		expect(untypableChars(usMacIndex, TEXTS_EN)).toEqual([]);
		expect(untypableChars(usMacIndex, WORD_BANK_EN)).toEqual([]);
	});
});
