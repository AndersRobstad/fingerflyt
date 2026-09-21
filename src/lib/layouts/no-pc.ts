import type { KeyboardLayout } from './types';

/**
 * Norwegian PC (ISO) keyboard layout.
 *
 * Letter finger assignment follows standard touch-typing technique, with one
 * deliberate deviation: `6` sits on the left index finger (instead of the
 * right) to take load off the right hand, per the project brief.
 *
 * The dead key (¨ ^ ~) is included for visual completeness but is never
 * reachable from practice text — its `kind` is `dead` so it is excluded when
 * building the character map.
 */
export const NO_PC_LAYOUT: KeyboardLayout = {
	id: 'no-pc',
	name: 'Norsk (PC)',
	rows: [
		[
			{ id: 'bar', base: '|', shift: '§', altgr: null, finger: 'L5', width: 1, kind: 'char' },
			{ id: '1', base: '1', shift: '!', altgr: null, finger: 'L5', width: 1, kind: 'char' },
			{ id: '2', base: '2', shift: '"', altgr: '@', finger: 'L4', width: 1, kind: 'char' },
			{ id: '3', base: '3', shift: '#', altgr: '£', finger: 'L3', width: 1, kind: 'char' },
			{ id: '4', base: '4', shift: '¤', altgr: '$', finger: 'L2', width: 1, kind: 'char' },
			{ id: '5', base: '5', shift: '%', altgr: '€', finger: 'L2', width: 1, kind: 'char' },
			{ id: '6', base: '6', shift: '&', altgr: null, finger: 'L2', width: 1, kind: 'char' },
			{ id: '7', base: '7', shift: '/', altgr: '{', finger: 'R2', width: 1, kind: 'char' },
			{ id: '8', base: '8', shift: '(', altgr: '[', finger: 'R3', width: 1, kind: 'char' },
			{ id: '9', base: '9', shift: ')', altgr: ']', finger: 'R4', width: 1, kind: 'char' },
			{ id: '0', base: '0', shift: '=', altgr: '}', finger: 'R5', width: 1, kind: 'char' },
			{ id: 'plus', base: '+', shift: '?', altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{ id: 'bslash', base: '\\', shift: null, altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{
				id: 'bksp',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R5',
				width: 2,
				label: '⌫',
				kind: 'modifier'
			}
		],
		[
			{
				id: 'tab',
				base: null,
				shift: null,
				altgr: null,
				finger: 'L5',
				width: 1.5,
				label: 'Tab',
				kind: 'modifier'
			},
			{ id: 'q', base: 'q', shift: 'Q', altgr: null, finger: 'L5', width: 1, kind: 'char' },
			{ id: 'w', base: 'w', shift: 'W', altgr: null, finger: 'L4', width: 1, kind: 'char' },
			{ id: 'e', base: 'e', shift: 'E', altgr: '€', finger: 'L3', width: 1, kind: 'char' },
			{ id: 'r', base: 'r', shift: 'R', altgr: null, finger: 'L2', width: 1, kind: 'char' },
			{ id: 't', base: 't', shift: 'T', altgr: null, finger: 'L2', width: 1, kind: 'char' },
			{ id: 'y', base: 'y', shift: 'Y', altgr: null, finger: 'R2', width: 1, kind: 'char' },
			{ id: 'u', base: 'u', shift: 'U', altgr: null, finger: 'R2', width: 1, kind: 'char' },
			{ id: 'i', base: 'i', shift: 'I', altgr: null, finger: 'R3', width: 1, kind: 'char' },
			{ id: 'o', base: 'o', shift: 'O', altgr: null, finger: 'R4', width: 1, kind: 'char' },
			{ id: 'p', base: 'p', shift: 'P', altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{ id: 'å', base: 'å', shift: 'Å', altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{ id: 'diaer', base: '¨', shift: '^', altgr: '~', finger: 'R5', width: 1, kind: 'dead' },
			{
				id: 'enter',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R5',
				width: 1.5,
				label: 'Enter',
				kind: 'modifier'
			}
		],
		[
			{
				id: 'caps',
				base: null,
				shift: null,
				altgr: null,
				finger: 'L5',
				width: 1.75,
				label: 'Caps',
				kind: 'modifier'
			},
			{ id: 'a', base: 'a', shift: 'A', altgr: null, finger: 'L5', width: 1, kind: 'char' },
			{ id: 's', base: 's', shift: 'S', altgr: null, finger: 'L4', width: 1, kind: 'char' },
			{ id: 'd', base: 'd', shift: 'D', altgr: null, finger: 'L3', width: 1, kind: 'char' },
			{ id: 'f', base: 'f', shift: 'F', altgr: null, finger: 'L2', width: 1, kind: 'char' },
			{ id: 'g', base: 'g', shift: 'G', altgr: null, finger: 'L2', width: 1, kind: 'char' },
			{ id: 'h', base: 'h', shift: 'H', altgr: null, finger: 'R2', width: 1, kind: 'char' },
			{ id: 'j', base: 'j', shift: 'J', altgr: null, finger: 'R2', width: 1, kind: 'char' },
			{ id: 'k', base: 'k', shift: 'K', altgr: null, finger: 'R3', width: 1, kind: 'char' },
			{ id: 'l', base: 'l', shift: 'L', altgr: null, finger: 'R4', width: 1, kind: 'char' },
			{ id: 'ø', base: 'ø', shift: 'Ø', altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{ id: 'æ', base: 'æ', shift: 'Æ', altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{ id: 'apos', base: "'", shift: '*', altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{
				id: 'enterFiller',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R5',
				width: 1.25,
				label: '',
				kind: 'modifier'
			}
		],
		[
			{
				id: 'shiftL',
				base: null,
				shift: null,
				altgr: null,
				finger: 'L5',
				width: 1.25,
				label: 'Shift',
				kind: 'modifier'
			},
			{ id: 'lt', base: '<', shift: '>', altgr: null, finger: 'L5', width: 1, kind: 'char' },
			{ id: 'z', base: 'z', shift: 'Z', altgr: null, finger: 'L5', width: 1, kind: 'char' },
			{ id: 'x', base: 'x', shift: 'X', altgr: null, finger: 'L4', width: 1, kind: 'char' },
			{ id: 'c', base: 'c', shift: 'C', altgr: null, finger: 'L3', width: 1, kind: 'char' },
			{ id: 'v', base: 'v', shift: 'V', altgr: null, finger: 'L2', width: 1, kind: 'char' },
			{ id: 'b', base: 'b', shift: 'B', altgr: null, finger: 'L2', width: 1, kind: 'char' },
			{ id: 'n', base: 'n', shift: 'N', altgr: null, finger: 'R2', width: 1, kind: 'char' },
			{ id: 'm', base: 'm', shift: 'M', altgr: null, finger: 'R2', width: 1, kind: 'char' },
			{ id: 'comma', base: ',', shift: ';', altgr: null, finger: 'R3', width: 1, kind: 'char' },
			{ id: 'dot', base: '.', shift: ':', altgr: null, finger: 'R4', width: 1, kind: 'char' },
			{ id: 'dash', base: '-', shift: '_', altgr: null, finger: 'R5', width: 1, kind: 'char' },
			{
				id: 'shiftR',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R5',
				width: 2.75,
				label: 'Shift',
				kind: 'modifier'
			}
		],
		[
			{
				id: 'ctrlL',
				base: null,
				shift: null,
				altgr: null,
				finger: 'L5',
				width: 1.25,
				label: 'Ctrl',
				kind: 'modifier'
			},
			{
				id: 'winL',
				base: null,
				shift: null,
				altgr: null,
				finger: 'L5',
				width: 1.25,
				label: '⊞',
				kind: 'modifier'
			},
			{
				id: 'alt',
				base: null,
				shift: null,
				altgr: null,
				finger: 'L1',
				width: 1.25,
				label: 'Alt',
				kind: 'modifier'
			},
			{ id: 'space', base: ' ', shift: null, altgr: null, finger: 'T', width: 6.25, kind: 'space' },
			{
				id: 'altgr',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R1',
				width: 1.25,
				label: 'AltGr',
				kind: 'modifier'
			},
			{
				id: 'winR',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R5',
				width: 1.25,
				label: '⊞',
				kind: 'modifier'
			},
			{
				id: 'menu',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R5',
				width: 1.25,
				label: '☰',
				kind: 'modifier'
			},
			{
				id: 'ctrlR',
				base: null,
				shift: null,
				altgr: null,
				finger: 'R5',
				width: 1.25,
				label: 'Ctrl',
				kind: 'modifier'
			}
		]
	]
};
