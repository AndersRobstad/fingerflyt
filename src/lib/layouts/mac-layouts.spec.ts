import { describe, expect, it } from 'vitest';
import { buildLayoutIndex, isTypable } from '../engine/char-map';
import { buildHint } from '../engine/hint';
import { planChar } from '../engine/plan';
import { layoutLanguage, layoutPlatform, resolveLayoutId } from './index';
import { NO_MAC_LAYOUT } from './no-mac';
import { NO_PC_LAYOUT } from './no-pc';
import { US_MAC_LAYOUT } from './us-mac';
import { US_QWERTY_LAYOUT } from './us-qwerty';

describe('resolveLayoutId / layoutLanguage / layoutPlatform', () => {
	it('round-trips every layout id through language + platform', () => {
		for (const id of ['no-pc', 'no-mac', 'us-qwerty', 'us-mac'] as const) {
			expect(resolveLayoutId(layoutLanguage(id), layoutPlatform(id))).toBe(id);
		}
	});

	it('resolves the four language/platform combinations correctly', () => {
		expect(resolveLayoutId('nb', 'pc')).toBe('no-pc');
		expect(resolveLayoutId('nb', 'mac')).toBe('no-mac');
		expect(resolveLayoutId('en', 'pc')).toBe('us-qwerty');
		expect(resolveLayoutId('en', 'mac')).toBe('us-mac');
	});
});

describe('Norwegian Mac layout', () => {
	const index = buildLayoutIndex(NO_MAC_LAYOUT);
	const pcIndex = buildLayoutIndex(NO_PC_LAYOUT);

	it('types every character the same as the PC layout (only the modifier row differs)', () => {
		for (const [char, entry] of pcIndex.charMap) {
			expect(index.charMap.get(char)).toEqual(entry);
		}
	});

	it('has no Windows/Menu keys, unlike the PC layout', () => {
		const ids = new Set(index.layout.rows.flat().map((k) => k.id));
		expect(ids.has('winL')).toBe(false);
		expect(ids.has('winR')).toBe(false);
		expect(ids.has('menu')).toBe(false);
		expect(ids.has('ctrlR')).toBe(false);
	});

	it('labels the special-character modifier "Option" instead of "AltGr"', () => {
		const key = index.keysById.get('altgr');
		expect(key?.label).toBe('Option');
	});

	it('describes an AltGr-layer character as holding Option', () => {
		const plan = planChar('{', index)!; // AltGr+7
		expect(plan).toMatchObject({ holdKeyId: 'altgr', holdFinger: 'R1' });
		const hint = buildHint(index, plan);
		expect(hint.instruction).toBe('Hold Option med høyre tommel, og trykk 7.');
	});

	it('still holds Shift the same way as the PC layout', () => {
		const plan = planChar('K', index)!;
		const hint = buildHint(index, plan);
		expect(hint.instruction).toBe('Hold venstre Shift med venstre lillefinger, og trykk K.');
	});
});

describe('US Mac layout', () => {
	const index = buildLayoutIndex(US_MAC_LAYOUT);
	const pcIndex = buildLayoutIndex(US_QWERTY_LAYOUT);

	it('types every character the same as the US PC layout', () => {
		for (const [char, entry] of pcIndex.charMap) {
			expect(index.charMap.get(char)).toEqual(entry);
		}
	});

	it('has no AltGr layer, matching the US PC layout', () => {
		for (const row of US_MAC_LAYOUT.rows) {
			for (const key of row) {
				expect(key.altgr).toBeNull();
			}
		}
	});

	it('labels the thumb-adjacent keys Cmd/Option instead of Alt/Win', () => {
		const cmdKey = index.keysById.get('cmdL');
		expect(cmdKey?.label).toBe('Cmd');
		const optKey = index.keysById.get('altgr');
		expect(optKey?.label).toBe('Option');
	});

	it('is fully typable for every plain letter, digit and the space', () => {
		for (const c of 'abcdefghijklmnopqrstuvwxyz0123456789 ') {
			expect(isTypable(index, c)).toBe(true);
		}
	});
});
