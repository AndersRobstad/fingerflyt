import { browser } from '$app/environment';
import type { Language } from '../types';

const loading: Partial<Record<Language, boolean>> = {};

/**
 * Lazily upgrades each language's practice word pool from the small,
 * bundled seed list to the larger frequency-ranked list shipped as a
 * static asset (`/wordlists/{lang}.json`, built by
 * `scripts/build-wordlists.mjs`). Fetched once per language, only when a
 * word-based mode is actually used; falls back silently to the seed list
 * if the fetch fails.
 */
class WordBankState {
	loaded = $state<Partial<Record<Language, string[]>>>({});

	ensure(lang: Language): void {
		if (!browser || this.loaded[lang] || loading[lang]) return;
		loading[lang] = true;
		fetch(`/wordlists/${lang}.json`)
			.then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
			.then((words: unknown) => {
				if (Array.isArray(words) && words.every((w) => typeof w === 'string') && words.length > 0) {
					this.loaded = { ...this.loaded, [lang]: words as string[] };
				}
			})
			.catch(() => {
				// Offline, blocked, or missing asset: keep using the bundled seed.
			})
			.finally(() => delete loading[lang]);
	}

	get(lang: Language): string[] | null {
		return this.loaded[lang] ?? null;
	}
}

export const wordBankState = new WordBankState();
