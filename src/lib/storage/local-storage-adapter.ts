import { browser } from '$app/environment';
import { emptyStoreData, type ProgressStore, type StoreData } from './types';
import { migrate } from './migrations';

const STORAGE_KEY = 'fingerflyt:v1';

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
			if (!raw) return emptyStoreData();
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
