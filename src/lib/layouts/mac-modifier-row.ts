import type { KeyDef } from './types';

/**
 * The bottom modifier row shared by both Mac keyboard variants (Norwegian
 * and US) — same key slots, fingers and widths as the PC modifier row, just
 * relabelled Control/Option/Cmd. Mac keyboards have no separate Windows or
 * Menu key, so those two PC slots are dropped rather than relabelled.
 *
 * The key that types special characters (€, {, [, …) keeps the id `altgr`,
 * since `planChar` (see `engine/plan.ts`) looks up the AltGr-layer hold key
 * by that id regardless of platform — on Mac this key is labelled "Option"
 * rather than "AltGr". Real Mac hardware actually puts Command, not
 * Option, in the key immediately next to the space bar; keeping Option
 * there instead preserves the existing right-thumb hold cueing unchanged
 * and keeps every AltGr-layer hint accurate, at the cost of that one key
 * not matching a real keyboard's exact physical position.
 */
export const MAC_MODIFIER_ROW: KeyDef[] = [
	{
		id: 'ctrlL',
		base: null,
		shift: null,
		altgr: null,
		finger: 'L5',
		width: 1.25,
		label: 'Control',
		kind: 'modifier'
	},
	{
		id: 'optL',
		base: null,
		shift: null,
		altgr: null,
		finger: 'L5',
		width: 1.25,
		label: 'Option',
		kind: 'modifier'
	},
	{
		id: 'cmdL',
		base: null,
		shift: null,
		altgr: null,
		finger: 'L1',
		width: 1.25,
		label: 'Cmd',
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
		label: 'Option',
		kind: 'modifier'
	},
	{
		id: 'cmdR',
		base: null,
		shift: null,
		altgr: null,
		finger: 'R5',
		width: 1.25,
		label: 'Cmd',
		kind: 'modifier'
	}
];
