import type { FingerId } from '../types';
import type { CharPlan } from '../layouts/types';
import { isLetterKey, type LayoutIndex } from './char-map';

/**
 * Works out how to type a single character: which key, which finger, and
 * which modifier (if any) must be held down and by which finger.
 *
 * Shift is always held by the pinky of the hand opposite the target key
 * (spec rule). AltGr is always held by the right thumb. Returns null for a
 * character the layout cannot produce (e.g. a dead-key accent).
 */
export function planChar(char: string, index: LayoutIndex): CharPlan | null {
	if (char === ' ') {
		const key = index.keysById.get('space');
		if (!key) return null;
		return { char, keyId: key.id, finger: 'T', holdKeyId: null, holdFinger: null };
	}

	const entry = index.charMap.get(char);
	if (!entry) return null;
	const key = index.keysById.get(entry.keyId);
	if (!key) return null;

	let holdKeyId: string | null = null;
	let holdFinger: FingerId | null = null;
	if (entry.mod === 'shift') {
		const oppositeIsRight = key.finger.startsWith('L');
		holdKeyId = oppositeIsRight ? 'shiftR' : 'shiftL';
		holdFinger = oppositeIsRight ? 'R5' : 'L5';
	} else if (entry.mod === 'altgr') {
		holdKeyId = 'altgr';
		holdFinger = 'R1';
	}

	return { char, keyId: key.id, finger: key.finger, holdKeyId, holdFinger };
}

/** The name to use for the target key in an instruction sentence: the letter
 * itself for alphabetic keys ("K"), otherwise the character produced with no
 * modifier held ("1" for "!", since that's the key you physically press). */
export function keyDisplayName(index: LayoutIndex, plan: CharPlan): string {
	if (plan.char === ' ') return 'mellomrom';
	const key = index.keysById.get(plan.keyId);
	if (!key) return plan.char;
	if (isLetterKey(key)) return (key.base ?? plan.char).toUpperCase();
	return key.base ?? plan.char;
}
