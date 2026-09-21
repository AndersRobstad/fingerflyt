import { describe, expect, it } from 'vitest';
import { NO_PC_LAYOUT } from '../layouts/no-pc';
import { buildLayoutIndex, isTypable } from './char-map';
import { planChar, keyDisplayName } from './plan';
import { buildHint } from './hint';

const index = buildLayoutIndex(NO_PC_LAYOUT);

describe('planChar', () => {
	it('maps a plain lowercase letter to its key and finger with no hold', () => {
		const plan = planChar('k', index);
		expect(plan).toEqual({
			char: 'k',
			keyId: 'k',
			finger: 'R3',
			holdKeyId: null,
			holdFinger: null
		});
	});

	it('maps an uppercase letter to Shift held by the opposite hand pinky', () => {
		// k is on the right hand (R3), so Shift must be the LEFT pinky.
		const plan = planChar('K', index);
		expect(plan).toMatchObject({ keyId: 'k', finger: 'R3', holdKeyId: 'shiftL', holdFinger: 'L5' });
	});

	it('uses the right pinky for Shift when the target key is on the left hand', () => {
		// Q is on the left hand (L5), so Shift must be the RIGHT pinky.
		const plan = planChar('Q', index);
		expect(plan).toMatchObject({ keyId: 'q', finger: 'L5', holdKeyId: 'shiftR', holdFinger: 'R5' });
	});

	it('deliberately assigns the digit 6 to the left index finger', () => {
		expect(planChar('6', index)).toMatchObject({ finger: 'L2' });
	});

	it('assigns 7 (the mirror digit) to the right index finger', () => {
		expect(planChar('7', index)).toMatchObject({ finger: 'R2' });
	});

	it('maps an AltGr character to AltGr held by the right thumb', () => {
		const plan = planChar('{', index); // AltGr+7
		expect(plan).toMatchObject({ keyId: '7', finger: 'R2', holdKeyId: 'altgr', holdFinger: 'R1' });
	});

	it('maps space to the space key, highlighted for either thumb', () => {
		const plan = planChar(' ', index);
		expect(plan).toMatchObject({ keyId: 'space', finger: 'T', holdKeyId: null });
	});

	it('returns null for a dead-key character', () => {
		expect(planChar('¨', index)).toBeNull();
		expect(planChar('^', index)).toBeNull();
		expect(planChar('~', index)).toBeNull();
	});

	it('returns null for a character the layout cannot produce', () => {
		expect(planChar('`', index)).toBeNull();
		expect(planChar('€uro', index)).toBeNull();
	});

	it('handles Norwegian letters æ, ø and å in both cases', () => {
		expect(planChar('æ', index)).toMatchObject({ keyId: 'æ', finger: 'R5' });
		expect(planChar('Æ', index)).toMatchObject({ keyId: 'æ', finger: 'R5', holdKeyId: 'shiftL' });
		expect(planChar('ø', index)).toMatchObject({ keyId: 'ø', finger: 'R5' });
		expect(planChar('å', index)).toMatchObject({ keyId: 'å', finger: 'R5' });
	});
});

describe('isTypable', () => {
	it('is false for dead keys and unmapped characters', () => {
		expect(isTypable(index, '¨')).toBe(false);
		expect(isTypable(index, '`')).toBe(false);
	});

	it('is true for every plain letter, digit and the space', () => {
		for (const c of 'abcdefghijklmnopqrstuvwxyzæøå0123456789 ') {
			expect(isTypable(index, c)).toBe(true);
		}
	});
});

describe('keyDisplayName', () => {
	it('names a letter key by its uppercase letter, regardless of case typed', () => {
		const plan = planChar('k', index)!;
		expect(keyDisplayName(index, plan)).toBe('K');
	});

	it('names a symbol key by the character typed with no modifier', () => {
		const plan = planChar('!', index)!; // Shift+1
		expect(keyDisplayName(index, plan)).toBe('1');
	});

	it('names the space key "mellomrom"', () => {
		const plan = planChar(' ', index)!;
		expect(keyDisplayName(index, plan)).toBe('mellomrom');
	});
});

describe('buildHint', () => {
	it('matches the spec example for uppercase K', () => {
		const plan = planChar('K', index)!;
		const hint = buildHint(index, plan);
		expect(hint.instruction).toBe('Hold venstre Shift med venstre lillefinger, og trykk K.');
	});

	it('produces a simple instruction with no hold', () => {
		const plan = planChar('j', index)!;
		const hint = buildHint(index, plan);
		expect(hint.instruction).toBe('Trykk J.');
		expect(hint.fingerLabel).toBe('Høyre pekefinger');
	});

	it('describes AltGr characters', () => {
		const plan = planChar('{', index)!;
		const hint = buildHint(index, plan);
		expect(hint.instruction).toBe('Hold AltGr med høyre tommel, og trykk 7.');
	});
});
