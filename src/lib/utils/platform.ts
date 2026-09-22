/** True when the browser's user-agent string indicates an Apple device
 * (Mac, or iPad/iPhone — iPadOS Safari reports "Macintosh" by default,
 * which conveniently also covers an iPad used with a physical Magic
 * Keyboard). Used only to pre-fill the keyboard layout's platform the very
 * first time someone opens the app — never to gate functionality. */
export function isApplePlatform(userAgent: string): boolean {
	return /Macintosh|Mac OS X|iPad|iPhone|iPod/.test(userAgent);
}
