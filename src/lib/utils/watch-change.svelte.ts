/**
 * Runs `onChange` only when `read()`'s value has genuinely changed since
 * the last time this effect ran — never on the first run, and never when
 * the effect merely re-runs for some unrelated reason (its most common
 * cause: `read()` dereferences a path off a larger object, such as
 * `progressStore.data.settings.layout`, and that object gets reassigned
 * wholesale for a reason that has nothing to do with this particular
 * value — loading persisted state on mount, or any other sibling setting
 * changing).
 *
 * Must be called during component/effect initialization (it calls
 * `$effect` itself). `T` must never legitimately be `undefined`, since
 * that's used as the "no previous run yet" sentinel.
 */
export function watchChange<T>(read: () => T, onChange: (current: T) => void): void {
	let previous: T | undefined;
	$effect(() => {
		const current = read();
		if (previous !== undefined && previous !== current) onChange(current);
		previous = current;
	});
}
