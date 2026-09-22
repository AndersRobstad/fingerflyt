import { describe, expect, it } from 'vitest';
import { isApplePlatform } from './platform';

const MAC_UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const IPAD_UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const WINDOWS_UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const LINUX_UA =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ANDROID_UA =
	'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

describe('isApplePlatform', () => {
	it('is true for a Mac user agent', () => {
		expect(isApplePlatform(MAC_UA)).toBe(true);
	});

	it('is true for an iPad (which reports as Macintosh in Safari by default)', () => {
		expect(isApplePlatform(IPAD_UA)).toBe(true);
	});

	it('is false for Windows, Linux and Android user agents', () => {
		expect(isApplePlatform(WINDOWS_UA)).toBe(false);
		expect(isApplePlatform(LINUX_UA)).toBe(false);
		expect(isApplePlatform(ANDROID_UA)).toBe(false);
	});

	it('is false for an empty string', () => {
		expect(isApplePlatform('')).toBe(false);
	});
});
