import { describe, expect, it } from 'vitest';
import { migrate } from './migrations';
import { DEFAULT_SETTINGS, emptyStoreData, type StoreData } from './types';

describe('migrate', () => {
	it('returns an empty store for missing or empty storage', () => {
		expect(migrate(undefined)).toEqual(emptyStoreData());
		expect(migrate(null)).toEqual(emptyStoreData());
		expect(migrate({})).toEqual(emptyStoreData());
	});

	it('returns an empty store for garbage input rather than throwing', () => {
		expect(migrate('not an object')).toEqual(emptyStoreData());
		expect(migrate(42)).toEqual(emptyStoreData());
		expect(migrate([1, 2, 3])).toEqual(emptyStoreData());
	});

	it('returns an empty store for an unrecognised future version', () => {
		expect(migrate({ version: 99, chars: {}, sessions: [] })).toEqual(emptyStoreData());
	});

	it('passes through a well-formed current-version payload unchanged', () => {
		const data: StoreData = {
			version: 1,
			chars: { a: { attempts: 10, misses: 2, latencyMs: 1800 } },
			sessions: [
				{
					id: 's1',
					startedAt: 1700000000000,
					durationMs: 60000,
					mode: 'tekst',
					wpm: 42,
					accuracy: 96.5,
					keystrokes: 210,
					topMisses: [{ char: 'k', count: 3 }]
				}
			],
			settings: { ...DEFAULT_SETTINGS, showHands: false }
		};
		expect(migrate(structuredClone(data))).toEqual(data);
	});

	it('drops malformed character stat entries instead of crashing', () => {
		const result = migrate({
			version: 1,
			chars: {
				a: { attempts: 10, misses: 2, latencyMs: 1000 },
				b: { attempts: 'oops' },
				c: null
			},
			sessions: []
		});
		expect(result.chars).toEqual({ a: { attempts: 10, misses: 2, latencyMs: 1000 } });
	});

	it('clamps negative numbers and drops malformed session entries', () => {
		const result = migrate({
			version: 1,
			chars: {},
			sessions: [
				{
					id: 's1',
					startedAt: 1,
					durationMs: -50,
					mode: 'kode',
					wpm: -5,
					accuracy: 250,
					keystrokes: 10,
					topMisses: []
				},
				{ id: 'broken' }
			]
		});
		expect(result.sessions).toHaveLength(1);
		expect(result.sessions[0]).toMatchObject({ durationMs: 0, wpm: 0, accuracy: 100 });
	});

	it('fills in missing settings fields with defaults', () => {
		const result = migrate({
			version: 1,
			chars: {},
			sessions: [],
			settings: { strictMode: false }
		});
		expect(result.settings).toEqual({ ...DEFAULT_SETTINGS, strictMode: false });
	});

	it('round-trips through JSON without loss', () => {
		const original = migrate({
			version: 1,
			chars: { k: { attempts: 5, misses: 1, latencyMs: 900 } },
			sessions: [],
			settings: DEFAULT_SETTINGS
		});
		const roundTripped = migrate(JSON.parse(JSON.stringify(original)));
		expect(roundTripped).toEqual(original);
	});
});
