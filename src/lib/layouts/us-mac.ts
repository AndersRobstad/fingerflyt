import type { KeyboardLayout } from './types';
import { MAC_MODIFIER_ROW } from './mac-modifier-row';
import { US_CHAR_ROWS } from './us-qwerty';

/**
 * US Mac keyboard layout. Letters, numbers and punctuation are identical to
 * the PC layout (`us-qwerty.ts`) — only the modifier row differs. See
 * `mac-modifier-row.ts`.
 */
export const US_MAC_LAYOUT: KeyboardLayout = {
	id: 'us-mac',
	name: 'US (Mac)',
	rows: [...US_CHAR_ROWS, MAC_MODIFIER_ROW]
};
