import type { LayoutId } from '../types';
import type { KeyboardLayout } from './types';
import { NO_PC_LAYOUT } from './no-pc';

/** Registry of available keyboard layouts. A Norwegian Mac layout can be
 * added here later as a second entry, with a picker in settings. */
export const LAYOUTS: Record<LayoutId, KeyboardLayout> = {
	'no-pc': NO_PC_LAYOUT
};

export function getLayout(id: LayoutId): KeyboardLayout {
	return LAYOUTS[id];
}

export * from './types';
