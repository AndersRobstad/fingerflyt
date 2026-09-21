import type { CharPlan } from '../layouts/types';
import { fingerLabel } from '../fingers';
import { capitalize } from '../utils/text';
import type { LayoutIndex } from './char-map';
import { keyDisplayName } from './plan';

export interface Hint {
	/** Bokmål name of the finger that presses the target key, capitalised. */
	fingerLabel: string;
	/** Full instruction sentence, e.g. "Hold venstre Shift med venstre
	 * lillefinger, og trykk K." */
	instruction: string;
}

const HOLD_LABEL: Record<string, string> = {
	shiftL: 'venstre Shift',
	shiftR: 'høyre Shift',
	altgr: 'AltGr'
};

export function buildHint(index: LayoutIndex, plan: CharPlan): Hint {
	const keyName = keyDisplayName(index, plan);
	const finger = plan.finger === 'T' ? 'Tommel' : capitalize(fingerLabel(plan.finger));

	if (plan.holdKeyId && plan.holdFinger) {
		const holdLabel = HOLD_LABEL[plan.holdKeyId] ?? plan.holdKeyId;
		const instruction = `Hold ${holdLabel} med ${fingerLabel(plan.holdFinger)}, og trykk ${keyName}.`;
		return { fingerLabel: finger, instruction };
	}

	return { fingerLabel: finger, instruction: `Trykk ${keyName}.` };
}
