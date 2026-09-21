import type { FingerClass, FingerId, FingerMeta } from './types';

export const FINGERS: Record<FingerId, FingerMeta> = {
	L5: { hand: 'venstre', cls: 'pinky' },
	L4: { hand: 'venstre', cls: 'ring' },
	L3: { hand: 'venstre', cls: 'middle' },
	L2: { hand: 'venstre', cls: 'index' },
	L1: { hand: 'venstre', cls: 'thumb' },
	R1: { hand: 'høyre', cls: 'thumb' },
	R2: { hand: 'høyre', cls: 'index' },
	R3: { hand: 'høyre', cls: 'middle' },
	R4: { hand: 'høyre', cls: 'ring' },
	R5: { hand: 'høyre', cls: 'pinky' },
	T: { hand: '', cls: 'thumb' }
};

const CLASS_NAME: Record<FingerClass, string> = {
	pinky: 'lillefinger',
	ring: 'ringfinger',
	middle: 'langfinger',
	index: 'pekefinger',
	thumb: 'tommel'
};

/** Bokmål name of the finger's anatomy, without which hand ("tommel"). */
export function fingerName(id: FingerId): string {
	return CLASS_NAME[FINGERS[id].cls];
}

/** Full bokmål label including hand, e.g. "høyre langfinger". "T" (either
 * thumb) omits the hand since both are equally correct. */
export function fingerLabel(id: FingerId): string {
	const { hand } = FINGERS[id];
	return hand ? `${hand} ${fingerName(id)}` : fingerName(id);
}

/** CSS custom property carrying this finger's colour. Defined in app.css. */
export function fingerColorVar(id: FingerId): string {
	return `var(--finger-${FINGERS[id].cls})`;
}

export const FINGER_CLASS_ORDER: FingerClass[] = ['pinky', 'ring', 'middle', 'index', 'thumb'];

export const FINGER_CLASS_LABEL: Record<FingerClass, string> = CLASS_NAME;

/** Which finger(s) to visually highlight for a plan's target finger. Space
 * ("T") is reachable by either thumb, so both are highlighted. */
export function highlightFingers(id: FingerId): FingerId[] {
	return id === 'T' ? ['L1', 'R1'] : [id];
}
