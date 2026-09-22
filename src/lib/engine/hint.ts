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

/** The name to use for the modifier a hint says to hold. Shift is named by
 * hand ("venstre Shift") since either pinky can hold it; every other hold
 * key (AltGr on PC, Option on Mac) is named from the layout's own key
 * label, so this reads correctly on whichever layout is active without the
 * two platforms' wording needing to be listed here. */
function holdLabel(
	index: LayoutIndex,
	holdKeyId: string,
	holdFinger: CharPlan['holdFinger']
): string {
	if (holdKeyId === 'shiftL' || holdKeyId === 'shiftR') {
		return `${holdFinger?.startsWith('L') ? 'venstre' : 'høyre'} Shift`;
	}
	return index.keysById.get(holdKeyId)?.label ?? holdKeyId;
}

export function buildHint(index: LayoutIndex, plan: CharPlan): Hint {
	const keyName = keyDisplayName(index, plan);
	const finger = plan.finger === 'T' ? 'Tommel' : capitalize(fingerLabel(plan.finger));

	if (plan.holdKeyId && plan.holdFinger) {
		const instruction = `Hold ${holdLabel(index, plan.holdKeyId, plan.holdFinger)} med ${fingerLabel(plan.holdFinger)}, og trykk ${keyName}.`;
		return { fingerLabel: finger, instruction };
	}

	return { fingerLabel: finger, instruction: `Trykk ${keyName}.` };
}
