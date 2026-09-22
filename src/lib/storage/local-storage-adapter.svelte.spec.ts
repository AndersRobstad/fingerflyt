import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageAdapter } from './local-storage-adapter';

const STORAGE_KEY = 'fingerflyt:v1';
const MAC_UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const WINDOWS_UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function setUserAgent(ua: string): void {
	Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
}

beforeEach(() => {
	localStorage.clear();
});

// This only exercises `LocalStorageAdapter` under a real browser-like
// environment (jsdom + the `browser` resolve condition — see
// vite.config.ts), since `browser` from `$app/environment` is statically
// false under plain Node, short-circuiting the whole code path this file
// tests.
describe('LocalStorageAdapter first-visit platform pre-fill', () => {
	it('defaults to no-pc when there is no persisted data and the user agent is not Apple', async () => {
		setUserAgent(WINDOWS_UA);
		const data = await new LocalStorageAdapter().load();
		expect(data.settings.layout).toBe('no-pc');
	});

	it('pre-fills no-mac when there is no persisted data and the user agent is a Mac', async () => {
		setUserAgent(MAC_UA);
		const data = await new LocalStorageAdapter().load();
		expect(data.settings.layout).toBe('no-mac');
	});

	it('never overrides an already-persisted layout choice, even on a Mac', async () => {
		setUserAgent(MAC_UA);
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				version: 1,
				chars: {},
				sessions: [],
				settings: { layout: 'us-qwerty' }
			})
		);
		const data = await new LocalStorageAdapter().load();
		expect(data.settings.layout).toBe('us-qwerty');
	});
});
