/** Local-time calendar day key, e.g. "2026-09-21". Used so streaks and
 * "today" summaries follow the user's own clock, not UTC. */
export function dayKey(epochMs: number): string {
	const d = new Date(epochMs);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function addDays(key: string, delta: number): string {
	const [y, m, d] = key.split('-').map(Number);
	const date = new Date(y, m - 1, d);
	date.setDate(date.getDate() + delta);
	return dayKey(date.getTime());
}
