import { browser } from '$app/environment';
import { layoutLanguage, resolveLayoutId } from '../layouts';
import { isApplePlatform } from '../utils/platform';
import { emptyStoreData, type ProgressStore, type StoreData } from './types';
import { migrate } from './migrations';

const STORAGE_KEY = 'fingerflyt:v1';

/** The very first time someone opens the app (no persisted data at all
 * yet), pre-fill the platform half of the keyboard layout from their user
 * agent — Mac and Windows keyboards genuinely differ (Cmd/Option vs
 * Ctrl/Alt). This only ever applies once: as soon as any settings are
 * saved, the persisted value takes over, and an explicit choice in
 * settings is never overwritten. */
function firstVisitData(): StoreData {
	const data = emptyStoreData();
	if (isApplePlatform(navigator.userAgent)) {
		data.settings.layout = resolveLayoutId(layoutLanguage(data.settings.layout), 'mac');
	}
	return data;
}

/**
 * `ProgressStore` backed by `localStorage`. Every read and write is wrapped
 * in try/catch so the app keeps working with in-memory defaults if storage
 * is unavailable (private browsing, quota exceeded, disabled, SSR).
 */
export class LocalStorageAdapter implements ProgressStore {
	async load(): Promise<StoreData> {
		if (!browser) return emptyStoreData();
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (!raw) return firstVisitData();
			return migrate(JSON.parse(raw));
		} catch {
			return emptyStoreData();
		}
	}

	async save(data: StoreData): Promise<void> {
		if (!browser) return;
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch {
			// Storage full or unavailable: progress for this session is lost on
			// reload, but the app keeps working.
		}
	}

	async clear(): Promise<void> {
		if (!browser) return;
		try {
			window.localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Nothing to do if storage is unavailable.
		}
	}
}
