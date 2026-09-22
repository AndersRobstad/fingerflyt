import type { KeyboardLayout } from './types';
import { MAC_MODIFIER_ROW } from './mac-modifier-row';
import { NO_CHAR_ROWS } from './no-pc';

/**
 * Norwegian Mac keyboard layout. Letters, numbers and punctuation are
 * identical to the PC layout (`no-pc.ts`) — Apple's Norwegian layout
 * matches the ISO Nordic standard for those — so only the modifier row
 * differs. See `mac-modifier-row.ts`.
 */
export const NO_MAC_LAYOUT: KeyboardLayout = {
	id: 'no-mac',
	name: 'Norsk (Mac)',
	rows: [...NO_CHAR_ROWS, MAC_MODIFIER_ROW]
};
