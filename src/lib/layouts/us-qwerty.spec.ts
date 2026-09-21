import { describe, expect, it } from 'vitest';
import { buildLayoutIndex } from '../engine/char-map';
import { planChar } from '../engine/plan';
import { US_QWERTY_LAYOUT } from './us-qwerty';

const index = buildLayoutIndex(US_QWERTY_LAYOUT);

describe('US QWERTY layout', () => {
	it('maps a plain lowercase letter with no hold', () => {
		expect(planChar('q', index)).toMatchObject({ finger: 'L5', holdKeyId: null });
	});

	it('holds Shift with the opposite hand pinky for an uppercase letter', () => {
		// q is on the left hand, so Shift must be the right pinky.
		expect(planChar('Q', index)).toMatchObject({ holdKeyId: 'shiftR', holdFinger: 'R5' });
		// ; is on the right hand (R5), so Shift must be the left pinky.
		expect(planChar(':', index)).toMatchObject({
			finger: 'R5',
			holdKeyId: 'shiftL',
			holdFinger: 'L5'
		});
	});

	it('assigns 6 and 7 to the right index finger, standard touch-typing style', () => {
		expect(planChar('6', index)).toMatchObject({ finger: 'R2' });
		expect(planChar('7', index)).toMatchObject({ finger: 'R2' });
	});

	it('has no AltGr layer and no dead keys', () => {
		for (const row of US_QWERTY_LAYOUT.rows) {
			for (const key of row) {
				expect(key.altgr).toBeNull();
				expect(key.kind).not.toBe('dead');
			}
		}
	});

	it('maps space to the space key for either thumb', () => {
		expect(planChar(' ', index)).toMatchObject({ keyId: 'space', finger: 'T' });
	});
});
