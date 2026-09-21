import { isLetterKey } from '../engine/char-map';
import type { KeyDef } from './types';

/** The label to print on a key cap: the key's own label for modifiers, the
 * uppercase letter for alphabetic keys, otherwise the unmodified
 * character. */
export function mainLabel(key: KeyDef): string {
	if (key.kind === 'modifier') return key.label ?? '';
	if (key.kind === 'space') return '';
	if (key.kind === 'dead') return key.base ?? '';
	if (isLetterKey(key)) return (key.base ?? '').toUpperCase();
	return key.base ?? '';
}
