import type { FingerId, LayoutId } from '../types';

export type KeyKind = 'char' | 'modifier' | 'dead' | 'space';

export interface KeyDef {
	/** Stable identifier, used as a React-less #each key and for DOM lookups. */
	id: string;
	/** Character typed with no modifier. Null for pure modifier keys. */
	base: string | null;
	/** Character typed while holding Shift. */
	shift: string | null;
	/** Character typed while holding AltGr (Right Alt). */
	altgr: string | null;
	/** Finger that should press this key (not the one holding a modifier). */
	finger: FingerId;
	/** Relative width for the flexbox keyboard rendering (1 = a normal key). */
	width: number;
	/** Visible label for non-character keys, e.g. "Tab", "Enter". */
	label?: string;
	kind: KeyKind;
}

export interface KeyboardLayout {
	id: LayoutId;
	/** Bokmål display name, e.g. "Norsk (PC)". */
	name: string;
	rows: KeyDef[][];
}

/** How a single character is reached: which key, and which modifier (if any)
 * must be held to produce it. */
export interface CharPlan {
	char: string;
	keyId: string;
	finger: FingerId;
	/** Key id of the modifier that must be held, or null if none. */
	holdKeyId: string | null;
	/** Finger that holds the modifier, or null if none. */
	holdFinger: FingerId | null;
}
