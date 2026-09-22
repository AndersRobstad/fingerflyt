import type { Language, LayoutId, LayoutPlatform } from '../types';
import type { KeyboardLayout } from './types';
import { NO_MAC_LAYOUT } from './no-mac';
import { NO_PC_LAYOUT } from './no-pc';
import { US_MAC_LAYOUT } from './us-mac';
import { US_QWERTY_LAYOUT } from './us-qwerty';

/** Registry of available keyboard layouts. */
export const LAYOUTS: Record<LayoutId, KeyboardLayout> = {
	'no-pc': NO_PC_LAYOUT,
	'no-mac': NO_MAC_LAYOUT,
	'us-qwerty': US_QWERTY_LAYOUT,
	'us-mac': US_MAC_LAYOUT
};

export function getLayout(id: LayoutId): KeyboardLayout {
	return LAYOUTS[id];
}

/** Which practice-content language a layout's text/word content should be
 * drawn in. Each layout maps to exactly one language for now. */
export function layoutLanguage(id: LayoutId): Language {
	return id === 'us-qwerty' || id === 'us-mac' ? 'en' : 'nb';
}

/** Whether a layout uses the PC or Mac modifier-key convention. */
export function layoutPlatform(id: LayoutId): LayoutPlatform {
	return id === 'no-mac' || id === 'us-mac' ? 'mac' : 'pc';
}

/** The layout id for a given language + platform combination — the
 * inverse of `layoutLanguage`/`layoutPlatform` combined. */
export function resolveLayoutId(language: Language, platform: LayoutPlatform): LayoutId {
	if (language === 'en') return platform === 'mac' ? 'us-mac' : 'us-qwerty';
	return platform === 'mac' ? 'no-mac' : 'no-pc';
}

export * from './types';
