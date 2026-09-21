import type { KeyDef, KeyboardLayout } from '../layouts/types';

export type Modifier = 'shift' | 'altgr' | null;

export interface CharMapEntry {
	keyId: string;
	mod: Modifier;
}

export interface LayoutIndex {
	layout: KeyboardLayout;
	keysById: Map<string, KeyDef>;
	charMap: Map<string, CharMapEntry>;
}

const LETTER_RE = /^[a-zæøå]$/;

/** True for the 29 alphabetic keys, where the displayed key name is the
 * letter itself rather than the base/shift character that was typed. */
export function isLetterKey(key: KeyDef): boolean {
	return key.kind === 'char' && key.base !== null && LETTER_RE.test(key.base);
}

/** Indexes a layout for fast lookups: key id -> key, and character -> key +
 * modifier. Dead keys are intentionally excluded so they can never be
 * targeted by practice text. Earlier keys win on collision (there are none
 * in practice, but this keeps behaviour deterministic). */
export function buildLayoutIndex(layout: KeyboardLayout): LayoutIndex {
	const keysById = new Map<string, KeyDef>();
	const charMap = new Map<string, CharMapEntry>();

	for (const row of layout.rows) {
		for (const key of row) {
			keysById.set(key.id, key);
			if (key.kind === 'modifier' || key.kind === 'dead') continue;

			if (key.base && !charMap.has(key.base)) charMap.set(key.base, { keyId: key.id, mod: null });
			if (key.shift && !charMap.has(key.shift))
				charMap.set(key.shift, { keyId: key.id, mod: 'shift' });
			if (key.altgr && !charMap.has(key.altgr))
				charMap.set(key.altgr, { keyId: key.id, mod: 'altgr' });
		}
	}

	return { layout, keysById, charMap };
}

/** Whether a character can be produced by this layout at all (used to filter
 * generated practice text so it never contains an untypable character). */
export function isTypable(index: LayoutIndex, char: string): boolean {
	return index.charMap.has(char);
}
