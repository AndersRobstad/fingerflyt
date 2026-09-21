import type { Language, LayoutId } from '../types';
import type { KeyboardLayout } from './types';
import { NO_PC_LAYOUT } from './no-pc';
import { US_QWERTY_LAYOUT } from './us-qwerty';

/** Registry of available keyboard layouts. A Norwegian Mac layout can be
 * added here later as a further entry, alongside the picker in settings. */
export const LAYOUTS: Record<LayoutId, KeyboardLayout> = {
	'no-pc': NO_PC_LAYOUT,
	'us-qwerty': US_QWERTY_LAYOUT
};

export function getLayout(id: LayoutId): KeyboardLayout {
	return LAYOUTS[id];
}

/** Which practice-content language a layout's text/word content should be
 * drawn in. Each layout maps to exactly one language for now. */
export function layoutLanguage(id: LayoutId): Language {
	return id === 'us-qwerty' ? 'en' : 'nb';
}

export * from './types';
