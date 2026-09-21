/** One of the five fingers used for cueing, on either hand. `T` stands for
 * "either thumb", used for the space bar which both thumbs may press. */
export type FingerId = 'L5' | 'L4' | 'L3' | 'L2' | 'L1' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'T';

/** The five colour/anatomy classes fingers fall into, shared by both hands. */
export type FingerClass = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

export type Hand = 'venstre' | 'høyre' | '';

export interface FingerMeta {
	hand: Hand;
	cls: FingerClass;
}

export type PracticeMode = 'tekst' | 'kode' | 'svake';

export type LayoutId = 'no-pc' | 'us-qwerty';

/** Which language a layout's practice text/word content should be drawn
 * in. See {@link ../layouts/layoutLanguage}. */
export type Language = 'nb' | 'en';
